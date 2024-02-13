/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const vs_code = `
    attribute vec4 position;
    varying vec2 uv;
    void main() {
        uv = position.xy*0.5 + 0.5;
        gl_Position = position;
    }
`

function defInput(name) {
    return `
        uniform Tensor ${name};
        uniform sampler2D ${name}_tex;

        vec4 ${name}_read(vec2 pos, float ch) {return _read(${name}, ${name}_tex, pos, ch);}
        vec4 ${name}_read01(vec2 pos, float ch) {return _read01(${name}, ${name}_tex, pos, ch);}
        vec4 ${name}_readUV(vec2 uv) {return _readUV(${name}, ${name}_tex, uv);}
    `
}

const PREFIX = `
    #extension GL_OES_standard_derivatives : enable
    precision highp float;

    const float PI = 3.14159265359;

    // "Hash without Sine" by David Hoskins (https://www.shadertoy.com/view/4djSRW)
    float hash13(vec3 p3) {
      p3  = fract(p3 * .1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }
    vec2 hash23(vec3 p3)
    {
        p3 = fract(p3 * vec3(.1031, .1030, .0973));
        p3 += dot(p3, p3.yzx+33.33);
        return fract((p3.xx+p3.yz)*p3.zy);
    }

    struct Tensor {
        vec2 size;
        vec2 gridSize;
        float depth, depth4;
        vec2 packScaleZero;
    };
    uniform Tensor u_output;

    vec4 _readUV(Tensor tensor, sampler2D tex, vec2 uv) {
        vec4 v = texture2D(tex, uv);
        vec2 p = tensor.packScaleZero;
        v = (v-p.y)*p.x;
        return v;
    }
    vec2 _getUV(Tensor tensor, vec2 pos, float ch) {
        ch += 0.5;
        float tx = floor(mod(ch, tensor.gridSize.x));
        float ty = floor(ch / tensor.gridSize.x);
        vec2 p = fract(pos/tensor.size) + vec2(tx, ty);
        p /= tensor.gridSize;
        return p;
    }
    vec4 _read01(Tensor tensor, sampler2D tex, vec2 pos, float ch) {
        return texture2D(tex, _getUV(tensor, pos, ch));
    }
    vec4 _read(Tensor tensor, sampler2D tex, vec2 pos, float ch) {
        vec2 p = _getUV(tensor, pos, ch);
        return _readUV(tensor, tex, p);
    }
    vec2 getOutputXY() {
        return mod(gl_FragCoord.xy, u_output.size);
    }
    float getOutputChannel() {
        vec2 xy = floor(gl_FragCoord.xy/u_output.size);
        return xy.y*u_output.gridSize.x+xy.x;
    }

    void setOutput(vec4 v) {
        vec2 p = u_output.packScaleZero;
        v = v/p.x + p.y;
        gl_FragColor = v;
    }

    #ifdef SPARSE_UPDATE
        uniform sampler2D u_shuffleTex, u_unshuffleTex;
        uniform vec2 u_shuffleOfs;
    #endif

    ${defInput('u_input')}

    uniform float u_angle, u_alignment;
    const float u_hexGrid = 1.0;

    mat2 rotate(float ang) {
        float s = sin(ang), c = cos(ang);
        return mat2(c, s, -s, c);
    }

    vec2 ang2vec(float a) {
        return vec2(cos(a), sin(a));
    }

    ${defInput('u_alignTex')}
    vec2 getCellDirection(vec2 xy) {
        return u_alignTex_read(xy, 0.0).xy;
    }

    vec4 conv3x3(vec2 xy, float inputCh, mat3 filter) {
        vec4 a = vec4(0.0);
        for (int y=0; y<3; ++y)
        for (int x=0; x<3; ++x) {
          vec2 p = xy+vec2(float(x-1), float(y-1));
          a += filter[y][x] * u_input_read(p, inputCh);
        }
        return a;
    }

    // https://www.shadertoy.com/view/Xljczw
    // https://www.shadertoy.com/view/MlXyDl
    // returns xy - in cell pos, zw - skewed cell id
    vec4 getHex(vec2 u) {
        vec2 s = vec2(1., mix(2.0, 1.732, u_hexGrid));
        vec2 p = vec2(0.5*u_hexGrid, 0.5);
        vec2 a = mod(u    ,s)*2.-s;
        vec2 b = mod(u+s*p,s)*2.-s;
        vec2 ai = floor(u/s);
        vec2 bi = floor(u/s+p);
        // skewed coords
        ai = vec2(ai.x-ai.y*u_hexGrid, ai.y*2.0+1.0);
        bi = vec2(bi.x-bi.y*u_hexGrid, bi.y*2.0);
        return dot(a,a)<dot(b,b) ? vec4(a, ai) : vec4(b, bi);
    }

    float hex(in vec2 p){
        vec2 s = vec2(1., 1.732);
        p = abs(p);
        return max(dot(p, s*.5), p.x); // Hexagon.
    }

    // https://www.shadertoy.com/view/XtXcWs
    vec2 cmul(vec2 a, vec2 b) {
        return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
    }

    vec2 cdiv(vec2 a, vec2 b) {
        return cmul(a, vec2(b.x, -b.y)) / dot(b, b);
    }

    uniform vec2 u_viewSize;

    struct Hexel {
        vec2 cellXY;
        vec2 p;
        float zoom;
    };

    Hexel screen2hex(vec2 xy) {
        xy /= u_viewSize;
        xy.y = 1.0-xy.y;
        vec2 normViewSize = u_viewSize/length(u_viewSize);
        xy = (xy*0.85+0.25) * normViewSize;

        Hexel h;
        float nxy = length(xy);
        h.zoom = 4.0/(nxy*nxy);
        xy = cmul(xy, xy);
        xy = cmul(xy, xy);
        xy *= 160.0;
        vec4 r = getHex(xy);
        h.cellXY = r.zw;
        h.p = r.xy;
        return h;
    }

    float calcMouseDist(vec2 mousePosScr) {
        Hexel h = screen2hex(mousePosScr);
        h.cellXY = mod(h.cellXY, u_output.size);
        vec2 diff = abs(getOutputXY()-h.cellXY-0.5);
        return length(min(diff, u_output.size-diff))*h.zoom;
    }
`;

const PROGRAMS = {
    paint: `
    uniform vec2 u_pos;
    uniform float u_r;
    uniform vec4 u_brush;

    void main() {
        if (u_r>0.0 && calcMouseDist(u_pos)>=80.0)
          discard;
        setOutput(u_brush);
    }`,
    peek: `
    uniform vec2 u_pos;

    vec2 getPeekPos(float i) {
        float a = i*0.61803398875*2.0*PI;
        float r = (u_viewSize.x+u_viewSize.y)/1000.0;
        return vec2(cos(a), sin(a)) * sqrt(i) * r;
    }

    void main() {
        float out_i = getOutputXY().x;
        float i = floor(out_i / u_input.depth4);
        float channel = floor(mod(out_i, u_input.depth4));
        Hexel h = screen2hex(u_pos + getPeekPos(i));
        setOutput(u_input_read(h.cellXY, channel));
    }`,
    align: `
    uniform vec2 u_pos;
    uniform float u_r;
    uniform float u_init;

    const mat3 blur = mat3(1.0/9.0);
    const mat3 blurHex = mat3(0.0,       1.0, 1.0,
                                       1.0, 1.0, 1.0,
                                          1.0, 1.0,        0.0)/7.0;

    void main() {
        vec2 xy = getOutputXY();
        vec4 v = conv3x3(xy, 0.0, blur*(1.0-u_hexGrid) + blurHex*u_hexGrid);
        v.xy = normalize(mix(u_input_read(xy, 0.0).xy, v.xy, 1.0));
        setOutput(v);

        if (u_init > 0.0) {
            if (u_r>0.0 && calcMouseDist(u_pos)>=80.0)
              return;
            float a = hash13(vec3(xy+vec2(34299.0, -56593.0), u_init)) * 2.0 * PI;
            vec2 v = normalize(ang2vec(a)+0.2*ang2vec(u_init));
            setOutput(vec4(v, 0.0, 0.0));
        }
    }`,
    perception: `
    const mat3 sobelX = mat3(-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -1.0, 0.0, 1.0)/8.0;
    const mat3 sobelY = mat3(-1.0,-2.0,-1.0, 0.0, 0.0, 0.0, 1.0, 2.0, 1.0)/8.0;
    const mat3 gauss = mat3(1.0, 2.0, 1.0, 2.0, 4.0-16.0, 2.0, 1.0, 2.0, 1.0)/8.0;
    const mat3 sobelXhex = mat3( 0.0,    -1.0, 1.0,
                                       -2.0, 0.0, 2.0,
                                         -1.0, 1.0,        0.0)/8.0;

    const mat3 sobelYhex = mat3( 0.0,    -2.0,-2.0,
                                        0.0, 0.0, 0.0,
                                          2.0, 2.0,        0.0)/8.0;

    const mat3 gaussHex = mat3(0.0,       2.0, 2.0,
                                       2.0, 4.0-16.0, 2.0,
                                          2.0, 2.0,        0.0)/8.0;

    void main() {
        vec2 xy = getOutputXY();
        #ifdef SPARSE_UPDATE
            xy = texture2D(u_shuffleTex, xy/u_output.size).xy*255.0+0.5 + u_shuffleOfs;
            xy = mod(xy, u_input.size);
        #endif
        float ch = getOutputChannel();
        if (ch >= u_output.depth4)
            return;

        float filterBand = floor((ch+0.5)/u_input.depth4);
        float inputCh = ch-filterBand*u_input.depth4;
        if (filterBand < 0.5) {
            setOutput(u_input_read(xy, inputCh));
        } else if (filterBand < 2.5) {
            vec4 dx = conv3x3(xy, inputCh, sobelX*(1.0-u_hexGrid) + sobelXhex*u_hexGrid);
            vec4 dy = conv3x3(xy, inputCh, sobelY*(1.0-u_hexGrid) + sobelYhex*u_hexGrid);
            vec2 dir = getCellDirection(xy);
            float s = dir.x, c = dir.y;
            setOutput(filterBand < 1.5 ? dx*c-dy*s : dx*s+dy*c);
        } else {
            setOutput(conv3x3(xy, inputCh, gauss*(1.0-u_hexGrid) + gaussHex*u_hexGrid));
        }
    }`,
    dense: `
    ${defInput('u_control')}
    uniform sampler2D u_weightTex;
    uniform float u_seed, u_fuzz;
    uniform vec2 u_weightCoefs; // scale, center
    uniform vec2 u_layout;

    const float MAX_PACKED_DEPTH = 32.0;

    vec4 readWeightUnscaled(vec2 p) {
        vec4 w = texture2D(u_weightTex, p);
        return w-u_weightCoefs.y;
    }

    void main() {
      vec2 xy = getOutputXY();
      float ch = getOutputChannel();
      if (ch >= u_output.depth4)
          return;

      float dy = 1.0/(u_input.depth+1.0)/u_layout.y;
      vec2 p = vec2((ch+0.5)/u_output.depth4, dy*0.5);
      vec2 fuzz = (hash23(vec3(xy, u_seed+ch))-0.5)*u_fuzz;

      vec2 realXY = xy;
      #ifdef SPARSE_UPDATE
        realXY = texture2D(u_shuffleTex, xy/u_output.size).xy*255.0+0.5 + u_shuffleOfs;
      #endif
      float modelIdx = u_control_read(realXY+fuzz, 0.0).x+0.5;
      p.x += floor(mod(modelIdx, u_layout.x));
      p.y += floor(modelIdx/u_layout.x);
      p /= u_layout;
      vec4 result = vec4(0.0);
      for (float i=0.0; i < MAX_PACKED_DEPTH; i+=1.0) {
          vec4 inVec = u_input_read(xy, i);
          result += inVec.x * readWeightUnscaled(p); p.y += dy;
          result += inVec.y * readWeightUnscaled(p); p.y += dy;
          result += inVec.z * readWeightUnscaled(p); p.y += dy;
          result += inVec.w * readWeightUnscaled(p); p.y += dy;
          if (i+1.5>u_input.depth4) {
              break;
          }
      }
      result += readWeightUnscaled(p);  // bias
      setOutput(result*u_weightCoefs.x);
    }`,
    update: `
    ${defInput('u_update')}
    uniform float u_seed, u_updateProbability;

    varying vec2 uv;

    void main() {
      vec2 xy = getOutputXY();
      vec4 state = u_input_readUV(uv);
      vec4 update = vec4(0.0);
      #ifdef SPARSE_UPDATE
        vec4 shuffleInfo = texture2D(u_unshuffleTex, fract((xy-u_shuffleOfs)/u_output.size));
        if (shuffleInfo.z > 0.5) {
            update = u_update_read(shuffleInfo.xy*255.0+0.5, getOutputChannel());
        }
      #else
        if (hash13(vec3(xy, u_seed)) <= u_updateProbability) {
            update = u_update_readUV(uv);
        }
      #endif
      setOutput(state + update);
    }`,
    vis: `
    uniform float u_raw;
    uniform float u_zoom;
    uniform float u_perceptionCircle, u_arrows;
    uniform float u_devicePixelRatio;

    varying vec2 uv;

    float clip01(float x) {
        return min(max(x, 0.0), 1.0);
    }

    float peak(float x, float r) {
        float y = x/r;
        return exp(-y*y);
    }

    float getElement(vec4 v, float i) {
        if (i<1.0) return v.x;
        if (i<2.0) return v.y;
        if (i<3.0) return v.z;
        return v.w;
    }

    vec3 onehot3(float i) {
        if (i<1.0) return vec3(1.0, 0.0, 0.0);
        if (i<2.0) return vec3(0.0, 1.0, 0.0);
        return vec3(0.0, 0.0, 1.0);
    }

    float sdTriangleIsosceles( in vec2 p, in vec2 q ) {
        p.x = abs(p.x);
        vec2 a = p - q*clamp( dot(p,q)/dot(q,q), 0.0, 1.0 );
        vec2 b = p - q*vec2( clamp( p.x/q.x, 0.0, 1.0 ), 1.0 );
        float s = -sign( q.y );
        vec2 d = min( vec2( dot(a,a), s*(p.x*q.y-p.y*q.x) ),
                      vec2( dot(b,b), s*(p.y-q.y)  ));
        return -sqrt(d.x)*sign(d.y);
    }

    float aastep(float v) {
        return clip01(v/fwidth(v)/u_devicePixelRatio);
    }

    float smoothstep(float t) {
        t = clip01(t);
        return t * t * (3.0 - 2.0 * t);
    }

    void spot(vec2 pos, float v, vec2 xy, inout vec3 rgb) {
        v = sqrt(abs(v))*sign(v);
        pos *= v*0.6;
        float r = abs(v)*0.30;
        rgb += clip01((r-length(xy-pos))/r)*0.2;
    }

    float sdBox( in vec2 p, in vec2 b )
    {
        vec2 d = abs(p)-b;
        return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
    }

    void main() {
        vec2 xy = vec2(uv.x, 1.0-uv.y);
        if (u_raw > 0.5) {
            gl_FragColor = texture2D(u_input_tex, xy);
            gl_FragColor.a = 1.0;
        } else {
            vec2 screenPos = xy*u_viewSize;
            Hexel h = screen2hex(screenPos);
            vec2 p = h.p;
            h.cellXY += 0.5;

            vec3 rgb = u_input_read(h.cellXY, 0.0).rgb/2.0+0.5;
            if (4.0<h.zoom) {
                vec2 dir = getCellDirection(floor(h.cellXY)+0.5);
                float s = dir.x, c = dir.y;
                float fade = clip01((h.zoom-4.0)/4.0);
                float r = clip01((1.0-hex(p))*8.0);
                r = pow(r, 0.2);
                rgb *= mix(1.0, r, fade);

                p = mat2(c, s, -s, c) * p;

                if (12.0 < h.zoom) {
                    float da = PI/12.0;
                    float a = -da;
                    vec4 v4;
                    vec3 spots;
                    for (float ch=0.0; ch<2.5; ++ch) {
                        v4 = (u_input_read01(h.cellXY, ch)-127.0/255.0)*2.0;
                        spot(ang2vec(a+=da), v4.x, p, spots);
                        spot(ang2vec(a+=da), v4.y, p, spots);
                        spot(ang2vec(a+=da), v4.z, p, spots);
                        spot(ang2vec(a+=da), v4.w, p, spots);
                    }
                    spots *= clip01((h.zoom-12.0)/3.0);
                    rgb += spots;
                }
            }
            gl_FragColor = vec4(rgb, 1.0);
        }
    }`
}

function createPrograms(gl, defines) {
    defines = defines || '';
    const res = {};
    for (const name in PROGRAMS) {
        const fs_code = defines + PREFIX + PROGRAMS[name];
        const progInfo = twgl.createProgramInfo(gl, [vs_code, fs_code]);
        progInfo.name = name;
        res[name] = progInfo;
    }
    return res;
}

function createTensor(gl, w, h, depth, packScaleZero) {
    const depth4 = Math.ceil(depth / 4);
    const gridW = Math.ceil(Math.sqrt(depth4));
    const gridH = Math.floor((depth4 + gridW - 1) / gridW);
    const texW = w * gridW, texH = h * gridH;

    const attachments = [{ minMag: gl.NEAREST }];
    const fbi = twgl.createFramebufferInfo(gl, attachments, texW, texH);
    const tex = fbi.attachments[0];
    return {
        _type: 'tensor',
        fbi, w, h, depth, gridW, gridH, depth4, tex, packScaleZero
    };
}

function setTensorUniforms(uniforms, name, tensor) {
    uniforms[name + '.size'] = [tensor.w, tensor.h];
    uniforms[name + '.gridSize'] = [tensor.gridW, tensor.gridH];
    uniforms[name + '.depth'] = tensor.depth;
    uniforms[name + '.depth4'] = tensor.depth4;
    uniforms[name + '.packScaleZero'] = tensor.packScaleZero;
    if (name != 'u_output') {
        uniforms[name + '_tex'] = tensor.tex;
    }
}

function createDenseInfo(gl, params, rootPath, onready) {
    const coefs = [params.scale, 127.0 / 255.0];
    const [in_n, out_n] = params.shape;
    const info = { coefs, layout: params.layout, in_n: in_n - 1, out_n,
        quantScaleZero: params.quant_scale_zero, ready: false };
    fetch(`${rootPath}/${params.data}`, { priority: "high" })
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const img = UPNG.decode(buffer);
        const data = new Uint8Array(UPNG.toRGBA8(img)[0]);
        info.tex = twgl.createTexture(gl, {
            width: img.width, height: img.height,
            minMag: gl.NEAREST, src: data,
        });
        info.ready = true;
        onready();
      });
    return info;
}

class CA {
    constructor(gl, models, gridSize, rootPath, onready) {
        this.rootPath = rootPath;
        this.onready = onready || (()=>{});
        this.gl = gl;
        this.gridSize = gridSize || [96, 96];
        gl.getExtension('OES_standard_derivatives');

        this.updateProbability = 0.5;
        this.shuffledMode = true;

        this.rotationAngle = 0.0;
        this.alignment = 1;
        this.fuzz = 8.0;
        this.perceptionCircle = 0.0;
        this.arrowsCoef = 0.0;
        this.visMode = 'color';
        this.hexGrid = 1.0;
        this.devicePixelRatio = globalThis.devicePixelRatio || 1;

        this.layers = [];
        this.setWeights(models);

        this.progs = createPrograms(gl, this.shuffledMode ? '#define SPARSE_UPDATE\n' : '');
        this.quad = twgl.createBufferInfoFromArrays(gl, {
            position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
        });

        this.setupBuffers();
        const visNames = Object.getOwnPropertyNames(this.buf);
        visNames.push('color');

        this.clearCircle(0, 0, -1);
        this.disturb();
    }

    disturb() {
        this.runLayer(this.progs.align, this.buf.align, {
            u_input: this.buf.newAlign, u_hexGrid: this.hexGrid, u_init: Math.random()*1000+1,
            u_r: -1,
        });
    }

    setupBuffers() {
        const gl = this.gl;
        const [gridW, gridH] = this.gridSize;
        const shuffleH = Math.ceil(gridH * this.updateProbability);
        const shuffleCellN = shuffleH * gridW;
        const totalCellN = gridW * gridH;
        const shuffleBuf = new Uint8Array(shuffleCellN * 4);
        const unshuffleBuf = new Uint8Array(totalCellN * 4);
        let k = 0;
        for (let i = 0; i < totalCellN; ++i) {
            if (Math.random() < (shuffleCellN - k) / (totalCellN - i)) {
                shuffleBuf[k * 4 + 0] = i % gridW;
                shuffleBuf[k * 4 + 1] = Math.floor(i / gridW);
                unshuffleBuf[i * 4 + 0] = k % gridW;
                unshuffleBuf[i * 4 + 1] = Math.floor(k / gridW);
                unshuffleBuf[i * 4 + 2] = 255;
                k += 1;
            }
        }
        this.shuffleTex = twgl.createTexture(gl, { minMag: gl.NEAREST, width: gridW, height: shuffleH, src: shuffleBuf});
        this.unshuffleTex = twgl.createTexture(gl, { minMag: gl.NEAREST, width: gridW, height: gridH, src: unshuffleBuf});
        this.shuffleOfs = [0, 0];

        const updateH = this.shuffledMode ? shuffleH : gridH;
        const perception_n = this.layers[0].in_n;
        const lastLayer = this.layers[this.layers.length-1];
        const channel_n = lastLayer.out_n;
        this.channel_n = channel_n;
        const stateQuantization = lastLayer.quantScaleZero;
        const sonicN = 16;
        this.buf = {
            control: createTensor(gl, gridW, gridH, 4, [255.0, 0.0]),
            align: createTensor(gl, gridW, gridH, 4, [2.0, 127.0 / 255.0]),
            newAlign: createTensor(gl, gridW, gridH, 4, [2.0, 127.0 / 255.0]),
            state: createTensor(gl, gridW, gridH, channel_n, stateQuantization),
            newState: createTensor(gl, gridW, gridH, channel_n, stateQuantization),
            perception: createTensor(gl, gridW, updateH, perception_n, stateQuantization),
            sonic: createTensor(gl, sonicN*channel_n/4, 1, 4, stateQuantization),
        };
        {
            const {width, height} = this.buf.sonic.fbi;
            this.sonicBuf = new Uint8Array(height*width*4);
        }

        for (let i=0; i<this.layers.length; ++i) {
            const layer = this.layers[i];
            this.buf[`layer${i}`] = createTensor(gl, gridW, updateH, layer.out_n, layer.quantScaleZero);
        }
    }

    step(stage) {
        stage = stage || 'all';
        const isStageAll = stage == 'all';
        if (!this.layers.every(l=>l.ready))
            return;

        if (isStageAll) {
            const [gridW, gridH] = this.gridSize;
            this.shuffleOfs = [Math.floor(Math.random() * gridW), Math.floor(Math.random() * gridH)];
        }

        if (isStageAll || stage == 'align') {
            this.runLayer(this.progs.align, this.buf.newAlign, {
                u_input: this.buf.align, u_hexGrid: this.hexGrid, u_init: 0.0
            });
        }
        if (isStageAll || stage == 'perception') {
            this.runLayer(this.progs.perception, this.buf.perception, {
                u_input: this.buf.state, u_angle: this.rotationAngle / 180.0 * Math.PI,
                u_alignTex: this.buf.newAlign,
                u_alignment: this.alignment, u_hexGrid: this.hexGrid
            });
        }
        let inputBuf = this.buf.perception;
        for (let i=0; i<this.layers.length; ++i) {
            if (isStageAll || stage == `layer${i}`)
                this.runDense(this.buf[`layer${i}`], inputBuf, this.layers[i]);
            inputBuf = this.buf[`layer${i}`];
        }
        if (isStageAll || stage == 'newState') {
            this.runLayer(this.progs.update, this.buf.newState, {
                u_input: this.buf.state, u_update: inputBuf,
                u_unshuffleTex: this.unshuffleTex,
                u_seed: Math.random() * 1000, u_updateProbability: this.updateProbability
            });
        }

        if (isStageAll) {
            [this.buf.state, this.buf.newState] = [this.buf.newState, this.buf.state];
            [this.buf.align, this.buf.newAlign] = [this.buf.newAlign, this.buf.align];
        }
    }

    paint(x, y, r, brush, viewSize) {
        viewSize = viewSize || [128, 128];
        this.runLayer(this.progs.paint, this.buf.control, {
            u_pos: [x, y], u_r: r, u_brush: [brush, 0, 0, 0], u_viewSize: viewSize,
        });
    }

    clearCircle(x, y, r, viewSize) {
        viewSize = viewSize || [128, 128];
        this.runLayer(this.progs.paint, this.buf.state, {
            u_pos: [x, y], u_r: r, u_brush: [0, 0, 0, 0], u_viewSize: viewSize,
        });
    }

    setWeights(models) {
        const gl = this.gl;
        this.layers.forEach(layer=>gl.deleteTexture(layer));
        const onready = ()=>{
            if (this.layers.every(l=>l.ready))
                this.onready();
        }
        this.layers = models.layers.map(layer=>createDenseInfo(gl, layer, this.rootPath, onready));
    }

    runLayer(program, output, inputs) {
        const gl = this.gl;
        inputs = inputs || {};
        const uniforms = {};
        for (const name in inputs) {
            const val = inputs[name];
            if (val._type == 'tensor') {
                setTensorUniforms(uniforms, name, val);
            } else {
                uniforms[name] = val;
            }
        }
        uniforms['u_shuffleTex'] = this.shuffleTex;
        uniforms['u_shuffleOfs'] = this.shuffleOfs;
        setTensorUniforms(uniforms, 'u_output', output);

        twgl.bindFramebufferInfo(gl, output.fbi);
        gl.useProgram(program.program);
        twgl.setBuffersAndAttributes(gl, program, this.quad);
        twgl.setUniforms(program, uniforms);
        twgl.drawBufferInfo(gl, this.quad);
        return { programName: program.name, output }
    }

    runDense(output, input, layer) {
        return this.runLayer(this.progs.dense, output, {
            u_input: input, u_control: this.buf.control,
            u_weightTex: layer.tex, u_weightCoefs: layer.coefs, u_layout: layer.layout,
            u_seed: Math.random() * 1000, u_fuzz: this.fuzz
        });
    }

    draw(viewSize, visMode) {
        visMode = visMode || this.visMode;
        const gl = this.gl;

        gl.useProgram(this.progs.vis.program);
        twgl.setBuffersAndAttributes(gl, this.progs.vis, this.quad);
        const uniforms = { u_raw: 0.0,
            u_angle: this.rotationAngle / 180.0 * Math.PI,
            u_alignment: this.alignment,
            u_perceptionCircle: this.perceptionCircle,
            u_arrows: this.arrowsCoef,
            u_devicePixelRatio: this.devicePixelRatio,
            u_viewSize: viewSize,
        };
        let inputBuf = this.buf.state;
        if (visMode != 'color') {
            inputBuf = this.buf[visMode];
            uniforms.u_raw = 1.0;
        }
        setTensorUniforms(uniforms, 'u_input', inputBuf);
        setTensorUniforms(uniforms, 'u_alignTex', this.buf.align);
        twgl.setUniforms(this.progs.vis, uniforms);
        twgl.drawBufferInfo(gl, this.quad);
    }
}
