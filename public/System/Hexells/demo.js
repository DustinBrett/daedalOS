class Demo {
  constructor(canvas, rootPath) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl", {
      alpha: false,
      desynchronized: true,
      powerPreference: "high-performance"
    });

    if (this.gl === null) {
      throw new Error("canvas.getContext returned null");
    }

    this.brushRadius = 16;
    this.stepPerFrame = 1;
    this.isScreenMode = false;

    const models = {
      layers: [
        {
          data: "layer1.png",
          layout: [20, 9],
          quant_scale_zero: [2, 0],
          scale: 2.2094483375549316,
          shape: [49, 96],
        },
        {
          data: "layer2.png",
          layout: [87, 2],
          quant_scale_zero: [4, 0.4980392156862745],
          scale: 1.3145631551742554,
          shape: [97, 12],
        },
      ],
      model_names: [
        "texture/models/dots-mondrian",
        "texture/models/dots",
        "texture/models/minecraft-mixed4b_pool_reduce_40",
        "texture/models/minecraft-mondrian",
        "texture/models/mixed4a_pool_reduce_14-mondrian",
        "texture/models/mixed4a_pool_reduce_15-mondrian",
        "texture/models/mixed4a_pool_reduce_16-mondrian",
        "texture/models/mixed4a_pool_reduce_27-mondrian",
        "texture/models/mixed4a_pool_reduce_28-mondrian",
        "texture/models/mixed4a_pool_reduce_30-mondrian",
        "texture/models/mixed4a_pool_reduce_31-mondrian",
        "texture/models/mixed4a_pool_reduce_32-mondrian",
        "texture/models/mixed4a_pool_reduce_49-mondrian",
        "texture/models/mixed4a_pool_reduce_52-mondrian",
        "texture/models/mixed4a_pool_reduce_55-mondrian",
        "texture/models/mixed4a_pool_reduce_57-mondrian",
        "texture/models/mixed4b_1x1_0-mondrian",
        "texture/models/mixed4b_1x1_10-mondrian",
        "texture/models/mixed4b_1x1_11-mondrian",
        "texture/models/mixed4b_1x1_12-mondrian",
        "texture/models/mixed4b_1x1_13-mondrian",
        "texture/models/mixed4b_1x1_14-mondrian",
        "texture/models/mixed4b_1x1_15-mondrian",
        "texture/models/mixed4b_1x1_16-mondrian",
        "texture/models/mixed4b_1x1_17-mondrian",
        "texture/models/mixed4b_1x1_18-mondrian",
        "texture/models/mixed4b_1x1_19-mondrian",
        "texture/models/mixed4b_1x1_1-mondrian",
        "texture/models/mixed4b_1x1_20-mondrian",
        "texture/models/mixed4b_1x1_21-mondrian",
        "texture/models/mixed4b_1x1_22-mondrian",
        "texture/models/mixed4b_1x1_23-mondrian",
        "texture/models/mixed4b_1x1_2-mondrian",
        "texture/models/mixed4b_1x1_3-mondrian",
        "texture/models/mixed4b_1x1_4-mondrian",
        "texture/models/mixed4b_1x1_5-mondrian",
        "texture/models/mixed4b_1x1_6-mondrian",
        "texture/models/mixed4b_1x1_7-mondrian",
        "texture/models/mixed4b_1x1_8-mondrian",
        "texture/models/mixed4b_1x1_9-mondrian",
        "texture/models/mixed4b_pool_reduce_40-mondrian",
        "texture/models/mixed4b_pool_reduce_40",
        "texture/models/mixed4b_pool_reduce_44-mondrian",
        "texture/models/mixed4b_pool_reduce_46-mondrian",
        "texture/models/mixed4c_1x1_0-mondrian",
        "texture/models/mixed4c_1x1_10-mondrian",
        "texture/models/mixed4c_1x1_11-mondrian",
        "texture/models/mixed4c_1x1_12-mondrian",
        "texture/models/mixed4c_1x1_13-mondrian",
        "texture/models/mixed4c_1x1_14-mondrian",
        "texture/models/mixed4c_1x1_15-mondrian",
        "texture/models/mixed4c_1x1_16-mondrian",
        "texture/models/mixed4c_1x1_17-mondrian",
        "texture/models/mixed4c_1x1_18-mondrian",
        "texture/models/mixed4c_1x1_19-mondrian",
        "texture/models/mixed4c_1x1_1-mondrian",
        "texture/models/mixed4c_1x1_20-mondrian",
        "texture/models/mixed4c_1x1_21-mondrian",
        "texture/models/mixed4c_1x1_22-mondrian",
        "texture/models/mixed4c_1x1_23-mondrian",
        "texture/models/mixed4c_1x1_24-mondrian",
        "texture/models/mixed4c_1x1_25-mondrian",
        "texture/models/mixed4c_1x1_26-mondrian",
        "texture/models/mixed4c_1x1_27-mondrian",
        "texture/models/mixed4c_1x1_28-mondrian",
        "texture/models/mixed4c_1x1_29-mondrian",
        "texture/models/mixed4c_1x1_2-mondrian",
        "texture/models/mixed4c_1x1_30-mondrian",
        "texture/models/mixed4c_1x1_31-mondrian",
        "texture/models/mixed4c_1x1_32-mondrian",
        "texture/models/mixed4c_1x1_33-mondrian",
        "texture/models/mixed4c_1x1_34-mondrian",
        "texture/models/mixed4c_1x1_35-mondrian",
        "texture/models/mixed4c_1x1_36-mondrian",
        "texture/models/mixed4c_1x1_37-mondrian",
        "texture/models/mixed4c_1x1_38-mondrian",
        "texture/models/mixed4c_1x1_39-mondrian",
        "texture/models/mixed4c_1x1_3-mondrian",
        "texture/models/mixed4c_1x1_40-mondrian",
        "texture/models/mixed4c_1x1_41-mondrian",
        "texture/models/mixed4c_1x1_42-mondrian",
        "texture/models/mixed4c_1x1_43-mondrian",
        "texture/models/mixed4c_1x1_44-mondrian",
        "texture/models/mixed4c_1x1_45-mondrian",
        "texture/models/mixed4c_1x1_46-mondrian",
        "texture/models/mixed4c_1x1_47-mondrian",
        "texture/models/mixed4c_1x1_48-mondrian",
        "texture/models/mixed4c_1x1_49-mondrian",
        "texture/models/mixed4c_1x1_4-mondrian",
        "texture/models/mixed4c_1x1_50-mondrian",
        "texture/models/mixed4c_1x1_51-mondrian",
        "texture/models/mixed4c_1x1_52-mondrian",
        "texture/models/mixed4c_1x1_53-mondrian",
        "texture/models/mixed4c_1x1_54-mondrian",
        "texture/models/mixed4c_1x1_55-mondrian",
        "texture/models/mixed4c_1x1_56-mondrian",
        "texture/models/mixed4c_1x1_57-mondrian",
        "texture/models/mixed4c_1x1_58-mondrian",
        "texture/models/mixed4c_1x1_59-mondrian",
        "texture/models/mixed4c_1x1_5-mondrian",
        "texture/models/mixed4c_1x1_60-mondrian",
        "texture/models/mixed4c_1x1_61-mondrian",
        "texture/models/mixed4c_1x1_62-mondrian",
        "texture/models/mixed4c_1x1_63-mondrian",
        "texture/models/mixed4c_1x1_64-mondrian",
        "texture/models/mixed4c_1x1_65-mondrian",
        "texture/models/mixed4c_1x1_66-mondrian",
        "texture/models/mixed4c_1x1_67-mondrian",
        "texture/models/mixed4c_1x1_68-mondrian",
        "texture/models/mixed4c_1x1_69-mondrian",
        "texture/models/mixed4c_1x1_6-mondrian",
        "texture/models/mixed4c_1x1_70-mondrian",
        "texture/models/mixed4c_1x1_71-mondrian",
        "texture/models/mixed4c_1x1_72-mondrian",
        "texture/models/mixed4c_1x1_73-mondrian",
        "texture/models/mixed4c_1x1_74-mondrian",
        "texture/models/mixed4c_1x1_75-mondrian",
        "texture/models/mixed4c_1x1_76-mondrian",
        "texture/models/mixed4c_1x1_77-mondrian",
        "texture/models/mixed4c_1x1_78-mondrian",
        "texture/models/mixed4c_1x1_79-mondrian",
        "texture/models/mixed4c_1x1_7-mondrian",
        "texture/models/mixed4c_1x1_80-mondrian",
        "texture/models/mixed4c_1x1_81-mondrian",
        "texture/models/mixed4c_1x1_82-mondrian",
        "texture/models/mixed4c_1x1_83-mondrian",
        "texture/models/mixed4c_1x1_84-mondrian",
        "texture/models/mixed4c_1x1_85-mondrian",
        "texture/models/mixed4c_1x1_86-mondrian",
        "texture/models/mixed4c_1x1_87-mondrian",
        "texture/models/mixed4c_1x1_8-mondrian",
        "texture/models/mixed4c_1x1_9-mondrian",
        "texture/models/mondrian",
        "bubbly_0101",
        "dotted_0201",
        "interlaced_0081",
        "honeycombed_0171",
        "honeycombed_0061",
        "crosshatched_0121",
        "bumpy_0081",
        "cobwebbed_0141",
        "chequered_0121",
        "chequered_0051",
        "swirly_0071",
        "veined_0141",
        "woven_0121",
        "mixed4c_242",
        "mixed4c_52",
        "mixed4c_439",
        "mixed4c_438",
        "mixed4c_397",
        "mixed4c_412",
        "mixed4c_364",
        "mixed4c_21",
        "mixed4c_208",
        "mixed4d_42",
        "mixed4d_473",
        "mixed4d_474",
        "mixed4d_485",
        "mixed4b_8",
        "mixed4b_98",
        "mixed4b_70",
        "mixed4b_507",
        "mixed4b_492",
        "mixed4b_486",
        "mixed4b_488",
        "mixed4a_1",
        "mixed4a_461",
        "mixed4a_472",
        "mixed4a_475",
        "mixed3b_454",
        "mixed4d_117",
        "mixed4d_313",
      ],
    };

    this.ca = new CA(this.gl, models, [160, 160], rootPath, () =>
      this.setup(models)
    );
  }

  setup(models) {
    this.shuffledModelIds = models.model_names
      .map((_, i) => [Math.random(), i])
      .sort()
      .map((p) => p[1]);
    this.curModelIndex = this.shuffledModelIds[0];
    this.modelId = this.shuffledModelIds[this.curModelIndex];
    this.ca.paint(0, 0, -1, this.modelId);

    this.guesture = null;

    setInterval(() => this.switchModel(1), 20 * 1000);

    requestAnimationFrame(() => this.render());
  }

  startGestue(pos) {
    this.gesture = {
      d: 0,
      l: 0,
      prevPos: pos,
      r: 0,
      time: Date.now(),
      u: 0,
    };
  }

  touch(xy) {
    const [x, y] = xy;
    const g = this.gesture;
    if (g) {
      const [x0, y0] = g.prevPos;
      g.l += Math.max(x0 - x, 0);
      g.r += Math.max(x - x0, 0);
      g.u += Math.max(y0 - y, 0);
      g.d += Math.max(y - y0, 0);
      g.prevPos = xy;
    }
    const viewSize = getViewSize();
    this.ca.clearCircle(x, y, this.brushRadius, viewSize);
  }

  endGestue() {
    if (!this.gesture) {
      return;
    }
    if (Date.now() - this.gesture.time < 1000) {
      const { l, r, u, d } = this.gesture;
      if (l > 200 && Math.max(r, u, d) < l * 0.25) {
        this.switchModel(-1);
      } else if (r > 200 && Math.max(l, u, d) < r * 0.25) {
        this.switchModel(1);
      }
    }
    this.gesture = null;
  }

  switchModel(swipe) {
    const n = this.shuffledModelIds.length;
    this.curModelIndex = (this.curModelIndex + n + swipe) % n;
    const id = this.shuffledModelIds[this.curModelIndex];
    this.setModel(id);
  }

  setModel(id) {
    this.modelId = id;
    this.ca.paint(0, 0, -1, id);
    this.ca.disturb();
  }

  getViewSize() {
    return [
      globalThis.demoCanvasRect?.width || this.canvas.clientWidth || this.canvas.width,
      globalThis.demoCanvasRect?.height || this.canvas.clientHeight || this.canvas.height
    ];
  }

  render() {
    for (let i = 0; i < this.stepPerFrame; ++i) {
      this.ca.step();
    }
    const { canvas } = this;
    const dpr = globalThis.devicePixelRatio || 1;
    const [w, h] = this.getViewSize();
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    twgl.bindFramebufferInfo(this.gl);
    this.ca.draw(this.getViewSize(), "color");
    requestAnimationFrame(() => this.render());
  }
}

globalThis.Demo = Demo;
