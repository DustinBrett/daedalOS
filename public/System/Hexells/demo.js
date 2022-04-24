class Demo {
  constructor(canvas, isScreenMode) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl", { alpha: false });

    this.brushRadius = 16;
    this.stepPerFrame = 1;

    this.isScreenMode = isScreenMode;

    const gui = (this.gui = new dat.GUI());
    gui.hide();
    gui.add(this, "brushRadius", 1, 40);
    gui.add(this, "stepPerFrame", 0, 6, 1);

    fetch("System/Hexells/models.json")
      .then((r) => r.json())
      .then((models) => {
        this.ca = new CA(this.gl, models, [160, 160], gui, () =>
          this.setup(models)
        );
      });
  }

  setup(models) {
    const { canvas } = this;

    this.shuffledModelIds = models.model_names
      .map((_, i) => [Math.random(), i])
      .sort()
      .map((p) => p[1]);
    // 132, 141, 149, 134, 168, 40, 104, 37, 64, 12
    this.curModelIndex = this.shuffledModelIds[0]; // .indexOf(149); // "coral"
    this.modelId = this.shuffledModelIds[this.curModelIndex];
    this.ca.paint(0, 0, -1, this.modelId);

    this.guesture = null;

    // const mouseEvent = (f) => (e) => {
    //   e.preventDefault();
    //   f([e.offsetX, e.offsetY], e);
    // };
    const touchEvent = (f) => (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      for (const t of e.touches) {
        const xy = [t.clientX - rect.left, t.clientY - rect.top];
        f(xy, e);
      }
    };

    // canvas.addEventListener(
    //   "mousedown",
    //   mouseEvent((xy, e) => {
    //     if (e.buttons == 1) {
    //       this.startGestue(xy);
    //       this.touch(xy);
    //     }
    //   })
    // );
    // canvas.addEventListener(
    //   "mousemove",
    //   mouseEvent((xy, e) => {
    //     if (e.buttons == 1) {
    //       this.touch(xy);
    //     }
    //   })
    // );
    // canvas.addEventListener(
    //   "mouseup",
    //   mouseEvent((xy) => this.endGestue(xy))
    // );

    canvas.addEventListener(
      "touchstart",
      touchEvent((xy, e) => {
        if (e.touches.length == 1) {
          this.startGestue(xy);
        } else {
          this.gesture = null; // cancel guesture
        }
        this.touch(xy);
      })
    );
    canvas.addEventListener(
      "touchmove",
      touchEvent((xy) => this.touch(xy))
    );
    canvas.addEventListener("touchend", (xy) => this.endGestue(xy));

    // document.addEventListener("keypress", (e) => {
    //   if (e.key == "a") this.switchModel(1);
    //   if (e.key == "z") this.switchModel(-1);
    // });

    setInterval(() => this.switchModel(1), 30 * 1000);

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
    const viewSize = [this.canvas.clientWidth, this.canvas.clientHeight];
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
    return [this.canvas.clientWidth, this.canvas.clientHeight];
  }

  render() {
    for (let i = 0; i < this.stepPerFrame; ++i) {
      this.ca.step();
    }
    const { canvas } = this;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);

    twgl.bindFramebufferInfo(this.gl);
    this.ca.draw(this.getViewSize(), "color");
    requestAnimationFrame(() => this.render());
  }
}

window.Demo = Demo;
