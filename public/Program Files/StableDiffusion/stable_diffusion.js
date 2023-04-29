/**
 * Wrapper to handle PNDM scheduler
 */
class TVMPNDMScheduler {
  constructor(schedulerConsts, latentShape, tvm, device, vm) {
    this.timestep = [];
    this.sampleCoeff = [];
    this.alphaDiff = [];
    this.modelOutputDenomCoeff = [];
    this.ets = [];
    this.schedulerFunc = [];
    this.currSample = undefined;
    this.tvm = tvm;

    // prebuild constants
    // principle: always detach for class members
    // to avoid recycling output scope.
    function loadConsts(output, dtype, input) {
      for (let t = 0; t < input.length; ++t) {
        output.push(
          tvm.detachFromCurrentScope(
            tvm.empty([], dtype, device).copyFrom([input[t]])
          )
        );
      }
    }
    loadConsts(this.timestep, "int32", schedulerConsts["timesteps"]);
    loadConsts(this.sampleCoeff, "float32", schedulerConsts["sample_coeff"]);
    loadConsts(this.alphaDiff, "float32", schedulerConsts["alpha_diff"]);
    loadConsts(
      this.modelOutputDenomCoeff, "float32",
      schedulerConsts["model_output_denom_coeff"]);

    for (let i = 0; i < 4; ++i) {
      this.ets.push(
        this.tvm.detachFromCurrentScope(
          this.tvm.empty(latentShape, "float32", device)
        )
      );
    }

    for (let i = 0; i < 5; ++i) {
      this.schedulerFunc.push(
        tvm.detachFromCurrentScope(
          vm.getFunction("pndm_scheduler_step_" + i.toString())
        )
      );
    }
  }

  dispose() {
    for (let t = 0; t < this.timestep.length; ++t) {
      this.timestep[t].dispose();
      this.sampleCoeff[t].dispose();
      this.alphaDiff[t].dispose();
      this.modelOutputDenomCoeff[t].dispose();
    }

    for (let i = 0; i < this.schedulerFunc.length; ++i) {
      this.schedulerFunc[i].dispose();
    }

    if (this.currSample) {
      this.currSample.dispose();
    }
    for (let i = 0; i < this.ets.length; ++i) {
      this.ets[i].dispose();
    }
  }

  step(modelOutput, sample, counter) {
    // keep running history of last four inputs
    if (counter != 1) {
      this.ets.shift();
      this.ets.push(this.tvm.detachFromCurrentScope(
        modelOutput
      ));
    }
    if (counter == 0) {
      this.currSample = this.tvm.detachFromCurrentScope(
        sample
      );
    } else if (counter == 1) {
      sample = this.tvm.attachToCurrentScope(this.currSample);
      this.currSample = undefined;
    }

    const findex = counter < 4 ? counter : 4;
    const prevLatents = this.schedulerFunc[findex](
      sample,
      modelOutput,
      this.sampleCoeff[counter],
      this.alphaDiff[counter],
      this.modelOutputDenomCoeff[counter],
      this.ets[0],
      this.ets[1],
      this.ets[2],
      this.ets[3]
    );
    return prevLatents;
  }
}

/**
 * Wrapper to handle multistep DPM-solver scheduler
 */
class TVMDPMSolverMultistepScheduler {
  constructor(schedulerConsts, latentShape, tvm, device, vm) {
    this.timestep = [];
    this.alpha = [];
    this.sigma = [];
    this.c0 = [];
    this.c1 = [];
    this.c2 = [];
    this.lastModelOutput = undefined;
    this.convertModelOutputFunc = undefined;
    this.stepFunc = undefined;
    this.tvm = tvm;

    // prebuild constants
    // principle: always detach for class members
    // to avoid recycling output scope.
    function loadConsts(output, dtype, input) {
      for (let t = 0; t < input.length; ++t) {
        output.push(
          tvm.detachFromCurrentScope(
            tvm.empty([], dtype, device).copyFrom([input[t]])
          )
        );
      }
    }
    loadConsts(this.timestep, "int32", schedulerConsts["timesteps"]);
    loadConsts(this.alpha, "float32", schedulerConsts["alpha"]);
    loadConsts(this.sigma, "float32", schedulerConsts["sigma"]);
    loadConsts(this.c0, "float32", schedulerConsts["c0"]);
    loadConsts(this.c1, "float32", schedulerConsts["c1"]);
    loadConsts(this.c2, "float32", schedulerConsts["c2"]);

    this.lastModelOutput = this.tvm.detachFromCurrentScope(
      this.tvm.empty(latentShape, "float32", device)
    )
    this.convertModelOutputFunc = tvm.detachFromCurrentScope(
      vm.getFunction("dpm_solver_multistep_scheduler_convert_model_output")
    )
    this.stepFunc = tvm.detachFromCurrentScope(
      vm.getFunction("dpm_solver_multistep_scheduler_step")
    )
  }

  dispose() {
    for (let t = 0; t < this.timestep.length; ++t) {
      this.timestep[t].dispose();
      this.alpha[t].dispose();
      this.sigma[t].dispose();
      this.c0[t].dispose();
      this.c1[t].dispose();
      this.c2[t].dispose();
    }

    this.lastModelOutput.dispose();
    this.convertModelOutputFunc.dispose();
    this.stepFunc.dispose();
  }

  step(modelOutput, sample, counter) {
    modelOutput = this.convertModelOutputFunc(sample, modelOutput, this.alpha[counter], this.sigma[counter])
    const prevLatents = this.stepFunc(
      sample,
      modelOutput,
      this.lastModelOutput,
      this.c0[counter],
      this.c1[counter],
      this.c2[counter],
    );
    this.lastModelOutput = this.tvm.detachFromCurrentScope(
      modelOutput
    );

    return prevLatents;
  }
}

class StableDiffusionPipeline {
  constructor(tvm, tokenizer, schedulerConsts, cacheMetadata) {
    if (cacheMetadata == undefined) {
      throw Error("Expect cacheMetadata");
    }
    this.tvm = tvm;
    this.tokenizer = tokenizer;
    this.maxTokenLength = 77;
    this.logger = globalThis.tvmjsGlobalEnv.logger || console.log;

    this.device = this.tvm.webgpu();
    this.tvm.bindCanvas(globalThis.tvmjsGlobalEnv.canvas);
    // VM functions
    this.vm = this.tvm.detachFromCurrentScope(
      this.tvm.createVirtualMachine(this.device)
    );

    this.schedulerConsts = schedulerConsts;
    this.clipToTextEmbeddings = this.tvm.detachFromCurrentScope(
      this.vm.getFunction("clip")
    );
    this.clipParams = this.tvm.detachFromCurrentScope(
      this.tvm.getParamsFromCache("clip", cacheMetadata.clipParamSize)
    );
    this.unetLatentsToNoisePred = this.tvm.detachFromCurrentScope(
      this.vm.getFunction("unet")
    );
    this.unetParams = this.tvm.detachFromCurrentScope(
      this.tvm.getParamsFromCache("unet", cacheMetadata.unetParamSize)
    );
    this.vaeToImage = this.tvm.detachFromCurrentScope(
      this.vm.getFunction("vae")
    );
    this.vaeParams = this.tvm.detachFromCurrentScope(
      this.tvm.getParamsFromCache("vae", cacheMetadata.vaeParamSize)
    );
    this.imageToRGBA = this.tvm.detachFromCurrentScope(
      this.vm.getFunction("image_to_rgba")
    );
    this.concatEmbeddings = this.tvm.detachFromCurrentScope(
      this.vm.getFunction("concat_embeddings")
    );
  }

  dispose() {
    // note: tvm instance is not owned by this class
    this.concatEmbeddings.dispose();
    this.imageToRGBA.dispose()
    this.vaeParams.dispose();
    this.vaeToImage.dispose();
    this.unetParams.dispose();
    this.unetLatentsToNoisePred.dispose();
    this.clipParams.dispose();
    this.clipToTextEmbeddings.dispose();
    this.vm.dispose();
  }

  /**
   * Tokenize the prompt to TVMNDArray.
   * @param prompt Input prompt
   * @returns The text id NDArray.
   */
  tokenize(prompt) {
    const encoded = this.tokenizer.encode(prompt, true).input_ids;
    const inputIDs = new Int32Array(this.maxTokenLength);

    if (encoded.length < this.maxTokenLength) {
      inputIDs.set(encoded);
      const lastTok = encoded[encoded.length - 1];
      inputIDs.fill(lastTok, encoded.length, inputIDs.length);
    } else {
      inputIDs.set(encoded.slice(0, this.maxTokenLength));
    }
    return this.tvm.empty([1, this.maxTokenLength], "int32", this.device).copyFrom(inputIDs);
  }

  /**
   * async preload webgpu pipelines when possible.
   */
  async asyncLoadWebGPUPiplines() {
    await this.tvm.asyncLoadWebGPUPiplines(this.vm.getInternalModule());
  }

  /**
   * Run generation pipeline.
   *
   * @param prompt Input prompt.
   * @param negPrompt Input negative prompt.
   * @param progressCallback Callback to check progress.
   * @param schedulerId The integer ID of the scheduler to use.
   * - 0 for multi-step DPM solver,
   * - 1 for PNDM solver.
   * @param vaeCycle optionally draw VAE result every cycle iterations.
   * @param beginRenderVae Begin rendering VAE after skipping these warmup runs.
   */
  async generate(
    prompt,
    negPrompt = "",
    progressCallback = undefined,
    schedulerId = 0,
    vaeCycle = -1,
    beginRenderVae = 10
  ) {
    // Principle: beginScope/endScope in synchronized blocks,
    // this helps to recycle intermediate memories
    // detach states that needs to go across async boundaries.
    //--------------------------
    // Stage 0: CLIP
    //--------------------------
    this.tvm.beginScope();
    // get latents
    const latentShape = [1, 4, 64, 64];

    var unetNumSteps;
    if (schedulerId == 0) {
      scheduler = new TVMDPMSolverMultistepScheduler(
        this.schedulerConsts[0], latentShape, this.tvm, this.device, this.vm);
      unetNumSteps = this.schedulerConsts[0]["num_steps"];
    } else {
      scheduler = new TVMPNDMScheduler(
        this.schedulerConsts[1], latentShape, this.tvm, this.device, this.vm);
      unetNumSteps = this.schedulerConsts[1]["num_steps"];
    }
    const totalNumSteps = unetNumSteps + 2;

    if (progressCallback !== undefined) {
      progressCallback("clip", 0, 1, totalNumSteps);
    }

    const embeddings = this.tvm.withNewScope(() => {
      let posInputIDs = this.tokenize(prompt);
      let negInputIDs = this.tokenize(negPrompt);
      const posEmbeddings = this.clipToTextEmbeddings(
        posInputIDs, this.clipParams);
      const negEmbeddings = this.clipToTextEmbeddings(
        negInputIDs, this.clipParams);
      // maintain new latents
      return this.tvm.detachFromCurrentScope(
        this.concatEmbeddings(negEmbeddings, posEmbeddings)
      );
    });
    // use uniform distribution with same variance as normal(0, 1)
    const scale = Math.sqrt(12) / 2;
    let latents = this.tvm.detachFromCurrentScope(
      this.tvm.uniform(latentShape, -scale, scale, this.tvm.webgpu())
    );
    this.tvm.endScope();
    //---------------------------
    // Stage 1: UNet + Scheduler
    //---------------------------
    if (vaeCycle != -1) {
      // show first frame
      this.tvm.withNewScope(() => {
        const image = this.vaeToImage(latents, this.vaeParams);
        this.tvm.showImage(this.imageToRGBA(image));
      });
      await this.device.sync();
    }
    vaeCycle = vaeCycle == -1 ? unetNumSteps : vaeCycle;
    let lastSync = undefined;

    for (let counter = 0; counter < unetNumSteps; ++counter) {
      if (progressCallback !== undefined) {
        progressCallback("unet", counter, unetNumSteps, totalNumSteps);
      }
      const timestep = scheduler.timestep[counter];
      // recycle noisePred, track latents manually
      const newLatents = this.tvm.withNewScope(() => {
        this.tvm.attachToCurrentScope(latents);
        const noisePred = this.unetLatentsToNoisePred(
          latents, timestep, embeddings, this.unetParams);
        // maintain new latents
        return this.tvm.detachFromCurrentScope(
          scheduler.step(noisePred, latents, counter)
        );
      });
      latents = newLatents;
      // use skip one sync, although likely not as useful.
      if (lastSync !== undefined) {
        await lastSync;
      }
      // async event checker
      lastSync = this.device.sync();

      // Optionally, we can draw intermediate result of VAE.
      if ((counter + 1) % vaeCycle == 0 &&
        (counter + 1) != unetNumSteps &&
        counter >= beginRenderVae) {
        this.tvm.withNewScope(() => {
          const image = this.vaeToImage(latents, this.vaeParams);
          this.tvm.showImage(this.imageToRGBA(image));
        });
        await this.device.sync();
      }
    }
    scheduler.dispose();
    embeddings.dispose();
    //-----------------------------
    // Stage 2: VAE and draw image
    //-----------------------------
    if (progressCallback !== undefined) {
      progressCallback("vae", 0, 1, totalNumSteps);
    }
    this.tvm.withNewScope(() => {
      const image = this.vaeToImage(latents, this.vaeParams);
      this.tvm.showImage(this.imageToRGBA(image));
    });
    latents.dispose();
    await this.device.sync();
    if (progressCallback !== undefined) {
      progressCallback("vae", 1, 1, totalNumSteps);
    }
  }

  clearCanvas() {
    this.tvm.clearCanvas();
  }
};

/**
 * A instance that can be used to facilitate deployment.
 */
class StableDiffusionInstance {
  constructor() {
    this.tvm = undefined;
    this.pipeline = undefined;
    this.config = undefined;
    this.generateInProgress = false;
    this.logger = globalThis.tvmjsGlobalEnv.logger || console.log;
  }
  /**
   * Initialize TVM
   * @param wasmUrl URL to wasm source.
   * @param cacheUrl URL to NDArray cache.
   * @param logger Custom logger.
   */
  async #asyncInitTVM(wasmUrl, cacheUrl) {
    if (this.tvm !== undefined) {
      return;
    }
    this.logger = globalThis.tvmjsGlobalEnv.logger || console.log;

    const wasmSource = await (
      await fetch(wasmUrl)
    ).arrayBuffer();
    const tvm = await tvmjs.instantiate(
      new Uint8Array(wasmSource),
      new EmccWASI(),
      this.logger
    );
    // initialize WebGPU
    try {
      const output = await tvmjs.detectGPUDevice();
      if (output !== undefined) {
        var label = "WebGPU";
        if (output.adapterInfo.description.length != 0) {
          label += " - " + output.adapterInfo.description;
        } else {
          label += " - " + output.adapterInfo.vendor;
        }
        this.logger("[init]", "Initialize GPU device: " + label);
        tvm.initWebGPU(output.device);
      } else {
        this.logger("[error]", "This browser env do not support WebGPU");
        this.reset();
        throw Error("This browser env do not support WebGPU");
      }
    } catch (err) {
      this.logger("[error]", "Find an error initializing the WebGPU device " + err.toString());
      console.log(err);
      this.reset();
      throw Error("Find an error initializing WebGPU: " + err.toString());
    }

    this.tvm = tvm;
    const initProgressCallback = (report) => {
      this.logger("[init]", report.text);
    }
    tvm.registerInitProgressCallback(initProgressCallback);
    await tvm.fetchNDArrayCache(cacheUrl, tvm.webgpu());
  }

  /**
   * Initialize the pipeline
   *
   * @param schedulerConstUrl The scheduler constant.
   * @param tokenizerName The name of the tokenizer.
   */
  async #asyncInitPipeline(schedulerConstUrl, tokenizerName) {
    if (this.tvm == undefined) {
      throw Error("asyncInitTVM is not called");
    }
    if (this.pipeline !== undefined) return;
    var schedulerConst = []
    for (let i = 0; i < schedulerConstUrl.length; ++i) {
      schedulerConst.push(await (await fetch(schedulerConstUrl[i])).json())
    }
    const tokenizer = await tvmjsGlobalEnv.getTokenizer(tokenizerName);
    this.pipeline = this.tvm.withNewScope(() => {
      return new StableDiffusionPipeline(this.tvm, tokenizer, schedulerConst, this.tvm.cacheMetadata);
    });
    await this.pipeline.asyncLoadWebGPUPiplines();
  }

  /**
   * Async initialize config
   */
  async #asyncInitConfig() {
    if (this.config !== undefined) return;
    this.config = await (await fetch("/Program Files/StableDiffusion/config.json")).json();
  }

  /**
   * Function to create progress callback tracker.
   * @returns A progress callback tracker.
   */
  #getProgressCallback() {
    const tstart = performance.now();
    return (stage, counter, numSteps, totalNumSteps) => {
      const timeElapsed = (performance.now() - tstart) / 1000;
      let text = "At stage " + stage;
      if (stage == "unet") {
        counter += 1;
        text += " step [" + counter + "/" + numSteps + "]"
      }
      if (stage == "vae") {
        counter = totalNumSteps;
      }
      text += ", " + Math.ceil(timeElapsed) + " secs elapsed.";
      this.logger("[generating]", text);
    }
  }

  /**
   * Async initialize instance.
   */
  async asyncInit() {
    if (this.pipeline !== undefined) return;
    await this.#asyncInitConfig();
    await this.#asyncInitTVM(this.config.wasmUrl, this.config.cacheUrl);
    await this.#asyncInitPipeline(this.config.schedulerConstUrl, this.config.tokenizer);
  }

  /**
   * Async initialize
   *
   * @param tvm The tvm instance.
   */
  async asyncInitOnRPCServerLoad(tvmInstance) {
    if (this.tvm !== undefined) {
      throw Error("Cannot reuse a loaded instance for rpc");
    }
    this.tvm = tvmInstance;

    this.tvm.beginScope();
    this.tvm.registerAsyncServerFunc("generate", async (prompt, schedulerId, vaeCycle) => {
      await this.pipeline.generate(prompt, "", this.#getProgressCallback(), schedulerId, vaeCycle);
    });
    this.tvm.registerAsyncServerFunc("clearCanvas", async () => {
      this.tvm.clearCanvas();
    });
    this.tvm.registerAsyncServerFunc("showImage", async (data) => {
      this.tvm.showImage(data);
    });
    this.tvm.endScope();
  }

  /**
   * Run generate
   */
  async generate() {
    if (this.requestInProgress) {
      console.log("Request in progress, generate request ignored");
      return;
    }
    this.requestInProgress = true;
    try {
      await this.asyncInit();
      tvmjsGlobalEnv.prompts = tvmjsGlobalEnv.prompts || [];
      const index = Math.floor(Math.random() * tvmjsGlobalEnv.prompts.length);
      const [prompt = "", negPrompt = ""] = tvmjsGlobalEnv.prompts[index];
      const schedulerId = 0; // 0 = Multi-step DPM Solver (20 steps) | 1 = PNDM (50 steps)
      const vaeCycle = -1; // -1 = No | 2 = Run VAE every two UNet steps after step 10
      console.log("prompt", prompt + (negPrompt ? " (Negative: " + negPrompt + ")" : ""));
      await this.pipeline.generate(prompt, negPrompt, this.#getProgressCallback(), schedulerId, vaeCycle);
    } catch (err) {
      this.logger("[error]", err.toString());
      console.log(err);
      this.reset();
    }
    this.requestInProgress = false;
  }

  /**
   * Reset the instance;
   */
  reset() {
    this.tvm = undefined;
    if (this.pipeline !== undefined) {
      this.pipeline.dispose();
    }
    this.pipeline = undefined;
  }
}

localStableDiffusionInst = new StableDiffusionInstance();

tvmjsGlobalEnv.asyncOnGenerate = async function () {
  await localStableDiffusionInst.generate();
};

tvmjsGlobalEnv.asyncOnRPCServerLoad = async function (tvm) {
  const inst = new StableDiffusionInstance();
  await inst.asyncInitOnRPCServerLoad(tvm);
};
