globalThis.effectInit = (canvas) => {
  var gShaderToy = null;

  function ShaderToy() {
    this.mAudioContext = null;
    this.mCreated = false;
    this.mHttpReq = null;
    this.mEffect = null;
    this.mTo = null;
    this.mTOffset = 0;
    this.mCanvas = canvas;
    this.mFpsFrame = 0;
    this.mFpsTo = null;
    this.mIsPaused = false;
    this.mForceFrame = true;
    this.mInfo = null;
    this.mCode = null;

    var me = this;

    this.mHttpReq = new XMLHttpRequest();
    this.mTo = new Date().getTime();
    this.mTf = this.mTOffset;
    this.mFpsTo = this.mTo;
    this.mMouseIsDown = false;
    this.mMouseOriX = 0;
    this.mMouseOriY = 0;
    this.mMousePosX = 0;
    this.mMousePosY = 0;

    // --- audio context ---------------------

    this.mAudioContext = piCreateAudioContext();

    var resizeCB = function (xres, yres) {
      me.mForceFrame = true;
    };
    var crashCB = function () {};
    this.mEffect = new Effect(
      null,
      this.mAudioContext,
      this.mCanvas,
      this.RefreshTexturThumbail,
      this,
      true,
      false,
      resizeCB,
      crashCB
    );
    this.mCreated = true;
  }

  ShaderToy.prototype.startRendering = function () {
    var me = this;

    function renderLoop2() {
      setTimeout(renderLoop2, 1000 / 60);

      if (me.mIsPaused && !me.mForceFrame) {
        me.mEffect.UpdateInputs(0, false);
        return;
      }

      me.mForceFrame = false;
      var time = new Date().getTime();
      var ltime = me.mTOffset + time - me.mTo;

      if (me.mIsPaused) ltime = me.mTf;
      else me.mTf = ltime;

      var dtime = 1000.0 / 60.0;

      me.mEffect.Paint(
        ltime / 1000.0,
        dtime / 1000.0,
        60,
        me.mMouseOriX,
        me.mMouseOriY,
        me.mMousePosX,
        me.mMousePosY,
        me.mIsPaused
      );

      me.mFpsFrame++;

      if (time - me.mFpsTo > 1000) {
        var ffps = (1000.0 * me.mFpsFrame) / (time - me.mFpsTo);
        me.mFpsFrame = 0;
        me.mFpsTo = time;
      }
    }

    renderLoop2();
  };

  //---------------------------------

  ShaderToy.prototype.Stop = function () {
    this.mIsPaused = true;
    this.mEffect.StopOutputs();
  };

  ShaderToy.prototype.pauseTime = function () {
    var time = new Date().getTime();
    if (!this.mIsPaused) {
      this.Stop();
    } else {
      this.mTOffset = this.mTf;
      this.mTo = time;
      this.mIsPaused = false;
      this.mEffect.ResumeOutputs();
    }
  };

  ShaderToy.prototype.resetTime = function () {
    this.mTOffset = 0;
    this.mTo = new Date().getTime();
    this.mTf = 0;
    this.mFpsTo = this.mTo;
    this.mFpsFrame = 0;
    this.mForceFrame = true;
    this.mEffect.ResetTime();
  };

  ShaderToy.prototype.PauseInput = function (id) {
    return this.mEffect.PauseInput(0, id);
  };

  ShaderToy.prototype.MuteInput = function (id) {
    return this.mEffect.MuteInput(0, id);
  };

  ShaderToy.prototype.RewindInput = function (id) {
    this.mEffect.RewindInput(0, id);
  };

  ShaderToy.prototype.SetTexture = function (slot, url) {
    this.mEffect.NewTexture(0, slot, url);
  };

  ShaderToy.prototype.RefreshTexturThumbail = function (
    myself,
    slot,
    img,
    forceFrame,
    gui,
    guiID,
    time
  ) {
    myself.mForceFrame = forceFrame;
  };

  ShaderToy.prototype.GetTotalCompilationTime = function () {
    return this.mEffect.GetTotalCompilationTime();
  };

  ShaderToy.prototype.Load = function (jsn) {
    try {
      var res = this.mEffect.Load(jsn, false);
      this.mCode = res.mShader;

      if (res.mFailed === false) {
        this.mForceFrame = true;
      }

      this.mInfo = jsn.info;

      return {
        mFailed: false,
        mDate: jsn.info.date,
        mViewed: jsn.info.viewed,
        mName: jsn.info.name,
        mUserName: jsn.info.username,
        mDescription: jsn.info.description,
        mLikes: jsn.info.likes,
        mPublished: jsn.info.published,
        mHasLiked: jsn.info.hasliked,
        mTags: jsn.info.tags,
      };
    } catch (e) {
      return { mFailed: true };
    }
  };

  ShaderToy.prototype.Compile = function (onResolve) {
    this.mEffect.Compile(true, onResolve);
  };

  function iCompileAndStart(jsnShader) {
    gShaderToy = new ShaderToy();

    var gRes = gShaderToy.Load(jsnShader[0]);
    if (gRes.mFailed) {
      gShaderToy.pauseTime();
      gShaderToy.resetTime();
    } else {
      gShaderToy.Compile(function (worked) {
        if (!worked) return;

        if (gShaderToy.mIsPaused) {
          gShaderToy.Stop();
        }

        gShaderToy.startRendering();
      });
    }
  }

  function watchInit() {
    var jsnShader = [
      {
        ver: "0.1",
        info: {
          id: "fstyD4",
          date: "1653482786",
          viewed: 4819,
          name: "Coastal Landscape",
          username: "bitless",
          description:
            "I wanted to do something in the spirit of Van Gogh. It looks better on the full screen.",
          likes: 234,
          published: 1,
          flags: 0,
          usePreview: 0,
          tags: [],
        },
        renderpass: [
          {
            inputs: [],
            outputs: [{ id: "4dfGRr", channel: 0 }],
            code: '// Author: bitless\n// Title: Coastal Landscape\n\n// Thanks to Patricio Gonzalez Vivo & Jen Lowe for "The Book of Shaders"\n// and Fabrice Neyret (FabriceNeyret2) for https://shadertoyunofficial.wordpress.com/\n// and Inigo Quilez (iq) for  https://iquilezles.org/www/index.htm\n// and whole Shadertoy community for inspiration.\n\n#define p(t, a, b, c, d) ( a + b*cos( 6.28318*(c*t+d) ) ) //IQ\'s palette function (https://www.iquilezles.org/www/articles/palettes/palettes.htm)\n#define sp(t) p(t,vec3(.26,.76,.77),vec3(1,.3,1),vec3(.8,.4,.7),vec3(0,.12,.54)) //sky palette\n#define hue(v) ( .6 + .76 * cos(6.3*(v) + vec4(0,23,21,0) ) ) //hue\n\n// "Hash without Sine" by Dave_Hoskins.\n// https://www.shadertoy.com/view/4djSRW\nfloat hash12(vec2 p)\n{\n  vec3 p3  = fract(vec3(p.xyx) * .1031);\n    p3 += dot(p3, p3.yzx + 33.33);\n    return fract((p3.x + p3.y) * p3.z);\n}\n\nvec2 hash22(vec2 p)\n{\n  vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));\n    p3 += dot(p3, p3.yzx+33.33);\n    return fract((p3.xx+p3.yz)*p3.zy);\n}\n////////////////////////\n\nvec2 rotate2D (vec2 st, float a){\n    return  mat2(cos(a),-sin(a),sin(a),cos(a))*st;\n}\n\nfloat st(float a, float b, float s) //AA bar\n{\n    return smoothstep (a-s, a+s, b);\n}\n\nfloat noise( in vec2 p ) //gradient noise\n{\n    vec2 i = floor( p );\n    vec2 f = fract( p );\n    \n    vec2 u = f*f*(3.-2.*f);\n\n    return mix( mix( dot( hash22( i+vec2(0,0) ), f-vec2(0,0) ), \n                     dot( hash22( i+vec2(1,0) ), f-vec2(1,0) ), u.x),\n                mix( dot( hash22( i+vec2(0,1) ), f-vec2(0,1) ), \n                     dot( hash22( i+vec2(1,1) ), f-vec2(1,1) ), u.x), u.y);\n}\n\nvoid mainImage( out vec4 O, in vec2 g)\n{\n    vec2 r = iResolution.xy\n        ,uv = (g+g-r)/r.y\n        ,sun_pos = vec2(r.x/r.y*.42,-.53) //sun position \n        ,tree_pos = vec2(-r.x/r.y*.42,-.2) //tree position \n        ,sh, u, id, lc, t;\n\n    vec3 f, c;\n    float xd, yd, h, a, l;\n    vec4 C;\n    \n    float sm = 3./r.y; //smoothness factor for AA\n\n    sh = rotate2D(sun_pos, noise(uv+iTime*.25)*.3); //big noise on the sky\n     \n    if (uv.y > -.4) //drawing the sky\n    {\n        u = uv + sh;\n        \n        yd = 60.; //number of rings \n        \n        id =  vec2((length(u)+.01)*yd,0); //segment id: x - ring number, y - segment number in the ring  \n        xd = floor(id.x)*.09; //number of ring segments\n        h = (hash12(floor(id.xx))*.5+.25)*(iTime+10.)*.25; //ring shift\n        t = rotate2D (u,h); //rotate the ring to the desired angle\n    \n        id.y = atan(t.y,t.x)*xd;\n        lc = fract(id); //segment local coordinates\n        id -= lc;\n    \n        // determining the coordinates of the center of the segment in uv space\n        t = vec2(cos((id.y+.5)/xd)*(id.x+.5)/yd,sin((id.y+.5)/xd)*(id.x+.5)/yd); \n        t = rotate2D(t,-h) - sh;\n    \n        h = noise(t*vec2(.5,1)-vec2(iTime*.2,0)) //clouds\n            * step(-.25,t.y); //do not draw clouds below -.25\n        h = smoothstep (.052,.055, h);\n        \n        \n        lc += (noise(lc*vec2(1,4)+id))*vec2(.7,.2); //add fine noise\n        \n        f = mix (sp(sin(length(u)-.1))*.35, //sky background\n                mix(sp(sin(length(u)-.1)+(hash12(id)-.5)*.15),vec3(1),h), //mix sky color and clouds\n                st(abs(lc.x-.5),.4,sm*yd)*st(abs(lc.y-.5),.48,sm*xd));\n    };\n\n    if (uv.y < -.35) //drawing water\n    {\n\n        float cld = noise(-sh*vec2(.5,1)  - vec2(iTime*.2,0)); //cloud density opposite the center of the sun\n        cld = 1.- smoothstep(.0,.15,cld)*.5;\n\n        u = uv*vec2(1,15);\n        id = floor(u);\n\n        for (float i = 1.; i > -1.; i--) //drawing a wave and its neighbors from above and below\n        {\n            if (id.y+i < -5.)\n            {\n                lc = fract(u)-.5;\n                lc.y = (lc.y+(sin(uv.x*12.-iTime*3.+id.y+i))*.25-i)*4.; //set the waveform and divide it into four strips\n                h = hash12(vec2(id.y+i,floor(lc.y))); //the number of segments in the strip and its horizontal offset\n                \n                xd = 6.+h*4.;\n                yd = 30.;\n                lc.x = uv.x*xd+sh.x*9.; //divide the strip into segments\n                lc.x += sin(iTime * (.5 + h*2.))*.5; //add a cyclic shift of the strips horizontally\n                h = .8*smoothstep(5.,.0,abs(floor(lc.x)))*cld+.1; //determine brightness of the sun track \n                f = mix(f,mix(vec3(0,.1,.5),vec3(.35,.35,0),h),st(lc.y,0.,sm*yd)); //mix the color of the water and the color of the track for the background of the water \n                lc += noise(lc*vec2(3,.5))*vec2(.1,.6); //add fine noise to the segment\n                \n                f = mix(f,                                                                         //mix the background color \n                    mix(hue(hash12(floor(lc))*.1+.56).rgb*(1.2+floor(lc.y)*.17),vec3(1,1,0),h)     //and the stroke color\n                    ,st(lc.y,0.,sm*xd)\n                    *st(abs(fract(lc.x)-.5),.48,sm*xd)*st(abs(fract(lc.y)-.5),.3,sm*yd)\n                    );\n            }\n        }\n    }\n    \n    O = vec4(f,1);\n\n    ////////////////////// drawing the grass\n    a = 0.;\n    u = uv+noise(uv*2.)*.1 + vec2(0,sin(uv.x*1.+3.)*.4+.8);\n    \n    f = mix(vec3(.7,.6,.2),vec3(0,1,0),sin(iTime*.2)*.5+.5); //color of the grass, changing from green to yellow and back again\n    O = mix(O,vec4(f*.4,1),step(u.y,.0)); //draw grass background\n\n    xd = 60.;  //grass size\n    u = u*vec2(xd,xd/3.5); \n    \n\n    if (u.y < 1.2)\n    {\n        for (float y = 0.; y > -3.; y--)\n          {\n            for (float x = -2.; x <3.; x++)\n            {\n                id = floor(u) + vec2(x,y);\n                lc = (fract(u) + vec2(1.-x,-y))/vec2(5,3);\n                h = (hash12(id)-.5)*.25+.5; //shade and length for an individual blade of grass\n\n                lc-= vec2(.3,.5-h*.4);\n                lc.x += sin(((iTime*1.7+h*2.-id.x*.05-id.y*.05)*1.1+id.y*.5)*2.)*(lc.y+.5)*.5;\n                t = abs(lc)-vec2(.02,.5-h*.5);\n                l =  length(max(t,0.)) + min(max(t.x,t.y),0.); //distance to the segment (blade of grass)\n\n                l -= noise (lc*7.+id)*.1; //add fine noise\n                C = vec4(f*.25,st(l,.1,sm*xd*.09)); //grass outline                \n                C = mix(C,vec4(f                  //grass foregroud\n                            *(1.2+lc.y*2.)  //the grass is a little darker at the root\n                            *(1.8-h*2.5),1.)    //brightness variations for individual blades of grass\n                            ,st(l,.04,sm*xd*.09));\n                \n                O = mix (O,C,C.a*step (id.y,-1.));\n                a = max (a, C.a*step (id.y,-5.));  //a mask to cover the trunk of the tree with grasses in the foreground\n            }\n        }\n    }\n\n    float T = sin(iTime*.5); //tree swing cycle\n \n    if (abs(uv.x+tree_pos.x-.1-T*.1) < .6) // drawing the tree\n    {\n        u = uv + tree_pos;\n        // draw the trunk of the tree first\n        u.x -= sin(u.y+1.)*.2*(T+.75); //the trunk bends in the wind\n        u += noise(u*4.5-7.)*.25; //trunk curvature\n        \n        xd = 10., yd = 60.; \n        t = u * vec2(1,yd); //divide the trunk into segments\n        h = hash12(floor(t.yy)); //horizontal shift of the segments and the color tint of the segment  \n        t.x += h*.01;\n        t.x *= xd;\n        \n        lc = fract(t); //segment local coordinates\n        \n        float m = st(abs(t.x-.5),.5,sm*xd)*step(abs(t.y+20.),45.); //trunk mask\n        C = mix(vec4(.07) //outline color\n                ,vec4(.5,.3,0,1)*(.4+h*.4) //foreground color \n                ,st(abs(lc.y-.5),.4,sm*yd)*st(abs(lc.x-.5),.45,sm*xd));\n        C.a = m;\n        \n        xd = 30., yd = 15.;\n        \n        for (float xs =0.;xs<4.;xs++) //drawing four layers of foliage\n        {\n            u = uv + tree_pos + vec2 (xs/xd*.5 -(T +.75)*.15,-.7); //crown position\n            u += noise(u*vec2(2,1)+vec2(-iTime+xs*.05,0))*vec2(-.25,.1)*smoothstep (.5,-1.,u.y+.7)*.75; //leaves rippling in the wind\n    \n            t = u * vec2(xd,1.);\n            h = hash12(floor(t.xx)+xs*1.4); //number of segments for the row\n            \n            yd = 5.+ h*7.;\n            t.y *= yd;\n    \n            sh = t;\n            lc = fract(t);\n            h = hash12(t-lc); //segment color shade\n    \n            \n            t = (t-lc)/vec2(xd,yd)+vec2(0,.7);\n            \n            m = (step(0.,t.y)*step (length(t),.45) //the shape of the crown - the top \n                + step (t.y,0.)*step (-0.7+sin((floor(u.x)+xs*.5)*15.)*.2,t.y)) //the bottom\n                *step (abs(t.x),.5) //crown size horizontally\n                *st(abs(lc.x-.5),.35,sm*xd*.5); \n    \n            lc += noise((sh)*vec2(1.,3.))*vec2(.3,.3); //add fine noise\n            \n            f = hue((h+(sin(iTime*.2)*.5+.5))*.2).rgb-t.x; //color of the segment changes cyclically\n    \n            C = mix(C,\n                    vec4(mix(f*.15,f*.6*(.7+xs*.2), //mix outline and foreground color\n                        st(abs(lc.y-.5),.47,sm*yd)*st(abs(lc.x-.5),.2,sm*xd)),m)\n                    ,m);\n        }\n\n        O = mix (O,C,C.a*(1.-a));\n    }\n}',
            name: "Image",
            description: "",
            type: "image",
          },
        ],
      },
    ];

    iCompileAndStart(jsnShader);
  }

  watchInit();
};
