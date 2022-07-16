"use strict"

function bufferID_to_assetID( id )
{
    if( id===0 ) return '4dXGR8';
    if( id===1 ) return 'XsXGR8';
    if( id===2 ) return '4sXGR8';
    if( id===3 ) return 'XdfGR8';
    return 'none';
}
function assetID_to_bufferID( id )
{
    if( id==='4dXGR8' ) return 0;
    if( id==='XsXGR8' ) return 1;
    if( id==='4sXGR8' ) return 2;
    if( id==='XdfGR8' ) return 3;
    return -1;
}

function assetID_to_cubemapBuferID( id )
{
    if( id==='4dX3Rr' ) return 0;
    return -1;
}
function cubamepBufferID_to_assetID( id )
{
    if( id===0 ) return '4dX3Rr';
    return 'none';
}

function EffectPass( renderer, is20, isLowEnd, hasShaderTextureLOD, callback, obj, forceMuted, forcePaused, outputGainNode, copyProgram, id, effect  )
{
    this.mID = id;
    this.mInputs  = [null, null, null, null ];
    this.mOutputs = [null, null, null, null ];
    this.mSource = null;

    this.mGainNode = outputGainNode;
    this.mSoundShaderCompiled = false;

    this.mEffect = effect;
    this.mRenderer = renderer;
    this.mProgramCopy = copyProgram;
    this.mCompilationTime = 0;

    this.mType = "none";
    this.mName = "none";
    this.mFrame = 0;

    this.mShaderTextureLOD = hasShaderTextureLOD;
    this.mIs20 = is20;
    this.mIsLowEnd = isLowEnd;
    this.mTextureCallbackFun = callback;
    this.mTextureCallbackObj = obj;
    this.mForceMuted = forceMuted;
    this.mForcePaused = forcePaused;
}

EffectPass.prototype.MakeHeader_Image = function()
{
    let header = "";

    header += "#define HW_PERFORMANCE " + ((this.mIsLowEnd===true)?"0":"1") + "\n";

    header += "uniform vec3      iResolution;\n" +
              "uniform float     iTime;\n" +
              "uniform float     iChannelTime[4];\n" +
              "uniform vec4      iMouse;\n" +
              "uniform vec4      iDate;\n" +
              "uniform float     iSampleRate;\n" +
              "uniform vec3      iChannelResolution[4];\n" +
              "uniform int       iFrame;\n" +
              "uniform float     iTimeDelta;\n" +
              "uniform float     iFrameRate;\n";

    for( let i=0; i<this.mInputs.length; i++ )
    {
        let inp = this.mInputs[i];

        // old API
             if( inp===null )                  header += "uniform sampler2D iChannel" + i + ";\n";
        else if( inp.mInfo.mType==="cubemap" ) header += "uniform samplerCube iChannel" + i + ";\n";
        else if( inp.mInfo.mType==="volume"  ) header += "uniform sampler3D iChannel" + i + ";\n";
        else                                  header += "uniform sampler2D iChannel" + i + ";\n";

        // new API (see shadertoy.com/view/wtdGW8)
        header += "uniform struct {\n";
             if( inp===null )                  header += "  sampler2D";
        else if( inp.mInfo.mType==="cubemap" ) header += "  samplerCube";
        else if( inp.mInfo.mType==="volume"  ) header += "  sampler3D";
        else                                  header += "  sampler2D";
        header +=        " sampler;\n";
        header += "  vec3  size;\n";
        header += "  float time;\n";
        header += "  int   loaded;\n";
        header += "}iCh" + i + ";\n";
    }
	header += "void mainImage( out vec4 c, in vec2 f );\n";
    header += "void st_assert( bool cond );\n";
    header += "void st_assert( bool cond, int v );\n";

    if( this.mIs20 )
    {
        header += "\nout vec4 shadertoy_out_color;\n" +
        "void st_assert( bool cond, int v ) {if(!cond){if(v==0)shadertoy_out_color.x=-1.0;else if(v==1)shadertoy_out_color.y=-1.0;else if(v==2)shadertoy_out_color.z=-1.0;else shadertoy_out_color.w=-1.0;}}\n" +
        "void st_assert( bool cond        ) {if(!cond)shadertoy_out_color.x=-1.0;}\n" +
        "void main( void )" +
        "{" +
            "shadertoy_out_color = vec4(1.0,1.0,1.0,1.0);" +
            "vec4 color = vec4(0.0,0.0,0.0,1.0);" +
            "mainImage( color, gl_FragCoord.xy );" +
            "if(shadertoy_out_color.x<0.0) color=vec4(1.0,0.0,0.0,1.0);" +
            "if(shadertoy_out_color.y<0.0) color=vec4(0.0,1.0,0.0,1.0);" +
            "if(shadertoy_out_color.z<0.0) color=vec4(0.0,0.0,1.0,1.0);" +
            "if(shadertoy_out_color.w<0.0) color=vec4(1.0,1.0,0.0,1.0);" +
            "shadertoy_out_color = vec4(color.xyz,1.0);" +
        "}";
    }
    else
    {
        header += "" +
        "void st_assert( bool cond, int v ) {if(!cond){if(v==0)gl_FragColor.x=-1.0;else if(v==1)gl_FragColor.y=-1.0;else if(v==2)gl_FragColor.z=-1.0;else gl_FragColor.w=-1.0;}}\n" +
        "void st_assert( bool cond        ) {if(!cond)gl_FragColor.x=-1.0;}\n" +
        "void main( void )" +
        "{" +
            "gl_FragColor = vec4(0.0,0.0,0.0,1.0);" +
            "vec4 color = vec4(0.0,0.0,0.0,1.0);" +
            "mainImage( color, gl_FragCoord.xy );" +
            "color.w = 1.0;" +
            "if(gl_FragColor.w<0.0) color=vec4(1.0,0.0,0.0,1.0);" +
            "if(gl_FragColor.x<0.0) color=vec4(1.0,0.0,0.0,1.0);" +
            "if(gl_FragColor.y<0.0) color=vec4(0.0,1.0,0.0,1.0);" +
            "if(gl_FragColor.z<0.0) color=vec4(0.0,0.0,1.0,1.0);" +
            "if(gl_FragColor.w<0.0) color=vec4(1.0,1.0,0.0,1.0);" +
            "gl_FragColor = vec4(color.xyz,1.0);"+
        "}";
    }
    header += "\n";

    /*
    this.mImagePassFooterVR = "\n" +
    "uniform vec4 unViewport;\n" +
    "uniform vec3 unCorners[5];\n";
    if( this.mIs20 )
        this.mImagePassFooterVR += "\nout vec4 outColor;\n";
    this.mImagePassFooterVR += "void main( void )" +
    "{" +
        "vec4 color = vec4(0.0,0.0,0.0,1.0);" +

        "vec3 ro = unCorners[4];" +
        "vec2 uv = (gl_FragCoord.xy - unViewport.xy)/unViewport.zw;" +
        "vec3 rd = normalize( mix( mix( unCorners[0], unCorners[1], uv.x )," +
                                  "mix( unCorners[3], unCorners[2], uv.x ), uv.y ) - ro);" +

        "mainVR( color, gl_FragCoord.xy-unViewport.xy, ro, rd );" +
        "color.w = 1.0;"
    if( this.mIs20 )
        this.mImagePassFooterVR +=  "outColor = color;}";
    else
        this.mImagePassFooterVR +=  "gl_FragColor = color;}";
    */
    this.mHeader = header;
    this.mHeaderLength = 0;
}

EffectPass.prototype.MakeHeader_Buffer = function()
{
    let header = "";

    header += "#define HW_PERFORMANCE " + ((this.mIsLowEnd===true)?"0":"1") + "\n";

    header += "uniform vec3      iResolution;\n" +
              "uniform float     iTime;\n" +
              "uniform float     iChannelTime[4];\n" +
              "uniform vec4      iMouse;\n" +
              "uniform vec4      iDate;\n" +
              "uniform float     iSampleRate;\n" +
              "uniform vec3      iChannelResolution[4];\n" +
              "uniform int       iFrame;\n" +
              "uniform float     iTimeDelta;\n" +
              "uniform float     iFrameRate;\n";

    for (let i = 0; i < this.mInputs.length; i++)
    {
        let inp = this.mInputs[i];
             if( inp===null )                  header += "uniform sampler2D iChannel" + i + ";\n";
        else if( inp.mInfo.mType==="cubemap" ) header += "uniform samplerCube iChannel" + i + ";\n";
        else if( inp.mInfo.mType==="volume"  ) header += "uniform sampler3D iChannel" + i + ";\n";
        else                                  header += "uniform sampler2D iChannel" + i + ";\n";
    }

	header += "void mainImage( out vec4 c,  in vec2 f );\n"

    if( this.mIs20 )
        header += "\nout vec4 outColor;\n";
    header += "\nvoid main( void )\n" +
    "{" +
        "vec4 color = vec4(0.0,0.0,0.0,1.0);" +
        "mainImage( color, gl_FragCoord.xy );";
    if( this.mIs20 )
        header +="outColor = color; }";
    else
        header +="gl_FragColor = color; }";
    header += "\n";

    /*
    this.mImagePassFooterVR = "\n" +
    "uniform vec4 unViewport;\n" +
    "uniform vec3 unCorners[5];\n";
    if( this.mIs20 )
    this.mImagePassFooterVR += "\nout vec4 outColor;\n";
    this.mImagePassFooterVR += "\nvoid main( void )\n" +
    "{" +
        "vec4 color = vec4(0.0,0.0,0.0,1.0);" +

        "vec3 ro = unCorners[4];" +
        "vec2 uv = (gl_FragCoord.xy - unViewport.xy)/unViewport.zw;" +
        "vec3 rd = normalize( mix( mix( unCorners[0], unCorners[1], uv.x )," +
                                  "mix( unCorners[3], unCorners[2], uv.x ), uv.y ) - ro);" +

        "mainVR( color, gl_FragCoord.xy-unViewport.xy, ro, rd );";
    if( this.mIs20 )
        this.mImagePassFooterVR +="outColor = color; }";
    else
        this.mImagePassFooterVR +="gl_FragColor = color; }";
    */
    this.mHeader = header;
    this.mHeaderLength = 0;
}


EffectPass.prototype.MakeHeader_Cubemap = function()
{
    let header = "";

    header += "#define HW_PERFORMANCE " + ((this.mIsLowEnd===true)?"0":"1") + "\n";

    header += "uniform vec3      iResolution;\n" +
              "uniform float     iTime;\n" +
              "uniform float     iChannelTime[4];\n" +
              "uniform vec4      iMouse;\n" +
              "uniform vec4      iDate;\n" +
              "uniform float     iSampleRate;\n" +
              "uniform vec3      iChannelResolution[4];\n" +
              "uniform int       iFrame;\n" +
              "uniform float     iTimeDelta;\n" +
              "uniform float     iFrameRate;\n";

    for (let i = 0; i < this.mInputs.length; i++)
    {
        let inp = this.mInputs[i];
             if( inp===null )                  header += "uniform sampler2D iChannel" + i + ";\n";
        else if( inp.mInfo.mType==="cubemap" ) header += "uniform samplerCube iChannel" + i + ";\n";
        else if( inp.mInfo.mType==="volume"  ) header += "uniform sampler3D iChannel" + i + ";\n";
        else                                   header += "uniform sampler2D iChannel" + i + ";\n";
    }

	header += "void mainCubemap( out vec4 c, in vec2 f, in vec3 ro, in vec3 rd );\n"

    header += "\n" +
    "uniform vec4 unViewport;\n" +
    "uniform vec3 unCorners[5];\n";
    if( this.mIs20 )
        header += "\nout vec4 outColor;\n";
    header += "\nvoid main( void )\n" +
    "{" +
        "vec4 color = vec4(0.0,0.0,0.0,1.0);" +

        "vec3 ro = unCorners[4];" +
        "vec2 uv = (gl_FragCoord.xy - unViewport.xy)/unViewport.zw;" +
        "vec3 rd = normalize( mix( mix( unCorners[0], unCorners[1], uv.x )," +
                                  "mix( unCorners[3], unCorners[2], uv.x ), uv.y ) - ro);" +

        "mainCubemap( color, gl_FragCoord.xy-unViewport.xy, ro, rd );";
    if( this.mIs20 )
        header +="outColor = color; }";
    else
        header +="gl_FragColor = color; }";
    header += "\n";

    this.mHeader = header;
    this.mHeaderLength = 0;
}

EffectPass.prototype.MakeHeader_Sound = function()
{
    let header = "";

    header += "#define HW_PERFORMANCE " + ((this.mIsLowEnd===true)?"0":"1") + "\n";

    header += "uniform float     iChannelTime[4];\n" +
              "uniform float     iTimeOffset;\n" +
              "uniform int       iSampleOffset;\n" +
              "uniform vec4      iDate;\n" +
              "uniform float     iSampleRate;\n" +
              "uniform vec3      iChannelResolution[4];\n";

    for (let i=0; i<this.mInputs.length; i++ )
    {
        let inp = this.mInputs[i];

        if( inp!==null && inp.mInfo.mType==="cubemap" )
            header += "uniform samplerCube iChannel" + i + ";\n";
        else
            header += "uniform sampler2D iChannel" + i + ";\n";
    }
    header += "\n";
    header += "vec2 mainSound( in int samp, float time );\n";

    if( this.mIs20 )
    {
        header += "out vec4 outColor; void main()" +
            "{" +
            "float t = iTimeOffset + ((gl_FragCoord.x-0.5) + (gl_FragCoord.y-0.5)*512.0)/iSampleRate;" +
            "int   s = iSampleOffset + int(gl_FragCoord.y-0.2)*512 + int(gl_FragCoord.x-0.2);" +
            "vec2 y = mainSound( s, t );" +
            "vec2 v  = floor((0.5+0.5*y)*65536.0);" +
            "vec2 vl =   mod(v,256.0)/255.0;" +
            "vec2 vh = floor(v/256.0)/255.0;" +
            "outColor = vec4(vl.x,vh.x,vl.y,vh.y);" +
            "}";
    }
    else
    {
        header += "void main()" +
            "{" +
            "float t = iTimeOffset + ((gl_FragCoord.x-0.5) + (gl_FragCoord.y-0.5)*512.0)/iSampleRate;" +
            "vec2 y = mainSound( 0, t );" +
            "vec2 v  = floor((0.5+0.5*y)*65536.0);" +
            "vec2 vl =   mod(v,256.0)/255.0;" +
            "vec2 vh = floor(v/256.0)/255.0;" +
            "gl_FragColor = vec4(vl.x,vh.x,vl.y,vh.y);" +
            "}";
    }
    header += "\n";
    this.mHeader = header;
    this.mHeaderLength = 0;
}


EffectPass.prototype.MakeHeader_Common = function ()
{
    let header = "";
    let headerlength = 0;

    header += "uniform vec4      iDate;\n" +
              "uniform float     iSampleRate;\n";
    headerlength += 2;

    if (this.mIs20)
    {
        header += "out vec4 outColor;\n";
        headerlength += 1;
    }
    header += "void main( void )\n";
    headerlength += 1;

    if (this.mIs20)
        header += "{ outColor = vec4(0.0); }";
    else
        header += "{ gl_FragColor = vec4(0.0); }";
    headerlength += 1;
    header += "\n";
    headerlength += 1;

    this.mHeader = header;
    this.mHeaderLength = headerlength;
}

EffectPass.prototype.MakeHeader = function()
{
         if( this.mType==="image" ) this.MakeHeader_Image();
    else if( this.mType==="sound" ) this.MakeHeader_Sound();
    else if( this.mType==="buffer") this.MakeHeader_Buffer();
    else if( this.mType==="common") this.MakeHeader_Common();
    else if( this.mType==="cubemap") this.MakeHeader_Cubemap();
    else console.log("ERROR 4");
}

EffectPass.prototype.Create_Image = function( wa )
{
    this.MakeHeader();
    this.mSampleRate = 44100;
    this.mSupportsVR = false;
    this.mProgram = null;
    this.mError = false;
    this.mErrorStr = "";
    this.mTranslatedSource = null;
    //this.mProgramVR = null;
}
EffectPass.prototype.Destroy_Image = function( wa )
{
}

EffectPass.prototype.Create_Buffer = function( wa )
{
    this.MakeHeader();
    this.mSampleRate = 44100;
    this.mSupportsVR = false;
    this.mProgram = null;
    this.mError = false;
    this.mErrorStr = "";
    this.mTranslatedSource = null;
    //this.mProgramVR = null;
}

EffectPass.prototype.Destroy_Buffer = function( wa )
{
}

EffectPass.prototype.Create_Cubemap = function( wa )
{
    this.MakeHeader();
    this.mSampleRate = 44100;
    this.mProgram = null;
    this.mError = false;
    this.mErrorStr = "";
    this.mTranslatedSource = null;
}

EffectPass.prototype.Destroy_Cubemap = function( wa )
{
}

EffectPass.prototype.Create_Common = function( wa )
{
    this.mProgram = null;
    this.mError = false;
    this.mErrorStr = "";
    this.MakeHeader();
}
EffectPass.prototype.Destroy_Common = function( wa )
{
}

EffectPass.prototype.Create_Sound = function (wa)
{
    this.MakeHeader();


    this.mProgram = null;
    this.mError = false;
    this.mErrorStr = "";
    this.mTranslatedSource = null;
    this.mSampleRate = 44100;
    this.mPlayTime = 60*3;
    this.mPlaySamples = this.mPlayTime*this.mSampleRate;
    this.mBuffer = wa.createBuffer( 2, this.mPlaySamples, this.mSampleRate );

    //-------------------
    this.mTextureDimensions = 512;
    this.mRenderTexture = this.mRenderer.CreateTexture(this.mRenderer.TEXTYPE.T2D,
                                                       this.mTextureDimensions, this.mTextureDimensions,
                                                       this.mRenderer.TEXFMT.C4I8,
                                                       this.mRenderer.FILTER.NONE,
                                                       this.mRenderer.TEXWRP.CLAMP, null);
    this.mRenderFBO = this.mRenderer.CreateRenderTarget(this.mRenderTexture, null, null, null, null, false);

    //-----------------------------

    // ArrayBufferView pixels;
    this.mTmpBufferSamples = this.mTextureDimensions*this.mTextureDimensions;
    this.mData = new Uint8Array( this.mTmpBufferSamples*4 );

    this.mPlaying = false;
}

EffectPass.prototype.Destroy_Sound = function( wa )
{
    if( this.mPlayNode!==null ) this.mPlayNode.stop();
    this.mPlayNode = null;
    this.mBuffer = null;
    this.mData = null;

    this.mRenderer.DestroyRenderTarget(this.mRenderFBO);
    this.mRenderer.DestroyTexture(this.mRenderTexture);
}

EffectPass.prototype.Create = function( passType, wa )
{
    this.mType = passType;
    this.mSource = null;

         if( passType==="image" ) this.Create_Image( wa );
    else if( passType==="sound" ) this.Create_Sound( wa );
    else if( passType==="buffer") this.Create_Buffer( wa );
    else if( passType==="common") this.Create_Common( wa );
    else if( passType==="cubemap") this.Create_Cubemap( wa );
    else alert("ERROR 1");
}

EffectPass.prototype.SetName = function (passName)
{
    this.mName = passName;
}

EffectPass.prototype.SetCode = function (src)
{
    this.mSource = src;
}

EffectPass.prototype.Destroy = function( wa )
{
    this.mSource = null;
         if( this.mType==="image" ) this.Destroy_Image( wa );
    else if( this.mType==="sound" ) this.Destroy_Sound( wa );
    else if( this.mType==="buffer") this.Destroy_Buffer( wa );
    else if( this.mType==="common") this.Destroy_Common( wa );
    else if( this.mType==="cubemap") this.Destroy_Cubemap( wa );
    else alert("ERROR 2");
}

EffectPass.prototype.NewShader_Sound = function( shaderCode, commonShaderCodes)
{
    let vsSource = null;

    if( this.mIs20 )
        vsSource = "layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
    else
        vsSource = "attribute vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";

    let fsSource = this.mHeader;
    for( let i=0; i<commonShaderCodes.length; i++ )
    {
        fsSource += commonShaderCodes[i]+'\n';
    }
    this.mHeaderLength = fsSource.split(/\r\n|\r|\n/).length;
    fsSource += shaderCode;

    this.mSoundShaderCompiled = false;

    return [vsSource, fsSource];
}

EffectPass.prototype.NewShader_Image = function ( shaderCode, commonShaderCodes )
{
    this.mSupportsVR = false;


    let vsSource = null;
    if( this.mIs20 )
        vsSource = "layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
    else
        vsSource = "attribute vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";

    let fsSource = this.mHeader;
    for (let i = 0; i < commonShaderCodes.length; i++)
    {
        fsSource += commonShaderCodes[i]+'\n';
    }
    this.mHeaderLength = fsSource.split(/\r\n|\r|\n/).length;
    fsSource += shaderCode;

    return [vsSource, fsSource];


    /*
    let n1 = shaderCode.indexOf("mainVR(");
    let n2 = shaderCode.indexOf("mainVR (");
    let n3 = shaderCode.indexOf("mainVR  (");
    if( n1>0 || n2>0 || n3>0 )
    {
        let vsSourceVR;
        if( this.mIs20 )
            vsSourceVR = "layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
        else
            vsSourceVR = "attribute in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";

        let fsSourceVR = this.mHeader;
        for (let i = 0; i < commonShaderCodes.length; i++) {
            fsSourceVR += commonShaderCodes[i];
        }
        fsSourceVR += shaderCode;
        fsSourceVR += this.mImagePassFooterVR;

        let res = this.mRenderer.CreateShader(vsSource, fsSourceVR, preventCache);
        if( res.mResult == false )
        {
            return res.mInfo;
        }
        if( this.mProgramVR != null )
            this.mRenderer.DestroyShader( this.mProgramVR );

        this.mSupportsVR = true;
        this.mProgramVR = res;
    }
    */
}

EffectPass.prototype.NewShader_Cubemap = function( shaderCode, commonShaderCodes )
{
    let vsSource = null;
    if( this.mIs20 )
        vsSource = "layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
    else
        vsSource = "attribute vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";

    let fsSource = this.mHeader;
    for (let i = 0; i < commonShaderCodes.length; i++)
    {
        fsSource += commonShaderCodes[i]+'\n';
    }

    this.mHeaderLength = fsSource.split(/\r\n|\r|\n/).length;

    fsSource += shaderCode;

    return [vsSource, fsSource];
}


EffectPass.prototype.NewShader_Common = function (shaderCode )
{
    let vsSource = null;
    if (this.mIs20)
        vsSource = "layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
    else
        vsSource = "attribute vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";

    let fsSource = this.mHeader + shaderCode;

    return [vsSource, fsSource];
}

EffectPass.prototype.NewShader = function ( commonSourceCodes, preventCache, onResolve)
{
    if( this.mRenderer===null ) return;

    let vs_fs = null;

         if( this.mType==="sound"  ) vs_fs = this.NewShader_Sound(   this.mSource, commonSourceCodes );
    else if( this.mType==="image"  ) vs_fs = this.NewShader_Image(   this.mSource, commonSourceCodes );
    else if( this.mType==="buffer" ) vs_fs = this.NewShader_Image(   this.mSource, commonSourceCodes );
    else if( this.mType==="common" ) vs_fs = this.NewShader_Common(  this.mSource,                   );
    else if( this.mType==="cubemap") vs_fs = this.NewShader_Cubemap( this.mSource, commonSourceCodes );
    else { console.log("ERROR 3: \"" + this.mType + "\""); return; }

    let me = this;
    this.mRenderer.CreateShader(vs_fs[0], vs_fs[1], preventCache, false,
        function (worked, info)
        {
            if (worked === true)
            {
                if (me.mType === "sound")
                {
                    me.mSoundShaderCompiled = true;
                }

                me.mCompilationTime = info.mTime;
                me.mError = false;
                me.mErrorStr = "No Errors";
                if (me.mProgram !== null)
                    me.mRenderer.DestroyShader(me.mProgram);
                me.mTranslatedSource = me.mRenderer.GetTranslatedShaderSource(info);
                me.mProgram = info;
            }
            else
            {
                me.mError = true;
                me.mErrorStr = info.mErrorStr;
            }
            onResolve();
        });
}

EffectPass.prototype.DestroyInput = function( id )
{
    if( this.mInputs[id]===null ) return;

    if( this.mInputs[id].mInfo.mType==="texture" )
    {
        if( this.mInputs[id].globject !== null )
            this.mRenderer.DestroyTexture(this.mInputs[id].globject);
    }
    if( this.mInputs[id].mInfo.mType==="volume" )
    {
        if( this.mInputs[id].globject !== null )
            this.mRenderer.DestroyTexture(this.mInputs[id].globject);
    }
    else if( this.mInputs[id].mInfo.mType==="webcam" )
    {
        this.mInputs[id].video.pause();
        this.mInputs[id].video.src = "";

        if( this.mInputs[id].video.srcObject!==null )
        {
        let tracks = this.mInputs[id].video.srcObject.getVideoTracks();
        if( tracks ) tracks[0].stop();
        }
        this.mInputs[id].video = null;
        if( this.mInputs[id].globject !== null )
            this.mRenderer.DestroyTexture(this.mInputs[id].globject);
    }
    else if( this.mInputs[id].mInfo.mType==="video" )
    {
        this.mInputs[id].video.pause();
        this.mInputs[id].video = null;
        if( this.mInputs[id].globject !== null )
            this.mRenderer.DestroyTexture(this.mInputs[id].globject);
    }
    else if( this.mInputs[id].mInfo.mType==="music" || this.mInputs[id].mInfo.mType==="musicstream")
    {
        this.mInputs[id].audio.pause();
        this.mInputs[id].audio.mSound.mFreqData = null;
        this.mInputs[id].audio.mSound.mWaveData = null;
        this.mInputs[id].audio = null;
        if( this.mInputs[id].globject !== null )
            this.mRenderer.DestroyTexture(this.mInputs[id].globject);
    }
    else if( this.mInputs[id].mInfo.mType==="cubemap" )
    {
        if( this.mInputs[id].globject !== null )
            this.mRenderer.DestroyTexture(this.mInputs[id].globject);
    }
    else if( this.mInputs[id].mInfo.mType==="keyboard" )
    {
        //if( this.mInputs[id].globject != null )
          //  this.mRenderer.DestroyTexture(this.mInputs[id].globject);
    }
    else if( this.mInputs[id].mInfo.mType==="mic" )
    {
        this.mInputs[id].mic = null;
        if( this.mInputs[id].globject !== null )
            this.mRenderer.DestroyTexture(this.mInputs[id].globject);
    }

    this.mInputs[id] = null;
}

EffectPass.prototype.TooglePauseInput = function( wa, id )
{
    var me = this;
    let inp = this.mInputs[id];

    if( inp===null )
    {
    }
    else if( inp.mInfo.mType==="texture" )
    {
    }
    else if( inp.mInfo.mType==="volume" )
    {
    }
    else if( inp.mInfo.mType==="video" )
    {
        if( inp.video.mPaused )
        {
            inp.video.play();
            inp.video.mPaused = false;
        }
        else
        {
            inp.video.pause();
            inp.video.mPaused = true;
        }
        return inp.video.mPaused;
    }
    else if( inp.mInfo.mType==="music" || inp.mInfo.mType==="musicstream")
    {
        wa.resume()
        if( inp.audio.mPaused )
        {
            if( inp.loaded )
            {
                inp.audio.play();
            }
            inp.audio.mPaused = false;
        }
        else
        {
            inp.audio.pause();
            inp.audio.mPaused = true;
        }
        return inp.audio.mPaused;
    }

    return null;
}

EffectPass.prototype.StopInput = function( id )
{
    let inp = this.mInputs[id];

    if( inp===null )
    {
    }
    else if( inp.mInfo.mType==="texture" )
    {
    }
    else if( inp.mInfo.mType==="volume" )
    {
    }
    else if( inp.mInfo.mType==="video" )
    {
        if( inp.video.mPaused === false )
        {
            inp.video.pause();
            inp.video.mPaused = true;
        }
        return inp.video.mPaused;
    }
    else if( inp.mInfo.mType==="music" || inp.mInfo.mType==="musicstream" )
    {
        if( inp.audio.mPaused === false )
        {
            inp.audio.pause();
            inp.audio.mPaused = true;
        }
        return inp.audio.mPaused;
    }
    return null;
}

EffectPass.prototype.ResumeInput = function( id )
{
    let inp = this.mInputs[id];

    if( inp===null )
    {
    }
    else if( inp.mInfo.mType==="texture" )
    {
    }
    else if( inp.mInfo.mType==="volume" )
    {
    }
    else if( inp.mInfo.mType==="video" )
    {
        if( inp.video.mPaused )
        {
            inp.video.play();
            inp.video.mPaused = false;
        }
        return inp.video.mPaused;
    }
    else if( inp.mInfo.mType==="music" || inp.mInfo.mType==="musicstream" )
    {
        if( inp.audio.mPaused )
        {
            inp.audio.play();
            inp.audio.mPaused = false;
        }
        return inp.audio.mPaused;
    }
    return null;
}

EffectPass.prototype.RewindInput = function( wa, id )
{
    var me = this;
    let inp = this.mInputs[id];

    if( inp==null )
    {
    }
    else if( inp.mInfo.mType==="texture" )
    {
    }
    else if( inp.mInfo.mType==="volume" )
    {
    }
    else if( inp.mInfo.mType==="video" )
    {
        if( inp.loaded )
        {
            inp.video.currentTime = 0;
        }
    }
    else if( inp.mInfo.mType==="music" || inp.mInfo.mType==="musicstream")
    {
        wa.resume()
        if( inp.loaded )
        {
            inp.audio.currentTime = 0;
        }
    }
}

EffectPass.prototype.MuteInput = function( wa, id )
{
    let inp = this.mInputs[id];
    if( inp===null ) return;

    if( inp.mInfo.mType==="video" )
    {
        inp.video.muted = true;
        inp.video.mMuted = true;
    }
    else if( inp.mInfo.mType==="music" || inp.mInfo.mType==="musicstream")
    {
        if (wa !== null) inp.audio.mSound.mGain.gain.value = 0.0;
        inp.audio.mMuted = true;
    }
}

EffectPass.prototype.UnMuteInput = function( wa, id )
{
    let inp = this.mInputs[id];
    if( inp===null ) return;

    if( inp.mInfo.mType==="video" )
    {
        inp.video.muted = false;
        inp.video.mMuted = false;
    }
    else if( inp.mInfo.mType==="music" || inp.mInfo.mType==="musicstream")
    {
        if (wa !== null) inp.audio.mSound.mGain.gain.value = 1.0;
        inp.audio.mMuted = false;
    }
}

EffectPass.prototype.ToggleMuteInput = function( wa, id )
{
    var me = this;
    let inp = this.mInputs[id];
    if( inp===null ) return null;

    if( inp.mInfo.mType==="video" )
    {
        if( inp.video.mMuted ) this.UnMuteInput(wa,id);
        else                   this.MuteInput(wa,id);
        return inp.video.mMuted;
    }
    else if( inp.mInfo.mType==="music" || inp.mInfo.mType==="musicstream")
    {
        if( inp.audio.mMuted ) this.UnMuteInput(wa,id);
        else                   this.MuteInput(wa,id);
        return inp.audio.mMuted;
    }

    return null;
}

EffectPass.prototype.UpdateInputs = function( wa, forceUpdate, keyboard )
{
   for (let i=0; i<this.mInputs.length; i++ )
   {
        let inp = this.mInputs[i];

        if( inp===null )
        {
            if( forceUpdate )
            {
              if( this.mTextureCallbackFun!==null )
                  this.mTextureCallbackFun( this.mTextureCallbackObj, i, null, false, 0, 0, -1.0, this.mID );
            }
        }
        else if( inp.mInfo.mType==="texture" )
        {
            if( inp.loaded && forceUpdate )
            {
              if( this.mTextureCallbackFun!==null )
                  this.mTextureCallbackFun( this.mTextureCallbackObj, i, inp.image, true, 1, 1, -1.0, this.mID );
            }
        }
        else if( inp.mInfo.mType==="volume" )
        {
            if( inp.loaded && forceUpdate )
            {
              if( this.mTextureCallbackFun!==null )
                  this.mTextureCallbackFun( this.mTextureCallbackObj, i, inp.mPreview, true, 1, 1, -1.0, this.mID );
            }
        }
        else if( inp.mInfo.mType==="cubemap" )
        {
            if( inp.loaded && forceUpdate )
            {
                if( this.mTextureCallbackFun!==null )
                {
                    let img = (assetID_to_cubemapBuferID(inp.mInfo.mID)===-1) ? inp.image[0] : inp.mImage;
                    this.mTextureCallbackFun( this.mTextureCallbackObj, i, img, true, 2, 1, -1.0, this.mID );
                }
            }
        }
        else if( inp.mInfo.mType==="keyboard" )
        {
            if( this.mTextureCallbackFun!==null )
                this.mTextureCallbackFun( this.mTextureCallbackObj, i, {mImage:keyboard.mIcon,mData:keyboard.mData}, false, 6, 0, -1.0, this.mID );
        }
        else if( inp.mInfo.mType==="video" )
        {
            if( inp.video.readyState === inp.video.HAVE_ENOUGH_DATA )
            {
                if( this.mTextureCallbackFun!==null )
                    this.mTextureCallbackFun( this.mTextureCallbackObj, i, inp.video, false, 3, 1, -1, this.mID );
            }
        }
        else if( inp.mInfo.mType==="music" || inp.mInfo.mType==="musicstream" )
        {
              if( inp.loaded && inp.audio.mPaused === false && inp.audio.mForceMuted === false )
              {
                  if( wa !== null )
                  {
                      inp.audio.mSound.mAnalyser.getByteFrequencyData(  inp.audio.mSound.mFreqData );
                      inp.audio.mSound.mAnalyser.getByteTimeDomainData( inp.audio.mSound.mWaveData );
                  }

                  if (this.mTextureCallbackFun!==null)
                  {
                           if (inp.mInfo.mType === "music")       this.mTextureCallbackFun(this.mTextureCallbackObj, i, {wave:(wa==null)?null:inp.audio.mSound.mFreqData}, false, 4, 1, inp.audio.currentTime, this.mID);
                      else if (inp.mInfo.mType === "musicstream") this.mTextureCallbackFun(this.mTextureCallbackObj, i, {wave:(wa==null)?null:inp.audio.mSound.mFreqData, info: inp.audio.soundcloudInfo}, false, 8, 1, inp.audio.currentTime, this.mID);
                  }
              }
              else if( inp.loaded===false )
              {
                  if (this.mTextureCallbackFun!==null)
                      this.mTextureCallbackFun(this.mTextureCallbackObj, i, {wave:null}, false, 4, 0, -1.0, this.mID);
              }
        }
        else if( inp.mInfo.mType==="mic" )
        {
              if( inp.loaded && inp.mForceMuted === false )
              {
                  if( wa !== null )
                  {
                      inp.mAnalyser.getByteFrequencyData(  inp.mFreqData );
                      inp.mAnalyser.getByteTimeDomainData( inp.mWaveData );
                  }
                  if( this.mTextureCallbackFun!==null )
                      this.mTextureCallbackFun( this.mTextureCallbackObj, i, {wave: ((wa==null)?null:inp.mFreqData) }, false, 5, 1, 0, this.mID );
              }
        }
        else if( inp.mInfo.mType==="buffer" )
        {
            if( inp.loaded && forceUpdate )
            {
              if( this.mTextureCallbackFun!==null )
                  this.mTextureCallbackFun( this.mTextureCallbackObj, i, {texture:inp.image, data:null}, true, 9, 1, -1.0, this.mID );
            }
        }
    }
}

EffectPass.prototype.Sampler2Renderer = function (sampler)
{
    let filter = this.mRenderer.FILTER.NONE;
    if (sampler.filter === "linear") filter = this.mRenderer.FILTER.LINEAR;
    if (sampler.filter === "mipmap") filter = this.mRenderer.FILTER.MIPMAP;
    let wrap = this.mRenderer.TEXWRP.REPEAT;
    if (sampler.wrap === "clamp") wrap = this.mRenderer.TEXWRP.CLAMP;
    let vflip = false;
    if (sampler.vflip === "true") vflip = true;

    return { mFilter: filter, mWrap: wrap, mVFlip: vflip };
}

EffectPass.prototype.GetSamplerVFlip = function (id)
{
    let inp = this.mInputs[id];
    return inp.mInfo.mSampler.vflip;
}

EffectPass.prototype.GetTranslatedShaderSource = function ()
{
    return this.mTranslatedSource;
}


EffectPass.prototype.SetSamplerVFlip = function (id, str)
{
    var me = this;
    var renderer = this.mRenderer;
    let inp = this.mInputs[id];

    let filter = false;
    if (str === "true") filter = true;

    if (inp === null)
    {
    }
    else if (inp.mInfo.mType === "texture")
    {
        if (inp.loaded)
        {
            renderer.SetSamplerVFlip(inp.globject, filter, inp.image);
            inp.mInfo.mSampler.vflip = str;
        }
    }
    else if (inp.mInfo.mType === "volume")
    {
    }
    else if (inp.mInfo.mType === "video")
    {
        if (inp.loaded)
        {
            renderer.SetSamplerVFlip(inp.globject, filter, inp.image);
            inp.mInfo.mSampler.vflip = str;
        }
    }
    else if (inp.mInfo.mType === "cubemap")
    {
        if (inp.loaded)
        {
            renderer.SetSamplerVFlip(inp.globject, filter, inp.image);
            inp.mInfo.mSampler.vflip = str;
        }
    }
    else if (inp.mInfo.mType === "webcam")
    {
        if (inp.loaded)
        {
            renderer.SetSamplerVFlip(inp.globject, filter, null);
            inp.mInfo.mSampler.vflip = str;
        }
    }
}

EffectPass.prototype.GetAcceptsVFlip = function (id)
{
    let inp = this.mInputs[id];

    if (inp === null) return false;
    if (inp.mInfo.mType === "texture") return true;
    if (inp.mInfo.mType === "volume") return false;
    if (inp.mInfo.mType === "video")  return true;
    if (inp.mInfo.mType === "cubemap") return true;
    if (inp.mInfo.mType === "webcam")  return true;
    if (inp.mInfo.mType === "music")  return false;
    if (inp.mInfo.mType === "musicstream") return false;
    if (inp.mInfo.mType === "mic")  return false;
    if (inp.mInfo.mType === "keyboard")  return false;
    if (inp.mInfo.mType === "buffer") return false;
    return true;
}

EffectPass.prototype.GetSamplerFilter = function (id)
{
    let inp = this.mInputs[id];
    if( inp===null) return;
    return inp.mInfo.mSampler.filter;
}

EffectPass.prototype.SetSamplerFilter = function (id, str, buffers, cubeBuffers)
{
    var me = this;
    var renderer = this.mRenderer;
    let inp = this.mInputs[id];

    let filter = renderer.FILTER.NONE;
    if (str === "linear") filter = renderer.FILTER.LINEAR;
    if (str === "mipmap") filter = renderer.FILTER.MIPMAP;

    if (inp === null)
    {
    }
    else if (inp.mInfo.mType === "texture")
    {
        if (inp.loaded)
        {
            renderer.SetSamplerFilter(inp.globject, filter, true);
            inp.mInfo.mSampler.filter = str;
        }
    }
    else if (inp.mInfo.mType === "volume")
    {
        if (inp.loaded)
        {
            renderer.SetSamplerFilter(inp.globject, filter, true);
            inp.mInfo.mSampler.filter = str;
        }
    }
    else if (inp.mInfo.mType === "video")
    {
        if (inp.loaded)
        {
            renderer.SetSamplerFilter(inp.globject, filter, true);
            inp.mInfo.mSampler.filter = str;
        }
    }
    else if (inp.mInfo.mType === "cubemap")
    {
        if (inp.loaded)
        {
            if( assetID_to_cubemapBuferID(inp.mInfo.mID)===0)
            {
                renderer.SetSamplerFilter(cubeBuffers[0].mTexture[0], filter, true);
                renderer.SetSamplerFilter(cubeBuffers[0].mTexture[1], filter, true);
                inp.mInfo.mSampler.filter = str;
            }
            else
            {
                renderer.SetSamplerFilter(inp.globject, filter, true);
                inp.mInfo.mSampler.filter = str;
            }
        }
    }
    else if (inp.mInfo.mType === "webcam")
    {
        if (inp.loaded)
        {
            renderer.SetSamplerFilter(inp.globject, filter, true);
            inp.mInfo.mSampler.filter = str;
        }
    }
    else if (inp.mInfo.mType === "buffer")
    {
        renderer.SetSamplerFilter(buffers[inp.id].mTexture[0], filter, true);
        renderer.SetSamplerFilter(buffers[inp.id].mTexture[1], filter, true);
        inp.mInfo.mSampler.filter = str;
    }
    else if (inp.mInfo.mType === "keyboard")
    {
        inp.mInfo.mSampler.filter = str;
    }
}



EffectPass.prototype.GetAcceptsMipmapping = function (id)
{
    let inp = this.mInputs[id];

    if (inp === null) return false;
    if (inp.mInfo.mType === "texture") return true;
    if (inp.mInfo.mType === "volume") return true;
    if (inp.mInfo.mType === "video")  return this.mIs20;
    if (inp.mInfo.mType === "cubemap") return true;
    if (inp.mInfo.mType === "webcam")  return this.mIs20;
    if (inp.mInfo.mType === "music")  return false;
    if (inp.mInfo.mType === "musicstream") return false;
    if (inp.mInfo.mType === "mic")  return false;
    if (inp.mInfo.mType === "keyboard")  return false;
    if (inp.mInfo.mType === "buffer") return this.mIs20;
    return false;
}

EffectPass.prototype.GetAcceptsLinear = function (id)
{
    let inp = this.mInputs[id];

    if (inp === null) return false;
    if (inp.mInfo.mType === "texture") return true;
    if (inp.mInfo.mType === "volume") return true;
    if (inp.mInfo.mType === "video")  return true;
    if (inp.mInfo.mType === "cubemap") return true;
    if (inp.mInfo.mType === "webcam")  return true;
    if (inp.mInfo.mType === "music")  return true;
    if (inp.mInfo.mType === "musicstream") return true;
    if (inp.mInfo.mType === "mic")  return true;
    if (inp.mInfo.mType === "keyboard")  return false;
    if (inp.mInfo.mType === "buffer") return true;
    return false;
}


EffectPass.prototype.GetAcceptsWrapRepeat = function (id)
{
    let inp = this.mInputs[id];

    if (inp === null) return false;
    if (inp.mInfo.mType === "texture") return true;
    if (inp.mInfo.mType === "volume") return true;
    if (inp.mInfo.mType === "video")  return this.mIs20;
    if (inp.mInfo.mType === "cubemap") return false;
    if (inp.mInfo.mType === "webcam")  return this.mIs20;
    if (inp.mInfo.mType === "music")  return false;
    if (inp.mInfo.mType === "musicstream") return false;
    if (inp.mInfo.mType === "mic")  return false;
    if (inp.mInfo.mType === "keyboard")  return false;
    if (inp.mInfo.mType === "buffer") return this.mIs20;
    return false;
}

EffectPass.prototype.GetSamplerWrap = function (id)
{
    let inp = this.mInputs[id];
    return inp.mInfo.mSampler.wrap;
}
EffectPass.prototype.SetSamplerWrap = function (id, str, buffers)
{
    var me = this;
    var renderer = this.mRenderer;
    let inp = this.mInputs[id];

    let restr = renderer.TEXWRP.REPEAT;
    if (str === "clamp") restr = renderer.TEXWRP.CLAMP;

    if (inp === null)
    {
    }
    else if (inp.mInfo.mType === "texture")
    {
        if (inp.loaded)
        {
            renderer.SetSamplerWrap(inp.globject, restr);
            inp.mInfo.mSampler.wrap = str;
        }
    }
    else if (inp.mInfo.mType === "volume")
    {
        if (inp.loaded)
        {
            renderer.SetSamplerWrap(inp.globject, restr);
            inp.mInfo.mSampler.wrap = str;
        }
    }
    else if (inp.mInfo.mType === "video")
    {
        if (inp.loaded)
        {
            renderer.SetSamplerWrap(inp.globject, restr);
            inp.mInfo.mSampler.wrap = str;
        }
    }
    else if (inp.mInfo.mType === "cubemap")
    {
        if (inp.loaded)
        {
            renderer.SetSamplerWrap(inp.globject, restr);
            inp.mInfo.mSampler.wrap = str;
        }
    }
    else if (inp.mInfo.mType === "webcam")
    {
        if (inp.loaded)
        {
            renderer.SetSamplerWrap(inp.globject, restr);
            inp.mInfo.mSampler.wrap = str;
        }
    }
    else if (inp.mInfo.mType === "buffer")
    {
        renderer.SetSamplerWrap(buffers[inp.id].mTexture[0], restr);
        renderer.SetSamplerWrap(buffers[inp.id].mTexture[1], restr);
        inp.mInfo.mSampler.wrap = str;
    }
}


EffectPass.prototype.GetTexture = function( slot )
{
    let inp = this.mInputs[slot];
    if( inp===null ) return null;
    return inp.mInfo;

}

EffectPass.prototype.SetOutputs = function( slot, id )
{
    this.mOutputs[slot] = id;
}

EffectPass.prototype.SetOutputsByBufferID = function( slot, id )
{
    if( this.mType==="buffer" )
    {
        this.mOutputs[slot] = bufferID_to_assetID( id );

        this.mEffect.ResizeBuffer( id, this.mEffect.mXres, this.mEffect.mYres, false );
    }
    else if( this.mType==="cubemap" )
    {
        this.mOutputs[slot] = cubamepBufferID_to_assetID( id );
        this.mEffect.ResizeCubemapBuffer(id, 1024, 1024 );
    }
}

EffectPass.prototype.NewTexture = function( wa, slot, url, buffers, cubeBuffers, keyboard )
{
    var me = this;
    var renderer = this.mRenderer;

    if( renderer===null ) return;

    let texture = null;

    if( url===null || url.mType===null )
    {
        if( me.mTextureCallbackFun!==null )
            me.mTextureCallbackFun( this.mTextureCallbackObj, slot, null, true, 0, 0, -1.0, me.mID );
        me.DestroyInput( slot );
        me.mInputs[slot] = null;
        me.MakeHeader();
        return { mFailed:false, mNeedsShaderCompile:false };
    }
    else if( url.mType==="texture" )
    {
        texture = {};
        texture.mInfo = url;
        texture.globject = null;
        texture.loaded = false;
        texture.image = new Image();
        texture.image.crossOrigin = '';
        texture.image.onload = function()
        {
            let rti = me.Sampler2Renderer(url.mSampler);

            // O.M.G. FIX THIS
            let channels = renderer.TEXFMT.C4I8;
            if (url.mID === "Xdf3zn" || url.mID === "4sf3Rn" || url.mID === "4dXGzn" || url.mID === "4sf3Rr")
                channels = renderer.TEXFMT.C1I8;

            texture.globject = renderer.CreateTextureFromImage(renderer.TEXTYPE.T2D, texture.image, channels, rti.mFilter, rti.mWrap, rti.mVFlip);

            texture.loaded = true;
            if( me.mTextureCallbackFun!==null )
                me.mTextureCallbackFun( me.mTextureCallbackObj, slot, texture.image, true, 1, 1, -1.0, me.mID );
        }
        texture.image.src = url.mSrc;


        let returnValue = { mFailed:false, mNeedsShaderCompile: (this.mInputs[slot]===null ) || (
                                                                (this.mInputs[slot].mInfo.mType!=="texture") &&
                                                                (this.mInputs[slot].mInfo.mType!=="webcam") &&
                                                                (this.mInputs[slot].mInfo.mType!=="mic") &&
                                                                (this.mInputs[slot].mInfo.mType!=="music") &&
                                                                (this.mInputs[slot].mInfo.mType!=="musicstream") &&
                                                                (this.mInputs[slot].mInfo.mType!=="keyboard") &&
                                                                (this.mInputs[slot].mInfo.mType!=="video")) };
        this.DestroyInput( slot );
        this.mInputs[slot] = texture;
        this.MakeHeader();
        return returnValue;
    }
    else if( url.mType==="volume" )
    {
        texture = {};
        texture.mInfo = url;
        texture.globject = null;
        texture.loaded = false;
        texture.mImage = { mData:null, mXres:1, mYres:0, mZres:0 };
        texture.mPreview = new Image();
        texture.mPreview.crossOrigin = '';

	    var xmlHttp = new XMLHttpRequest();
        if( xmlHttp===null ) return { mFailed:true };

        xmlHttp.open('GET', url.mSrc, true);
        xmlHttp.responseType = "arraybuffer";
        xmlHttp.onerror = function()
        {
            console.log( "Error 1 loading Volume" );
        }
        xmlHttp.onload = function()
        {
            let data = xmlHttp.response;
            if (!data ) { console.log( "Error 2 loading Volume" ); return; }

            let file = piFile(data);

            let signature = file.ReadUInt32();
            texture.mImage.mXres = file.ReadUInt32();
            texture.mImage.mYres = file.ReadUInt32();
            texture.mImage.mZres = file.ReadUInt32();
            let binNumChannels = file.ReadUInt8();
            let binLayout = file.ReadUInt8();
            let binFormat = file.ReadUInt16();
            let format = renderer.TEXFMT.C1I8;
                 if( binNumChannels===1 && binFormat===0 )  format = renderer.TEXFMT.C1I8;
            else if( binNumChannels===2 && binFormat===0 )  format = renderer.TEXFMT.C2I8;
            else if( binNumChannels===3 && binFormat===0 )  format = renderer.TEXFMT.C3I8;
            else if( binNumChannels===4 && binFormat===0 )  format = renderer.TEXFMT.C4I8;
            else if( binNumChannels===1 && binFormat===10 ) format = renderer.TEXFMT.C1F32;
            else if( binNumChannels===2 && binFormat===10 ) format = renderer.TEXFMT.C2F32;
            else if( binNumChannels===3 && binFormat===10 ) format = renderer.TEXFMT.C3F32;
            else if( binNumChannels===4 && binFormat===10 ) format = renderer.TEXFMT.C4F32;
            else return;

            let buffer = new Uint8Array(data, 20); // skip 16 bytes (header of .bin)

            let rti = me.Sampler2Renderer(url.mSampler);

            texture.globject = renderer.CreateTexture(renderer.TEXTYPE.T3D, texture.mImage.mXres, texture.mImage.mYres, format, rti.mFilter, rti.mWrap, buffer);

            if( texture.globject===null )
            {
                console.log( "Error 4: loading Volume" );
                return { mFailed:true };
            }

            if (me.mTextureCallbackFun !== null)
            {
                me.mTextureCallbackFun( me.mTextureCallbackObj, slot, texture.mPreview, true, 1, 1, -1.0, me.mID );
            }

            texture.loaded = true;

            // load icon for it
            texture.mPreview.onload = function()
            {
                if( me.mTextureCallbackFun!==null )
                    me.mTextureCallbackFun( me.mTextureCallbackObj, slot, texture.mPreview, true, 1, 1, -1.0, me.mID );
            }
            texture.mPreview.src = url.mPreviewSrc;
        }
        xmlHttp.send("");


        let returnValue = { mFailed:false, mNeedsShaderCompile: (this.mInputs[slot]==null ) || (
                                                                (this.mInputs[slot].mInfo.mType!="volume")) };
        this.DestroyInput( slot );
        this.mInputs[slot] = texture;
        this.MakeHeader();
        return returnValue;
    }
    else if( url.mType==="cubemap" )
    {
        texture = {};
        texture.mInfo = url;
        texture.globject = null;
        texture.loaded = false;

        let rti = me.Sampler2Renderer(url.mSampler);

        if( assetID_to_cubemapBuferID(url.mID)!==-1 )
        {
            texture.mImage = new Image();
            texture.mImage.onload = function()
            {
                texture.loaded = true;
                if( me.mTextureCallbackFun!==null )
                    me.mTextureCallbackFun( me.mTextureCallbackObj, slot, texture.mImage, true, 2, 1, -1.0, me.mID );
            }
            texture.mImage.src = "/media/previz/cubemap00.png";

            this.mEffect.ResizeCubemapBuffer(0, 1024, 1024 );

        }
        else
        {
            texture.image = [ new Image(), new Image(), new Image(), new Image(), new Image(), new Image() ];

            let numLoaded = 0;
            for (var i=0; i<6; i++ )
            {
                texture.image[i].mId = i;
                texture.image[i].crossOrigin = '';
                texture.image[i].onload = function()
                {
                    var id = this.mId;
                    numLoaded++;
                    if( numLoaded===6 )
                    {
                        texture.globject = renderer.CreateTextureFromImage(renderer.TEXTYPE.CUBEMAP, texture.image, renderer.TEXFMT.C4I8, rti.mFilter, rti.mWrap, rti.mVFlip);
                        texture.loaded = true;
                        if (me.mTextureCallbackFun !== null)
                            me.mTextureCallbackFun(me.mTextureCallbackObj, slot, texture.image[0], true, 2, 1, -1.0, me.mID);
                    }
                }

                if( i === 0)
                {
                    texture.image[i].src = url.mSrc;
                }
                else
                {
                    let n = url.mSrc.lastIndexOf(".");
                    texture.image[i].src = url.mSrc.substring(0, n) + "_" + i + url.mSrc.substring(n, url.mSrc.length);
                }
            }
        }

        let returnValue = { mFailed:false, mNeedsShaderCompile: (this.mInputs[slot]==null ) || (
                                                                (this.mInputs[slot].mInfo.mType!="cubemap")) };

        this.DestroyInput( slot );
        this.mInputs[slot] = texture;
        this.MakeHeader();
        return returnValue;
    }
    else if( url.mType==="buffer" )
    {
        texture = {};
        texture.mInfo = url;

        texture.image = new Image();
        texture.image.onload = function()
        {
            if( me.mTextureCallbackFun!=null )
                me.mTextureCallbackFun( me.mTextureCallbackObj, slot, {texture: texture.image, data:null}, true, 9, 1, -1.0, me.mID );
        }
        texture.image.src = url.mSrc;
        texture.id = assetID_to_bufferID( url.mID );
        texture.loaded = true;

        let returnValue = { mFailed:false, mNeedsShaderCompile: (this.mInputs[slot]===null ) || (
                                                                (this.mInputs[slot].mInfo.mType!="texture") &&
                                                                (this.mInputs[slot].mInfo.mType!="webcam") &&
                                                                (this.mInputs[slot].mInfo.mType!="mic") &&
                                                                (this.mInputs[slot].mInfo.mType!="music") &&
                                                                (this.mInputs[slot].mInfo.mType!="musicstream") &&
                                                                (this.mInputs[slot].mInfo.mType!="keyboard") &&
                                                                (this.mInputs[slot].mInfo.mType!="video")) };

        this.DestroyInput( slot );
        this.mInputs[slot] = texture;

        this.mEffect.ResizeBuffer(texture.id, this.mEffect.mXres, this.mEffect.mYres, false );

        this.SetSamplerFilter(slot, url.mSampler.filter, buffers, cubeBuffers, true);
        this.SetSamplerVFlip(slot, url.mSampler.vflip);
        this.SetSamplerWrap(slot, url.mSampler.wrap, buffers);

        this.MakeHeader();
        return returnValue;
    }
    else
    {
        alert( "input type error" );
        return { mFailed: true };
    }

}

EffectPass.prototype.Paint_Image = function( vrData, wa, d, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard )
{
    let times = [ 0.0, 0.0, 0.0, 0.0 ];

    let dates = [ d.getFullYear(), // the year (four digits)
                  d.getMonth(),	   // the month (from 0-11)
                  d.getDate(),     // the day of the month (from 1-31)
                  d.getHours()*60.0*60 + d.getMinutes()*60 + d.getSeconds()  + d.getMilliseconds()/1000.0 ];

    let mouse = [  mousePosX, mousePosY, mouseOriX, mouseOriY ];


    //------------------------

    let resos = [ 0.0,0.0,0.0, 0.0,0.0,0.0, 0.0,0.0,0.0, 0.0,0.0,0.0 ];
    let texIsLoaded = [0, 0, 0, 0 ];
    let texID = [ null, null, null, null];

    for (let i=0; i<this.mInputs.length; i++ )
    {
        let inp = this.mInputs[i];

        if( inp===null )
        {
        }
        else if( inp.mInfo.mType==="texture" )
        {
            if( inp.loaded===true  )
            {
                texID[i] = inp.globject;
                texIsLoaded[i] = 1;
                resos[3*i+0] = inp.image.width;
                resos[3*i+1] = inp.image.height;
                resos[3*i+2] = 1;
            }
        }
        else if( inp.mInfo.mType==="volume" )
        {
            if( inp.loaded===true  )
            {
                texID[i] = inp.globject;
                texIsLoaded[i] = 1;
                resos[3*i+0] = inp.mImage.mXres;
                resos[3*i+1] = inp.mImage.mYres;
                resos[3*i+2] = inp.mImage.mZres;
            }
        }
        else if( inp.mInfo.mType==="keyboard" )
        {
            texID[i] = keyboard.mTexture;
            texIsLoaded[i] = 1;
            resos[3*i+0] = 256;
            resos[3*i+1] = 3;
            resos[3*i+2] = 1;
        }
        else if( inp.mInfo.mType==="cubemap" )
        {
            if (inp.loaded === true)
            {
                let id = assetID_to_cubemapBuferID(inp.mInfo.mID);
                if( id!==-1 )
                {
                    texID[i] = cubeBuffers[id].mTexture[ cubeBuffers[id].mLastRenderDone ];
                    resos[3*i+0] = cubeBuffers[id].mResolution[0];
                    resos[3*i+1] = cubeBuffers[id].mResolution[1];
                    resos[3*i+2] = 1;
                    texIsLoaded[i] = 1;

                    // hack. in webgl2.0 we have samplers, so we don't need this crap here
                    let filter = this.mRenderer.FILTER.NONE;
                         if (inp.mInfo.mSampler.filter === "linear") filter = this.mRenderer.FILTER.LINEAR;
                    else if (inp.mInfo.mSampler.filter === "mipmap") filter = this.mRenderer.FILTER.MIPMAP;
                    this.mRenderer.SetSamplerFilter( texID[i], filter, false);
                }
                else
                {
                    texID[i] = inp.globject;
                    texIsLoaded[i] = 1;
                }
            }
        }
        else if( inp.mInfo.mType==="webcam" )
        {
            if( inp.loaded===true )
            {
                if( inp.mImage !== null )
                {
                    if( this.mTextureCallbackFun!==null )
                        this.mTextureCallbackFun( this.mTextureCallbackObj, i, inp.mImage, false, 7, 1, -1, this.mID );

                    texID[i] = inp.globject;
                    texIsLoaded[i] = 1;
                    resos[3*i+0] = inp.mImage.width;
                    resos[3*i+1] = inp.mImage.height;
                    resos[3*i+2] = 1;
                }
                else  if( inp.video.readyState === inp.video.HAVE_ENOUGH_DATA )
                {

                    if( this.mTextureCallbackFun!==null )
                        this.mTextureCallbackFun( this.mTextureCallbackObj, i, inp.video, false, 7, 1, -1, this.mID );

                    texID[i] = inp.globject;
                    this.mRenderer.UpdateTextureFromImage(inp.globject, inp.video);
                    if( inp.mInfo.mSampler.filter === "mipmap" )
                        this.mRenderer.CreateMipmaps(inp.globject);
                    resos[3*i+0] = inp.video.videoWidth;
                    resos[3*i+1] = inp.video.videoHeight;
                    resos[3*i+2] = 1;
                    texIsLoaded[i] = 1;
                }
            }
            else
            {
                texID[i] = null;
                texIsLoaded[i] = 0;
                resos[3*i+0] = inp.video.width;
                resos[3*i+1] = inp.video.height;
                resos[3*i+2] = 1;
            }
        }
        else if( inp.mInfo.mType==="video" )
        {
            if( inp.video.mPaused === false )
            {
                if( this.mTextureCallbackFun!==null )
                    this.mTextureCallbackFun( this.mTextureCallbackObj, i, inp.video, false, 3, 1, inp.video.currentTime, this.mID );
            }

            if( inp.loaded===true )
            {
                times[i] = inp.video.currentTime;
                texID[i] = inp.globject;
                texIsLoaded[i] = 1;

      	        if( inp.video.mPaused === false )
      	        {
      	            this.mRenderer.UpdateTextureFromImage(inp.globject, inp.video);
                    if( inp.mInfo.mSampler.filter === "mipmap" )
                        this.mRenderer.CreateMipmaps(inp.globject);
                }
                resos[3*i+0] = inp.video.videoWidth;
                resos[3*i+1] = inp.video.videoHeight;
                resos[3*i+2] = 1;
            }
        }
        else if( inp.mInfo.mType==="music" || inp.mInfo.mType==="musicstream" )
        {
            if( inp.audio.mPaused === false && inp.audio.mForceMuted === false && inp.loaded===true )
            {
                if( wa !== null )
                {
                    inp.audio.mSound.mAnalyser.getByteFrequencyData(  inp.audio.mSound.mFreqData );
                    inp.audio.mSound.mAnalyser.getByteTimeDomainData( inp.audio.mSound.mWaveData );
                }

                if( this.mTextureCallbackFun!==null )
                {
                         if( inp.mInfo.mType==="music")       this.mTextureCallbackFun(this.mTextureCallbackObj, i, (wa === null) ? null : { wave : inp.audio.mSound.mFreqData }, false, 4, 1, inp.audio.currentTime, this.mID);
                    else if( inp.mInfo.mType==="musicstream") this.mTextureCallbackFun(this.mTextureCallbackObj, i, (wa === null) ? null : { wave : inp.audio.mSound.mFreqData, info : inp.audio.soundcloudInfo}, false, 8, 1, inp.audio.currentTime, this.mID);
                }
            }

            if( inp.loaded===true )
            {
                times[i] = inp.audio.currentTime;
                texID[i] = inp.globject;
                texIsLoaded[i] = 1;

                if( inp.audio.mForceMuted === true )
                {
                    times[i] = 10.0 + time;
                    let num = inp.audio.mSound.mFreqData.length;
                    for (let j=0; j<num; j++ )
                    {
                        let x = j / num;
                        let f =  (0.75 + 0.25*Math.sin( 10.0*j + 13.0*time )) * Math.exp( -3.0*x );

                        if( j<3 )
                            f =  Math.pow( 0.50 + 0.5*Math.sin( 6.2831*time ), 4.0 ) * (1.0-j/3.0);

                        inp.audio.mSound.mFreqData[j] = Math.floor(255.0*f) | 0;
                    }

                  //let num = inp.audio.mSound.mFreqData.length;
                    for (let j=0; j<num; j++ )
                    {
                        let f = 0.5 + 0.15*Math.sin( 17.0*time + 10.0*6.2831*j/num ) * Math.sin( 23.0*time + 1.9*j/num );
                        inp.audio.mSound.mWaveData[j] = Math.floor(255.0*f) | 0;
                    }

                }

      	        if( inp.audio.mPaused === false )
                {
      	            let waveLen = Math.min(inp.audio.mSound.mWaveData.length, 512);
      	            this.mRenderer.UpdateTexture(inp.globject, 0, 0, 512, 1, inp.audio.mSound.mFreqData);
      	            this.mRenderer.UpdateTexture(inp.globject, 0, 1, 512, 1, inp.audio.mSound.mWaveData);
                }

                resos[3*i+0] = 512;
                resos[3*i+1] = 2;
                resos[3*i+2] = 1;
            }
        }
        else if( inp.mInfo.mType==="mic" )
        {
            if( inp.loaded===false || inp.mForceMuted || wa === null || inp.mAnalyser == null )
            {
                    times[i] = 10.0 + time;
                    let num = inp.mFreqData.length;
                    for( let j=0; j<num; j++ )
                    {
                        let x = j / num;
                        let f =  (0.75 + 0.25*Math.sin( 10.0*j + 13.0*time )) * Math.exp( -3.0*x );

                        if( j<3 )
                            f =  Math.pow( 0.50 + 0.5*Math.sin( 6.2831*time ), 4.0 ) * (1.0-j/3.0);

                        inp.mFreqData[j] = Math.floor(255.0*f) | 0;
                    }

                    //var num = inp.mFreqData.length;
                    for( let j=0; j<num; j++ )
                    {
                        let f = 0.5 + 0.15*Math.sin( 17.0*time + 10.0*6.2831*j/num ) * Math.sin( 23.0*time + 1.9*j/num );
                        inp.mWaveData[j] = Math.floor(255.0*f) | 0;
                    }
            }
            else
            {
                inp.mAnalyser.getByteFrequencyData(  inp.mFreqData );
                inp.mAnalyser.getByteTimeDomainData( inp.mWaveData );
            }

            if( this.mTextureCallbackFun!==null )
                this.mTextureCallbackFun( this.mTextureCallbackObj, i, {wave:inp.mFreqData}, false, 5, 1, -1, this.mID );

            if( inp.loaded===true )
            {
                texID[i] = inp.globject;
                texIsLoaded[i] = 1;
                let waveLen = Math.min( inp.mWaveData.length, 512 );
                this.mRenderer.UpdateTexture(inp.globject, 0, 0, 512,     1, inp.mFreqData);
                this.mRenderer.UpdateTexture(inp.globject, 0, 1, waveLen, 1, inp.mWaveData);
                resos[3*i+0] = 512;
                resos[3*i+1] = 2;
                resos[3*i+2] = 1;
            }
        }
        else if( inp.mInfo.mType==="buffer" )
        {
            let id = inp.id;
            if( inp.loaded===true  )
            {
                texID[i] = buffers[id].mTexture[ buffers[id].mLastRenderDone ];
                texIsLoaded[i] = 1;
                resos[3*i+0] = xres;
                resos[3*i+1] = yres;
                resos[3*i+2] = 1;
                // hack. in webgl2.0 we have samplers, so we don't need this crap here
                let filter = this.mRenderer.FILTER.NONE;
                     if (inp.mInfo.mSampler.filter === "linear") filter = this.mRenderer.FILTER.LINEAR;
                else if (inp.mInfo.mSampler.filter === "mipmap") filter = this.mRenderer.FILTER.MIPMAP;
                this.mRenderer.SetSamplerFilter( texID[i], filter, false);
            }

            if( this.mTextureCallbackFun!==null )
            {
                this.mTextureCallbackFun( this.mTextureCallbackObj, i, {texture:inp.image, data:buffers[id].mThumbnailBuffer}, false, 9, 1, -1, this.mID );
            }
        }
    }

    this.mRenderer.AttachTextures( 4, texID[0], texID[1], texID[2], texID[3] );

    //-----------------------------------

    let prog = this.mProgram;

    //if( vrData!=null && this.mSupportsVR ) prog = this.mProgramVR;



    this.mRenderer.AttachShader(prog);

    this.mRenderer.SetShaderConstant1F(  "iTime", time);
    this.mRenderer.SetShaderConstant3F(  "iResolution", xres, yres, 1.0);
    this.mRenderer.SetShaderConstant4FV( "iMouse", mouse);
    this.mRenderer.SetShaderConstant1FV( "iChannelTime", times );              // OBSOLETE
    this.mRenderer.SetShaderConstant4FV( "iDate", dates );
    this.mRenderer.SetShaderConstant3FV( "iChannelResolution", resos );        // OBSOLETE
    this.mRenderer.SetShaderConstant1F(  "iSampleRate", this.mSampleRate);
    this.mRenderer.SetShaderTextureUnit( "iChannel0", 0 );
    this.mRenderer.SetShaderTextureUnit( "iChannel1", 1 );
    this.mRenderer.SetShaderTextureUnit( "iChannel2", 2 );
    this.mRenderer.SetShaderTextureUnit( "iChannel3", 3 );
    this.mRenderer.SetShaderConstant1I(  "iFrame", this.mFrame );
    this.mRenderer.SetShaderConstant1F(  "iTimeDelta", dtime);
    this.mRenderer.SetShaderConstant1F(  "iFrameRate", fps );

    this.mRenderer.SetShaderConstant1F(  "iCh0.time", times[0] );
    this.mRenderer.SetShaderConstant1F(  "iCh1.time", times[1] );
    this.mRenderer.SetShaderConstant1F(  "iCh2.time", times[2] );
    this.mRenderer.SetShaderConstant1F(  "iCh3.time", times[3] );
    this.mRenderer.SetShaderConstant3F(  "iCh0.size", resos[0], resos[ 1], resos[ 2] );
    this.mRenderer.SetShaderConstant3F(  "iCh1.size", resos[3], resos[ 4], resos[ 5] );
    this.mRenderer.SetShaderConstant3F(  "iCh2.size", resos[6], resos[ 7], resos[ 8] );
    this.mRenderer.SetShaderConstant3F(  "iCh3.size", resos[9], resos[10], resos[11] );
    this.mRenderer.SetShaderConstant1I(  "iCh0.loaded",       texIsLoaded[0] );
    this.mRenderer.SetShaderConstant1I(  "iCh1.loaded",       texIsLoaded[1] );
    this.mRenderer.SetShaderConstant1I(  "iCh2.loaded",       texIsLoaded[2] );
    this.mRenderer.SetShaderConstant1I(  "iCh3.loaded",       texIsLoaded[3] );

    let l1 = this.mRenderer.GetAttribLocation(this.mProgram, "pos");


    if( (vrData !== null) && this.mSupportsVR )
    {
        for (let i=0; i<2; i++ )
        {
            let ei = (i===0) ? vrData.mLeftEye : vrData.mRightEye;

            let vp = [i * xres / 2, 0, xres / 2, yres];

            this.mRenderer.SetViewport(vp);

            let fov = ei.mProjection;
            let corA = [ -fov[2], -fov[1], -1.0 ];
            let corB = [  fov[3], -fov[1], -1.0 ];
            let corC = [  fov[3],  fov[0], -1.0 ];
            let corD = [ -fov[2],  fov[0], -1.0 ];
            let apex = [ 0.0, 0.0, 0.0 ];

            let ma = invertFast( ei.mCamera );
            corA = matMulpoint( ma, corA );
            corB = matMulpoint( ma, corB );
            corC = matMulpoint( ma, corC );
            corD = matMulpoint( ma, corD );
            apex = matMulpoint( ma, apex );

            let corners = [ corA[0], corA[1], corA[2],
                            corB[0], corB[1], corB[2],
                            corC[0], corC[1], corC[2],
                            corD[0], corD[1], corD[2],
                            apex[0], apex[1], apex[2]];

            this.mRenderer.SetShaderConstant3FV("unCorners", corners);
            this.mRenderer.SetShaderConstant4FV("unViewport", vp);

            this.mRenderer.DrawUnitQuad_XY(l1);
        }
    }
    else
    {
        this.mRenderer.SetViewport([0, 0, xres, yres]);
        this.mRenderer.DrawFullScreenTriangle_XY( l1 );
    }

    this.mRenderer.DettachTextures();
}

EffectPass.prototype.iRenderSound = function(d, callback )
{
    let dates = [ d.getFullYear(), // the year (four digits)
                  d.getMonth(),	   // the month (from 0-11)
                  d.getDate(),     // the day of the month (from 1-31)
                  d.getHours()*60.0*60 + d.getMinutes()*60 + d.getSeconds() ];

    let resos = [ 0.0,0.0,0.0, 0.0,0.0,0.0, 0.0,0.0,0.0, 0.0,0.0,0.0 ];

    this.mRenderer.SetRenderTarget(this.mRenderFBO);

    this.mRenderer.SetViewport([0, 0, this.mTextureDimensions, this.mTextureDimensions]);
    this.mRenderer.AttachShader(this.mProgram);
    this.mRenderer.SetBlend( false );

    let texID = [null, null, null, null];
    for (let i = 0; i < this.mInputs.length; i++)
    {
        let inp = this.mInputs[i];

        if( inp===null )
        {
        }
        else if( inp.mInfo.mType==="texture" )
        {
            if( inp.loaded===true  )
            {
                texID[i] = inp.globject;
                resos[3*i+0] = inp.image.width;
                resos[3*i+1] = inp.image.height;
                resos[3*i+2] = 1;
            }
        }
        else if( inp.mInfo.mType==="volume" )
        {
            if( inp.loaded===true  )
            {
                texID[i] = inp.globject;
                resos[3*i+0] = inp.mImage.mXres;
                resos[3*i+1] = inp.mImage.mYres;
                resos[3*i+2] = inp.mImage.mZres;
            }
        }
    }

    this.mRenderer.AttachTextures(4, texID[0], texID[1], texID[2], texID[3]);

    let l2 = this.mRenderer.SetShaderConstantLocation(this.mProgram, "iTimeOffset");
    let l3 = this.mRenderer.SetShaderConstantLocation(this.mProgram, "iSampleOffset");
    this.mRenderer.SetShaderConstant4FV("iDate", dates);
    this.mRenderer.SetShaderConstant3FV("iChannelResolution", resos);
    this.mRenderer.SetShaderConstant1F("iSampleRate", this.mSampleRate);
    this.mRenderer.SetShaderTextureUnit("iChannel0", 0);
    this.mRenderer.SetShaderTextureUnit("iChannel1", 1);
    this.mRenderer.SetShaderTextureUnit("iChannel2", 2);
    this.mRenderer.SetShaderTextureUnit("iChannel3", 3);

    let l1 = this.mRenderer.GetAttribLocation(this.mProgram, "pos");

    //--------------------------------
    let numSamples = this.mTmpBufferSamples;
    let numBlocks = this.mPlaySamples / numSamples;
    for (let j=0; j<numBlocks; j++ )
    {
        let off = j*numSamples;

        this.mRenderer.SetShaderConstant1F_Pos(l2, off / this.mSampleRate);
        this.mRenderer.SetShaderConstant1I_Pos(l3, off );
        this.mRenderer.DrawUnitQuad_XY(l1);

        this.mRenderer.GetPixelData(this.mData, 0, this.mTextureDimensions, this.mTextureDimensions);

        callback( off, this.mData, numSamples );
    }

    this.mRenderer.DetachShader();
    this.mRenderer.DettachTextures();
    this.mRenderer.SetRenderTarget(null);
}

EffectPass.prototype.Paint_Sound = function( wa, d )
{
    let bufL = this.mBuffer.getChannelData(0); // Float32Array
    let bufR = this.mBuffer.getChannelData(1); // Float32Array

    this.iRenderSound( d, function(off, data, numSamples)
                         {
                            for( let i=0; i<numSamples; i++ )
                            {
                                bufL[off+i] = -1.0 + 2.0*(data[4*i+0]+256.0*data[4*i+1])/65535.0;
                                bufR[off+i] = -1.0 + 2.0*(data[4*i+2]+256.0*data[4*i+3])/65535.0;
                            }
                         }
                     );
}

EffectPass.prototype.SetUniforms = function(vrData, wa, d, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard )
{
    let times = [ 0.0, 0.0, 0.0, 0.0 ];

    let dates = [ d.getFullYear(), // the year (four digits)
                  d.getMonth(),	   // the month (from 0-11)
                  d.getDate(),     // the day of the month (from 1-31)
                  d.getHours()*60.0*60 + d.getMinutes()*60 + d.getSeconds()  + d.getMilliseconds()/1000.0 ];

    let mouse = [  mousePosX, mousePosY, mouseOriX, mouseOriY ];

    let resos = [ 0.0,0.0,0.0, 0.0,0.0,0.0, 0.0,0.0,0.0, 0.0,0.0,0.0 ];

    //------------------------

    let texID = [ null, null, null, null];

    for( let i=0; i<this.mInputs.length; i++ )
    {
        let inp = this.mInputs[i];

        if( inp===null )
        {
        }
        else if( inp.mInfo.mType==="texture" )
        {
            if( inp.loaded===true  )
            {
                texID[i] = inp.globject;
                resos[3*i+0] = inp.image.width;
                resos[3*i+1] = inp.image.height;
                resos[3*i+2] = 1;
            }
        }
        else if( inp.mInfo.mType==="volume" )
        {
            if( inp.loaded===true  )
            {
                texID[i] = inp.globject;
                resos[3*i+0] = inp.mImage.mXres;
                resos[3*i+1] = inp.mImage.mYres;
                resos[3*i+2] = inp.mImage.mZres;
            }
        }
        else if( inp.mInfo.mType==="keyboard" )
        {
            texID[i] = keyboard.mTexture;
        }
        else if( inp.mInfo.mType=="cubemap" )
        {
            if (inp.loaded === true)
            {
                let id = assetID_to_cubemapBuferID(inp.mInfo.mID);
                if( id!==-1 )
                {
                    texID[i] = cubeBuffers[id].mTexture[ cubeBuffers[id].mLastRenderDone ];
                    resos[3*i+0] = cubeBuffers[id].mResolution[0];
                    resos[3*i+1] = cubeBuffers[id].mResolution[1];
                    resos[3*i+2] = 1;

                    // hack. in webgl2.0 we have samplers, so we don't need this crap here
                    let filter = this.mRenderer.FILTER.NONE;
                         if (inp.mInfo.mSampler.filter === "linear") filter = this.mRenderer.FILTER.LINEAR;
                    else if (inp.mInfo.mSampler.filter === "mipmap") filter = this.mRenderer.FILTER.MIPMAP;
                    this.mRenderer.SetSamplerFilter( texID[i], filter, false);
                }
                else
                {
                    texID[i] = inp.globject;
                }
            }

        }
        else if( inp.mInfo.mType==="webcam" )
        {
            if( inp.loaded===true )
            {
                if( inp.mImage !== null )
                {
                    texID[i] = inp.globject;
                    resos[3*i+0] = inp.mImage.width;
                    resos[3*i+1] = inp.mImage.height;
                    resos[3*i+2] = 1;
                }
                else  if( inp.video.readyState === inp.video.HAVE_ENOUGH_DATA )
                {
                    texID[i] = inp.globject;
                    resos[3*i+0] = inp.video.videoWidth;
                    resos[3*i+1] = inp.video.videoHeight;
                    resos[3*i+2] = 1;
                }
            }
            else
            {
                texID[i] = null;
                resos[3*i+0] = inp.video.width;
                resos[3*i+1] = inp.video.height;
                resos[3*i+2] = 1;
            }
        }
        else if( inp.mInfo.mType==="video" )
        {
           if( inp.loaded===true )
           {
                times[i] = inp.video.currentTime;
                texID[i] = inp.globject;
                resos[3*i+0] = inp.video.videoWidth;
                resos[3*i+1] = inp.video.videoHeight;
                resos[3*i+2] = 1;
            }
        }
        else if( inp.mInfo.mType==="music" || inp.mInfo.mType==="musicstream" )
        {
            if( inp.loaded===true )
            {
                times[i] = inp.audio.currentTime;
                texID[i] = inp.globject;

                if( inp.audio.mForceMuted === true )
                {
                    times[i] = 10.0 + time;
                }

                resos[3*i+0] = 512;
                resos[3*i+1] = 2;
                resos[3*i+2] = 1;
            }
        }
        else if( inp.mInfo.mType==="mic" )
        {
            if( inp.loaded===false || inp.mForceMuted || wa === null || inp.mAnalyser == null )
            {
                times[i] = 10.0 + time;
            }

            if( inp.loaded===true )
            {
                texID[i] = inp.globject;
                resos[3*i+0] = 512;
                resos[3*i+1] = 2;
                resos[3*i+2] = 1;
            }
        }
        else if( inp.mInfo.mType==="buffer" )
        {
            if( inp.loaded===true  )
            {
                texID[i] = buffers[inp.id].mTexture[ buffers[inp.id].mLastRenderDone ];
                resos[3*i+0] = buffers[inp.id].mResolution[0];
                resos[3*i+1] = buffers[inp.id].mResolution[1];
                resos[3*i+2] = 1;
            }
        }
    }

    this.mRenderer.AttachTextures( 4, texID[0], texID[1], texID[2], texID[3] );

    //-----------------------------------

    this.mRenderer.AttachShader(this.mProgram);

    this.mRenderer.SetShaderConstant1F(  "iTime", time);
    this.mRenderer.SetShaderConstant3F(  "iResolution", xres, yres, 1.0);
    this.mRenderer.SetShaderConstant4FV( "iMouse", mouse);
    this.mRenderer.SetShaderConstant1FV( "iChannelTime", times );              // OBSOLETE
    this.mRenderer.SetShaderConstant4FV( "iDate", dates );
    this.mRenderer.SetShaderConstant3FV( "iChannelResolution", resos );        // OBSOLETE
    this.mRenderer.SetShaderConstant1F(  "iSampleRate", this.mSampleRate);
    this.mRenderer.SetShaderTextureUnit( "iChannel0", 0 );
    this.mRenderer.SetShaderTextureUnit( "iChannel1", 1 );
    this.mRenderer.SetShaderTextureUnit( "iChannel2", 2 );
    this.mRenderer.SetShaderTextureUnit( "iChannel3", 3 );
    this.mRenderer.SetShaderConstant1I(  "iFrame", this.mFrame );
    this.mRenderer.SetShaderConstant1F(  "iTimeDelta", dtime);
    this.mRenderer.SetShaderConstant1F(  "iFrameRate", fps );

    this.mRenderer.SetShaderConstant1F(  "iChannel[0].time",       times[0] );
    this.mRenderer.SetShaderConstant1F(  "iChannel[1].time",       times[1] );
    this.mRenderer.SetShaderConstant1F(  "iChannel[2].time",       times[2] );
    this.mRenderer.SetShaderConstant1F(  "iChannel[3].time",       times[3] );
    this.mRenderer.SetShaderConstant3F(  "iChannel[0].resolution", resos[0], resos[ 1], resos[ 2] );
    this.mRenderer.SetShaderConstant3F(  "iChannel[1].resolution", resos[3], resos[ 4], resos[ 5] );
    this.mRenderer.SetShaderConstant3F(  "iChannel[2].resolution", resos[6], resos[ 7], resos[ 8] );
    this.mRenderer.SetShaderConstant3F(  "iChannel[3].resolution", resos[9], resos[10], resos[11] );
}

EffectPass.prototype.ProcessInputs = function(vrData, wa, d, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard )
{
    for (let i=0; i<this.mInputs.length; i++ )
    {
        let inp = this.mInputs[i];

        if( inp===null )
        {
        }
        else if( inp.mInfo.mType==="texture" )
        {
        }
        else if( inp.mInfo.mType==="volume" )
        {
        }
        else if( inp.mInfo.mType==="keyboard" )
        {
        }
        else if( inp.mInfo.mType==="cubemap" )
        {
        }
        else if( inp.mInfo.mType==="webcam" )
        {
            if( inp.loaded===true )
            {
                if( inp.mImage !== null )
                {
                    if( this.mTextureCallbackFun!==null )
                        this.mTextureCallbackFun( this.mTextureCallbackObj, i, inp.mImage, false, 7, 1, -1, this.mID );
                }
                else if( inp.video.readyState === inp.video.HAVE_ENOUGH_DATA )
                {
                    if( this.mTextureCallbackFun!==null )
                        this.mTextureCallbackFun( this.mTextureCallbackObj, i, inp.video, false, 7, 1, -1, this.mID );

                    this.mRenderer.UpdateTextureFromImage(inp.globject, inp.video);
                    if( inp.mInfo.mSampler.filter === "mipmap" )
                        this.mRenderer.CreateMipmaps(inp.globject);
                }
            }
        }
        else if( inp.mInfo.mType==="video" )
        {
            if( inp.video.mPaused === false )
            {
                if( this.mTextureCallbackFun!==null )
                    this.mTextureCallbackFun( this.mTextureCallbackObj, i, inp.video, false, 3, 1, inp.video.currentTime, this.mID );
            }

            if( inp.loaded===true )
            {
      	        if( inp.video.mPaused === false )
      	        {
      	            this.mRenderer.UpdateTextureFromImage(inp.globject, inp.video);
                    if( inp.mInfo.mSampler.filter === "mipmap" )
                        this.mRenderer.CreateMipmaps(inp.globject);
                }
            }
        }
        else if( inp.mInfo.mType==="music" || inp.mInfo.mType==="musicstream" )
        {
            if( inp.audio.mPaused === false && inp.audio.mForceMuted === false && inp.loaded===true )
            {
                if( wa !== null )
                {
                    inp.audio.mSound.mAnalyser.getByteFrequencyData(  inp.audio.mSound.mFreqData );
                    inp.audio.mSound.mAnalyser.getByteTimeDomainData( inp.audio.mSound.mWaveData );
                }

                if( this.mTextureCallbackFun!==null )
                {
                         if( inp.mInfo.mType==="music")       this.mTextureCallbackFun(this.mTextureCallbackObj, i, (wa == null) ? null : { wave : inp.audio.mSound.mFreqData }, false, 4, 1, inp.audio.currentTime, this.mID);
                    else if( inp.mInfo.mType==="musicstream") this.mTextureCallbackFun(this.mTextureCallbackObj, i, (wa == null) ? null : { wave : inp.audio.mSound.mFreqData, info : inp.audio.soundcloudInfo}, false, 8, 1, inp.audio.currentTime, this.mID);
                }
            }

            if( inp.loaded===true )
            {
                if( inp.audio.mForceMuted === true )
                {
                    let num = inp.audio.mSound.mFreqData.length;
                    for (let j=0; j<num; j++ )
                    {
                        let x = j / num;
                        let f =  (0.75 + 0.25*Math.sin( 10.0*j + 13.0*time )) * Math.exp( -3.0*x );

                        if( j<3 )
                            f =  Math.pow( 0.50 + 0.5*Math.sin( 6.2831*time ), 4.0 ) * (1.0-j/3.0);

                        inp.audio.mSound.mFreqData[j] = Math.floor(255.0*f) | 0;
                    }

                  //let num = inp.audio.mSound.mFreqData.length;
                    for (let j=0; j<num; j++ )
                    {
                        let f = 0.5 + 0.15*Math.sin( 17.0*time + 10.0*6.2831*j/num ) * Math.sin( 23.0*time + 1.9*j/num );
                        inp.audio.mSound.mWaveData[j] = Math.floor(255.0*f) | 0;
                    }

                }

      	        if( inp.audio.mPaused === false )
                {
      	            let waveLen = Math.min(inp.audio.mSound.mWaveData.length, 512);
      	            this.mRenderer.UpdateTexture(inp.globject, 0, 0, 512, 1, inp.audio.mSound.mFreqData);
      	            this.mRenderer.UpdateTexture(inp.globject, 0, 1, 512, 1, inp.audio.mSound.mWaveData);
                }
            }
        }
        else if( inp.mInfo.mType==="mic" )
        {
            if( inp.loaded===false || inp.mForceMuted || wa === null || inp.mAnalyser == null )
            {
                    let num = inp.mFreqData.length;
                    for( let j=0; j<num; j++ )
                    {
                        let x = j / num;
                        let f =  (0.75 + 0.25*Math.sin( 10.0*j + 13.0*time )) * Math.exp( -3.0*x );

                        if( j<3 )
                            f =  Math.pow( 0.50 + 0.5*Math.sin( 6.2831*time ), 4.0 ) * (1.0-j/3.0);

                        inp.mFreqData[j] = Math.floor(255.0*f) | 0;
                    }

                    for( let j=0; j<num; j++ )
                    {
                        let f = 0.5 + 0.15*Math.sin( 17.0*time + 10.0*6.2831*j/num ) * Math.sin( 23.0*time + 1.9*j/num );
                        inp.mWaveData[j] = Math.floor(255.0*f) | 0;
                    }
            }
            else
            {
                inp.mAnalyser.getByteFrequencyData(  inp.mFreqData );
                inp.mAnalyser.getByteTimeDomainData( inp.mWaveData );
            }

            if( this.mTextureCallbackFun!==null )
                this.mTextureCallbackFun( this.mTextureCallbackObj, i, {wave:inp.mFreqData}, false, 5, 1, -1, this.mID );

            if( inp.loaded===true )
            {
                let waveLen = Math.min( inp.mWaveData.length, 512 );
                this.mRenderer.UpdateTexture(inp.globject, 0, 0, 512,     1, inp.mFreqData);
                this.mRenderer.UpdateTexture(inp.globject, 0, 1, waveLen, 1, inp.mWaveData);
            }
        }
        else if( inp.mInfo.mType==="buffer" )
        {
            if( inp.loaded===true  )
            {
                let id = inp.id;
                let texID = buffers[id].mTexture[ buffers[id].mLastRenderDone ];

                // hack. in webgl2.0 we have samplers, so we don't need this crap here
                let filter = this.mRenderer.FILTER.NONE;
                     if (inp.mInfo.mSampler.filter === "linear") filter = this.mRenderer.FILTER.LINEAR;
                else if (inp.mInfo.mSampler.filter === "mipmap") filter = this.mRenderer.FILTER.MIPMAP;
                this.mRenderer.SetSamplerFilter( texID, filter, false);
            }

            if( this.mTextureCallbackFun!==null )
            {
				let id = inp.id;
                this.mTextureCallbackFun( this.mTextureCallbackObj, i, {texture:inp.image, data:buffers[id].mThumbnailBuffer}, false, 9, 1, -1, this.mID );
            }
        }
    }
}

EffectPass.prototype.Paint_Cubemap = function( vrData, wa, d, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard, face )
{
    this.ProcessInputs(vrData, wa, d, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard, face );
    this.SetUniforms(vrData, wa, d, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard );

    let l1 = this.mRenderer.GetAttribLocation(this.mProgram, "pos");

    let vp = [0, 0, xres, yres];

    this.mRenderer.SetViewport(vp);

    let corA = [ -1.0, -1.0, -1.0 ];
    let corB = [  1.0, -1.0, -1.0 ];
    let corC = [  1.0,  1.0, -1.0 ];
    let corD = [ -1.0,  1.0, -1.0 ];
    let apex = [  0.0,  0.0,  0.0 ];

    if( face===0 )
    {
        corA = [  1.0,  1.0,  1.0 ];
        corB = [  1.0,  1.0, -1.0 ];
        corC = [  1.0, -1.0, -1.0 ];
        corD = [  1.0, -1.0,  1.0 ];
    }
    else if( face===1 ) // -X
    {
        corA = [ -1.0,  1.0, -1.0 ];
        corB = [ -1.0,  1.0,  1.0 ];
        corC = [ -1.0, -1.0,  1.0 ];
        corD = [ -1.0, -1.0, -1.0 ];
    }
    else if( face===2 ) // +Y
    {
        corA = [ -1.0,  1.0, -1.0 ];
        corB = [  1.0,  1.0, -1.0 ];
        corC = [  1.0,  1.0,  1.0 ];
        corD = [ -1.0,  1.0,  1.0 ];
    }
    else if( face===3 ) // -Y
    {
        corA = [ -1.0, -1.0,  1.0 ];
        corB = [  1.0, -1.0,  1.0 ];
        corC = [  1.0, -1.0, -1.0 ];
        corD = [ -1.0, -1.0, -1.0 ];
    }
    else if( face===4 ) // +Z
    {
        corA = [ -1.0,  1.0,  1.0 ];
        corB = [  1.0,  1.0,  1.0 ];
        corC = [  1.0, -1.0,  1.0 ];
        corD = [ -1.0, -1.0,  1.0 ];
    }
    else //if( face===5 ) // -Z
    {
        corA = [  1.0,  1.0, -1.0 ];
        corB = [ -1.0,  1.0, -1.0 ];
        corC = [ -1.0, -1.0, -1.0 ];
        corD = [  1.0, -1.0, -1.0 ];
    }

    let corners = [ corA[0], corA[1], corA[2],
                    corB[0], corB[1], corB[2],
                    corC[0], corC[1], corC[2],
                    corD[0], corD[1], corD[2],
                    apex[0], apex[1], apex[2]];

    this.mRenderer.SetShaderConstant3FV("unCorners", corners);
    this.mRenderer.SetShaderConstant4FV("unViewport", vp);

    this.mRenderer.DrawUnitQuad_XY(l1);

    this.mRenderer.DettachTextures();
}


EffectPass.prototype.Paint = function( vrData, wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, bufferID, bufferNeedsMimaps, buffers, cubeBuffers, keyboard, effect )
{
    if( this.mType==="sound" )
    {
        if (this.mSoundShaderCompiled === true)
        {
            // make sure all textures are loaded
            for (let i=0; i<this.mInputs.length; i++ )
            {
                let inp = this.mInputs[i];
                if (inp === null) continue;

                if (inp.mInfo.mType === "texture" && !inp.loaded) return;
                if (inp.mInfo.mType === "cubemap" && !inp.loaded) return;
            }

            this.Paint_Sound(wa, da);
            this.mSoundShaderCompiled = false;
        }
        if (this.mFrame === 0)
        {
            if (this.mPlaying===true)
            {
                this.mPlayNode.disconnect();
                this.mPlayNode.stop();
                this.mPlayNode = null;
            }
            this.mPlaying = true;

            this.mPlayNode = wa.createBufferSource();
            this.mPlayNode.buffer = this.mBuffer;
            this.mPlayNode.connect(this.mGainNode);
            this.mPlayNode.start(0);
        }
        this.mFrame++;
    }
    else if( this.mType==="image" )
    {
        this.mRenderer.SetRenderTarget( null );
        this.Paint_Image( vrData, wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard );
        this.mFrame++;
    }
    else if( this.mType==="common" )
    {
        //console.log("rendering common");
    }
    else if( this.mType==="buffer" )
    {
        this.mEffect.ResizeBuffer(bufferID, this.mEffect.mXres, this.mEffect.mYres, false );

        let buffer = buffers[bufferID];

        let dstID = 1 - buffer.mLastRenderDone;

        this.mRenderer.SetRenderTarget( buffer.mTarget[dstID] );
        this.Paint_Image( vrData, wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard );

        // compute mipmaps if needd
        if( bufferNeedsMimaps )
        {
            this.mRenderer.CreateMipmaps( buffer.mTexture[dstID]);
        }

        // make thumbnail
        //if( this.mTextureCallbackFun != null )
        /*
        {
            this.mRenderer.SetRenderTarget( buffer.mThumbnailRenderTarget );
            let v = [0, 0, buffer.mThumbnailRes[0], buffer.mThumbnailRes[1]];
            this.mRenderer.SetBlend(false);
            this.mRenderer.SetViewport(v);
            this.mRenderer.AttachShader(this.mProgramCopy);
            let l1 = this.mRenderer.GetAttribLocation(this.mProgramCopy, "pos");
            this.mRenderer.SetShaderConstant4FV("v", v);
            this.mRenderer.AttachTextures(1, buffer.mTexture[dstID], null, null, null);
            this.mRenderer.DrawUnitQuad_XY(l1);
            this.mRenderer.DettachTextures();
            this.mRenderer.DetachShader();
            this.mRenderer.GetPixelData( new Uint8Array(buffer.mThumbnailBuffer.data.buffer), buffer.mThumbnailRes[0], buffer.mThumbnailRes[1] );
            this.mRenderer.SetRenderTarget(null);
        }
        */
        buffers[bufferID].mLastRenderDone = 1 - buffers[bufferID].mLastRenderDone;
        this.mFrame++;
    }
    else if( this.mType==="cubemap" )
    {
        this.mEffect.ResizeCubemapBuffer(bufferID, 1024, 1024, false );

        let buffer = cubeBuffers[bufferID];

        xres = buffer.mResolution[0];
        yres = buffer.mResolution[1];
        let dstID = 1 - buffer.mLastRenderDone;
        for( let face=0; face<6; face++ )
        {
            this.mRenderer.SetRenderTargetCubeMap( buffer.mTarget[dstID], face );
            this.Paint_Cubemap( vrData, wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard, face );
        }
        this.mRenderer.SetRenderTargetCubeMap( null, 0 );

        // compute mipmaps if needd
        if( bufferNeedsMimaps )
        {
            this.mRenderer.CreateMipmaps( buffer.mTexture[dstID]);
        }
        cubeBuffers[bufferID].mLastRenderDone = 1 - cubeBuffers[bufferID].mLastRenderDone;

        this.mFrame++;
    }

}

EffectPass.prototype.StopOutput_Sound = function( wa )
{
    if( this.mPlayNode===null ) return;
    this.mPlayNode.disconnect();

};

EffectPass.prototype.ResumeOutput_Sound = function( wa )
{
    if( this.mPlayNode===null ) return;

    wa.resume()
    this.mPlayNode.connect( this.mGainNode );
};

EffectPass.prototype.StopOutput_Image = function( wa )
{
};

EffectPass.prototype.ResumeOutput_Image = function( wa )
{
};

EffectPass.prototype.StopOutput = function( wa )
{
    for (let j=0; j<this.mInputs.length; j++ )
        this.StopInput(j);

    if( this.mType==="sound" )
         this.StopOutput_Sound( wa );
    else
         this.StopOutput_Image( wa );
}

EffectPass.prototype.ResumeOutput = function( wa )
{
    for (let j=0; j<this.mInputs.length; j++ )
        this.ResumeInput(j);

    if( this.mType==="sound" )
         this.ResumeOutput_Sound( wa );
    else
         this.ResumeOutput_Image( wa );
}

EffectPass.prototype.GetCompilationTime = function()
{
    return this.mCompilationTime;
}

//============================================================================================================
function Screenshots()
{
    // private
    let mTexture = null;
    let mTarget = null;
    let mXres = 0;
    let mYres = 0;
    let mCubemapToEquirectProgram;
    let mRenderer = null;

    // public
    var me = {};

    me.Initialize = function(renderer)
    {
        mRenderer = renderer;
        let caps = mRenderer.GetCaps();
        let is20 = caps.mIsGL20;


        let vsSourceC, fsSourceC;
        if( is20 )
        {
            vsSourceC = "layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
            fsSourceC = "uniform samplerCube t; out vec4 outColor; void main() { vec2 px = gl_FragCoord.xy/vec2(4096.0,2048.0); vec2 an = 3.1415926535898 * (px*vec2(2.0, 1.0) - vec2(0.0,0.5)); vec3 rd = vec3(-cos(an.y) * sin(an.x), sin(an.y), cos(an.y) * cos(an.x)); outColor = texture(t, rd); }";
        }
        else
        {
            vsSourceC = "attribute vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
            fsSourceC = "uniform samplerCube t; void main() { vec2 px = gl_FragCoord.xy/vec2(4096.0,2048.0); vec2 an = 3.1415926535898 * (px*vec2(2.0, 1.0) - vec2(0.0,0.5)); vec3 rd = vec3(-cos(an.y) * sin(an.x), sin(an.y), cos(an.y) * cos(an.x)); gl_FragColor = texture(t, rd); }";
        }

        let compileShader = function (worked, info)
        {
            if (worked === false)
            {
                console.log("Failed to compile cubemap resample shader (" + errorType + "): " + log);
            }
            else
            {
                mCubemapToEquirectProgram = info;
            }
        }
        mRenderer.CreateShader(vsSourceC, fsSourceC, false, true, compileShader);

        return true;
    };

    me.Allocate = function( xres, yres )
    {
        if( xres>mXres || yres>mYres )
        {
            let texture = mRenderer.CreateTexture(mRenderer.TEXTYPE.T2D, xres, yres, mRenderer.TEXFMT.C4F32, mRenderer.FILTER.NONE, mRenderer.TEXWRP.CLAMP, null);
            let target = mRenderer.CreateRenderTarget( texture, null, null, null, null, false);

            if( mXres!==0 )
            {
                mRenderer.DestroyTexture(mTexture);
                mRenderer.DestroyRenderTarget(mTarget);
            }

            mTexture = texture;
            mTarget = target;
            mXres = xres;
            mYres = yres;
        }
    };

    me.GetProgram = function()
    {
        return mCubemapToEquirectProgram;
    };
    me.GetTarget = function()
    {
        return mTarget;
    };

    return me;
};

//============================================================================================================

function Effect(vr, ac, canvas, callback, obj, forceMuted, forcePaused, resizeCallback, crashCallback )
{
    let xres = canvas.width;
    let yres = canvas.height;

    let me = this;
    this.mCanvas = canvas;
    this.mCreated = false;
    this.mRenderer = null;
    this.mAudioContext = ac;
    this.mGLContext = null;
    this.mWebVR = vr;
    this.mRenderingStereo = false;
    this.mXres = xres;
    this.mYres = yres;
    this.mForceMuted = forceMuted;
    if( ac===null ) this.mForceMuted = true;
    this.mForcePaused = forcePaused;
    this.mGainNode = null;
    this.mPasses = [];
    this.mFrame = 0;
    this.mTextureCallbackFun = callback;
    this.mTextureCallbackObj = obj;
    this.mMaxBuffers = 4;
    this.mMaxCubeBuffers = 1;
    this.mMaxPasses = this.mMaxBuffers + 1 + 1 + 1 + 1; // some day decouple passes from buffers (4 buffers + common + Imagen + sound + cubemap)
    this.mBuffers = [];
    this.mCubeBuffers = [];
    this.mScreenshotSytem = null;
    this.mCompilationTime = 0;
    this.mIsLowEnd = piIsMobile();

    this.mGLContext = piCreateGlContext(canvas, false, false, true, false); // need preserve-buffe to true in order to capture screenshots
    if (this.mGLContext === null)
    {
        return;
    }

    canvas.addEventListener("webglcontextlost", function (event)
        {
            event.preventDefault();
            crashCallback();
        }, false);

    this.mRenderer = piRenderer();
    if (!this.mRenderer.Initialize(this.mGLContext))
        return;

    this.mScreenshotSytem = Screenshots();
    if (!this.mScreenshotSytem.Initialize(this.mRenderer))
        return;

    var caps = this.mRenderer.GetCaps();
    this.mIs20 = caps.mIsGL20;
    this.mShaderTextureLOD = caps.mShaderTextureLOD;
    //-------------
    if( ac!==null )
    {
        this.mGainNode = ac.createGain();
        if( !forceMuted )
        {
            this.mGainNode.connect( ac.destination);
        }
        if (this.mForceMuted )
            this.mGainNode.gain.value = 0.0;
        else
            this.mGainNode.gain.value = 1.0;
    }

    //-------------
    let vsSourceC, fsSourceC;
    if( this.mIs20 )
    {
        vsSourceC = "layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
        fsSourceC = "uniform vec4 v; uniform sampler2D t; out vec4 outColor; void main() { outColor = textureLod(t, gl_FragCoord.xy / v.zw, 0.0); }";
    }
    else
    {
        vsSourceC = "attribute vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
        fsSourceC = "uniform vec4 v; uniform sampler2D t; void main() { gl_FragColor = texture2D(t, gl_FragCoord.xy / v.zw, -100.0); }";
    }

    this.mRenderer.CreateShader(vsSourceC, fsSourceC, false, true, function(worked, info)
        {
            if (worked === false) console.log("Failed to compile shader to copy buffers : " + info.mErrorStr);
            else me.mProgramCopy = info;
        });

    let vsSourceD, fsSourceD;
    if( this.mIs20 )
    {
        vsSourceD = "layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
        fsSourceD = "uniform vec4 v; uniform sampler2D t; out vec4 outColor; void main() { vec2 uv = gl_FragCoord.xy / v.zw; outColor = texture(t, vec2(uv.x,1.0-uv.y)); }";
    }
    else
    {
        vsSourceD = "attribute vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
        fsSourceD = "uniform vec4 v; uniform sampler2D t; void main() { vec2 uv = gl_FragCoord.xy / v.zw; gl_FragColor = texture2D(t, vec2(uv.x,1.0-uv.y)); }";
    }

    this.mRenderer.CreateShader(vsSourceD, fsSourceD, false, true, function (worked, info)
        {
            if (worked === false) console.log("Failed to compile shader to downscale buffers : " + info.mErrorStr);
            else me.mProgramDownscale = info;
        });


    // set all buffers and cubemaps to null
    for( let i=0; i<this.mMaxBuffers; i++ )
    {
        this.mBuffers[i] = { mTexture: [null, null],
                             mTarget:  [null, null],
                             mResolution: [0, 0],
                             mLastRenderDone: 0,
                             mThumbnailRenderTarget: null,
                             mThumbnailTexture: null,
                             mThumbnailBuffer:  null,
                             mThumbnailRes: [0, 0] };
    }

    for( let i=0; i<this.mMaxCubeBuffers; i++ )
    {
        this.mCubeBuffers[i] = { mTexture: [null, null],
                                mTarget:  [null, null],
                                mResolution: [0, 0],
                                mLastRenderDone: 0,
                                mThumbnailRenderTarget: null,
                                mThumbnailTexture: null,
                                mThumbnailBuffer:  null,
                                mThumbnailRes: [0, 0] };
    }

    //-------

    let keyboardData = new Uint8Array( 256*3 );
    for (let j=0; j<(256*3); j++ ) { keyboardData[j] = 0; }
    let kayboardTexture = this.mRenderer.CreateTexture( this.mRenderer.TEXTYPE.T2D, 256, 3, this.mRenderer.TEXFMT.C1I8, this.mRenderer.FILTER.NONE, this.mRenderer.TEXWRP.CLAMP, null);
    this.mKeyboard = { mData: keyboardData, mTexture: kayboardTexture };

    let iResize = function( xres, yres )
    {
        me.mCanvas.width = xres;
        me.mCanvas.height = yres;
        me.mXres = xres;
        me.mYres = yres;
        me.ResizeBuffers(xres, yres);
        resizeCallback(xres, yres);
    };

    let bestAttemptFallback = function()
    {
        let devicePixelRatio = globalThis.devicePixelRatio || 1;
        let xres = Math.round(globalThis.demoCanvasRect?.width || me.mCanvas.offsetWidth || me.mCanvas.width  * devicePixelRatio) | 0;
        let yres = Math.round(globalThis.demoCanvasRect?.height || me.mCanvas.offsetHeight || me.mCanvas.height * devicePixelRatio) | 0;
        iResize(xres, yres);
    };

    bestAttemptFallback();

    // TODO: Handle resizing with worker
    globalThis.updateLandscapeSize = bestAttemptFallback;

    this.mCreated = true;
}


Effect.prototype.ResizeCubemapBuffer = function(i, xres, yres )
{
    let oldXres = this.mCubeBuffers[i].mResolution[0];
    let oldYres = this.mCubeBuffers[i].mResolution[1];

    if( this.mCubeBuffers[i].mTexture[0]===null || oldXres !== xres || oldYres !== yres )
    {
        let texture1 = this.mRenderer.CreateTexture(this.mRenderer.TEXTYPE.CUBEMAP,
            xres, yres,
            this.mRenderer.TEXFMT.C4F16,
            this.mRenderer.FILTER.LINEAR,
            this.mRenderer.TEXWRP.CLAMP,
            null);
        let target1 = this.mRenderer.CreateRenderTargetCubeMap( texture1, null, false);

        let texture2 = this.mRenderer.CreateTexture(this.mRenderer.TEXTYPE.CUBEMAP,
            xres, yres,
            this.mRenderer.TEXFMT.C4F16,
            this.mRenderer.FILTER.LINEAR,
            this.mRenderer.TEXWRP.CLAMP,
            null);

        let target2 = this.mRenderer.CreateRenderTargetCubeMap( texture2, null, false);

        // Store new buffers
        this.mCubeBuffers[i].mTexture = [texture1,texture2],
        this.mCubeBuffers[i].mTarget =  [target1, target2 ],
        this.mCubeBuffers[i].mLastRenderDone = 0;
        this.mCubeBuffers[i].mResolution[0] = xres;
        this.mCubeBuffers[i].mResolution[1] = yres;
    }
}


Effect.prototype.ResizeBuffer = function( i, xres, yres, skipIfNotExists )
{
    if( skipIfNotExists && this.mBuffers[i].mTexture[0]===null ) return;

    let oldXres = this.mBuffers[i].mResolution[0];
    let oldYres = this.mBuffers[i].mResolution[1];

    if( oldXres !== xres || oldYres !== yres )
    {
        let needCopy = (this.mBuffers[i].mTexture[0]!==null);

        let texture1 = this.mRenderer.CreateTexture(this.mRenderer.TEXTYPE.T2D,
            xres, yres,
            this.mRenderer.TEXFMT.C4F32,
            (needCopy) ? this.mBuffers[i].mTexture[0].mFilter : this.mRenderer.FILTER.NONE,
            (needCopy) ? this.mBuffers[i].mTexture[0].mWrap   : this.mRenderer.TEXWRP.CLAMP,
            null);

        let texture2 = this.mRenderer.CreateTexture(this.mRenderer.TEXTYPE.T2D,
            xres, yres,
            this.mRenderer.TEXFMT.C4F32,
            (needCopy) ? this.mBuffers[i].mTexture[1].mFilter : this.mRenderer.FILTER.NONE,
            (needCopy) ? this.mBuffers[i].mTexture[1].mWrap   : this.mRenderer.TEXWRP.CLAMP,
            null);

        let target1 = this.mRenderer.CreateRenderTarget( texture1, null, null, null, null, false);
        let target2 = this.mRenderer.CreateRenderTarget( texture2, null, null, null, null, false);

        if( needCopy )
        {
            let v = [0, 0, Math.min(xres, oldXres), Math.min(yres, oldYres)];
            this.mRenderer.SetBlend(false);
            this.mRenderer.SetViewport(v);
            this.mRenderer.AttachShader(this.mProgramCopy);
            let l1 = this.mRenderer.GetAttribLocation(this.mProgramCopy, "pos");
            let vOld = [0, 0, oldXres, oldYres];
            this.mRenderer.SetShaderConstant4FV("v", vOld);

            // Copy old buffers 1 to new buffer
            this.mRenderer.SetRenderTarget(target1);
            this.mRenderer.AttachTextures(1, this.mBuffers[i].mTexture[0], null, null, null);
            this.mRenderer.DrawUnitQuad_XY(l1);

            // Copy old buffers 2 to new buffer
            this.mRenderer.SetRenderTarget(target2);
            this.mRenderer.AttachTextures(1, this.mBuffers[i].mTexture[1], null, null, null);
            this.mRenderer.DrawUnitQuad_XY(l1);

            // Deallocate old memory
            this.mRenderer.DestroyTexture(this.mBuffers[i].mTexture[0]);
            this.mRenderer.DestroyRenderTarget(this.mBuffers[i].mTarget[0]);
            this.mRenderer.DestroyTexture(this.mBuffers[i].mTexture[1]);
            this.mRenderer.DestroyRenderTarget(this.mBuffers[i].mTarget[1]);
            //this.mRenderer.DestroyTexture(this.mBuffers[i].thumbnailTexture);
        }

        // Store new buffers
        this.mBuffers[i].mTexture = [texture1,texture2],
        this.mBuffers[i].mTarget =  [target1, target2 ],
        this.mBuffers[i].mLastRenderDone = 0;
        this.mBuffers[i].mResolution[0] = xres;
        this.mBuffers[i].mResolution[1] = yres;
    }
}

Effect.prototype.saveScreenshot = function(passid)
{
    let pass = this.mPasses[passid];

    if( pass.mType === "buffer" )
    {
        let bufferID = assetID_to_bufferID( this.mPasses[passid].mOutputs[0] );

        let texture = this.mBuffers[bufferID].mTarget[ this.mBuffers[bufferID].mLastRenderDone ];

        let numComponents = 3;
        let width = texture.mTex0.mXres;
        let height = texture.mTex0.mYres;
        let type = "Float"; // Other options Float, Half, Uint
        let bytes = new Float32Array(width * height * 4 );//numComponents);
        this.mRenderer.GetPixelDataRenderTarget( texture, bytes, width, height );
        let blob = piExportToEXR(width, height, numComponents, type, bytes);

        // Offer download automatically to the user
        piTriggerDownload("image.exr", blob);
    }
    else if( pass.mType === "cubemap" )
    {
        let xres = 4096;
        let yres = 2048;
        this.mScreenshotSytem.Allocate( xres, yres );

        let cubeBuffer = this.mCubeBuffers[0];

        let target = this.mScreenshotSytem.GetTarget();
        this.mRenderer.SetRenderTarget( target );

        let program = this.mScreenshotSytem.GetProgram();

        this.mRenderer.AttachShader(program);
        let l1 = this.mRenderer.GetAttribLocation(program, "pos");
        this.mRenderer.SetViewport( [0, 0, xres, yres] );
        this.mRenderer.AttachTextures(1, cubeBuffer.mTexture[ cubeBuffer.mLastRenderDone ], null, null, null);
        this.mRenderer.DrawUnitQuad_XY(l1);
        this.mRenderer.DettachTextures();
        this.mRenderer.SetRenderTarget( null );

        let data = new Float32Array(xres*yres*4);
        this.mRenderer.GetPixelDataRenderTarget( target, data, xres, yres );

        let blob = piExportToEXR(xres, yres, 3, "Float", data );
        piTriggerDownload("image.exr", blob);
    }
    else if( pass.mType === "sound" )
    {
        let offset = 0;
        const bits = 16;
        const numChannels = 2;
        let words = new Int16Array(60*pass.mSampleRate*numChannels );

        pass.iRenderSound( new Date(), function(off, data, numSamples)
                                         {
                                            for( let i=0; i<numSamples; i++ )
                                            {
                                                words[offset++] = (data[4*i+0]+256.0*data[4*i+1]) - 32767;
                                                words[offset++] = (data[4*i+2]+256.0*data[4*i+3]) - 32767;
                                            }
                                         }
                                     );

        let blob = piExportToWAV( 60*pass.mSampleRate, pass.mSampleRate, bits, numChannels, words);

        piTriggerDownload("sound.wav", blob);
    }
}

Effect.prototype.ResizeBuffers = function(xres, yres)
{
    for (let i=0; i<this.mMaxBuffers; i++ )
    {
        this.ResizeBuffer(i, xres, yres, true);
    }
}

Effect.prototype.IsEnabledVR = function ()
{
    if (this.mRenderingStereo) return true;
    return false;
}

Effect.prototype.EnableVR = function()
{
    if( !this.mWebVR.IsSupported() ) return;
    if( this.mRenderingStereo ) return;

    this.mRenderingStereo = true;
    this.mWebVR.Enable();
}

Effect.prototype.DisableVR = function()
{
    if( !this.mWebVR.IsSupported() ) return;
    if( !this.mRenderingStereo ) return;

    this.mRenderingStereo = false;
    this.mWebVR.Disable();
}

Effect.prototype.GetTexture = function( passid, slot )
{
    return this.mPasses[passid].GetTexture( slot );
}

Effect.prototype.NewTexture = function( passid, slot, url )
{
    return this.mPasses[passid].NewTexture( this.mAudioContext, slot, url, this.mBuffers, this.mCubeBuffers, this.mKeyboard );
}

Effect.prototype.SetOutputs = function( passid, slot, url )
{
    this.mPasses[passid].SetOutputs( slot, url );
}

Effect.prototype.SetOutputsByBufferID = function( passid, slot, id )
{
    this.mPasses[passid].SetOutputsByBufferID( slot, id );
}

Effect.prototype.GetAcceptsLinear = function (passid, slot)
{
    return this.mPasses[passid].GetAcceptsLinear(slot);
}

Effect.prototype.GetAcceptsMipmapping = function (passid, slot)
{
    return this.mPasses[passid].GetAcceptsMipmapping(slot);
}

Effect.prototype.GetAcceptsWrapRepeat = function (passid, slot)
{
    return this.mPasses[passid].GetAcceptsWrapRepeat(slot);
}

Effect.prototype.GetAcceptsVFlip = function (passid, slot)
{
    return this.mPasses[passid].GetAcceptsVFlip(slot);
}

Effect.prototype.SetSamplerFilter = function (passid, slot, str)
{
    this.mPasses[passid].SetSamplerFilter(slot, str, this.mBuffers, this.mCubeBuffers);
}

Effect.prototype.GetTranslatedShaderSource = function (passid)
{
    return this.mPasses[passid].GetTranslatedShaderSource();
}

Effect.prototype.GetSamplerFilter = function (passid, slot) {
    return this.mPasses[passid].GetSamplerFilter(slot);
}

Effect.prototype.SetSamplerWrap = function (passid, slot, str) {
    this.mPasses[passid].SetSamplerWrap(slot, str, this.mBuffers);
}

Effect.prototype.GetSamplerWrap = function (passid, slot) {
    return this.mPasses[passid].GetSamplerWrap(slot);
}

Effect.prototype.SetSamplerVFlip = function (passid, slot, str) {
    this.mPasses[passid].SetSamplerVFlip(slot, str);
}

Effect.prototype.GetSamplerVFlip = function (passid, slot) {
    return this.mPasses[passid].GetSamplerVFlip(slot);
}

Effect.prototype.GetHeaderSize = function (passid)
{
    return this.mPasses[passid].mHeaderLength +
           this.mRenderer.GetShaderHeaderLines(1);

}

Effect.prototype.ToggleVolume = function()
{
    this.mForceMuted = !this.mForceMuted;

    // outp
    if (this.mForceMuted)
        this.mGainNode.gain.value = 0.0;
    else
        this.mGainNode.gain.value = 1.0;

    // inp
    let num = this.mPasses.length;
    for( let j=0; j<num; j++ )
    {
        for( let i=0; i<this.mPasses[j].mInputs.length; i++ )
        {
            if( this.mForceMuted )
                this.mPasses[j].MuteInput( this.mAudioContext, i );
            else
                this.mPasses[j].UnMuteInput( this.mAudioContext, i );
        }
    }

    return this.mForceMuted;
}

Effect.prototype.SetKeyDown = function( passid, k )
{
    if( this.mKeyboard.mData[ k + 0*256 ] == 255 ) return;

    this.mKeyboard.mData[ k + 0*256 ] = 255;
    this.mKeyboard.mData[ k + 1*256 ] = 255;
    this.mKeyboard.mData[ k + 2*256 ] = 255 - this.mKeyboard.mData[ k + 2*256 ];
    this.mRenderer.UpdateTexture( this.mKeyboard.mTexture, 0, 0, 256, 3, this.mKeyboard.mData );

    let num = this.mPasses.length;
    for (let j=0; j<num; j++ )
    {
        for (let i=0; i<this.mPasses[j].mInputs.length; i++ )
        {
            let inp = this.mPasses[j].mInputs[i];
            if( inp!==null && inp.mInfo.mType==="keyboard" )
            {
                if( this.mTextureCallbackFun!==null )
                    this.mTextureCallbackFun( this.mTextureCallbackObj, i, {mImage:this.mKeyboard.mIcon, mData: this.mKeyboard.mData}, false, 6, 1, -1.0, this.mPasses[j].mID );
            }
        }
    }
}

Effect.prototype.SetKeyUp = function( passid, k )
{
    this.mKeyboard.mData[ k + 0*256 ] = 0;
    this.mKeyboard.mData[ k + 1*256 ] = 0;
    this.mRenderer.UpdateTexture( this.mKeyboard.mTexture, 0, 0, 256, 3, this.mKeyboard.mData );

    let num = this.mPasses.length;
    for (let j=0; j<num; j++ )
    {
        for (let i=0; i<this.mPasses[j].mInputs.length; i++ )
        {
            let inp = this.mPasses[j].mInputs[i];
            if( inp!==null && inp.mInfo.mType==="keyboard" )
            {
                if( this.mTextureCallbackFun!==null )
                    this.mTextureCallbackFun( this.mTextureCallbackObj, i, {mImage:this.mKeyboard.mIcon, mData: this.mKeyboard.mData}, false, 6, 1, -1.0, this.mPasses[j].mID );
            }
        }
    }

}

Effect.prototype.StopOutputs = function()
{
    let wa = this.mAudioContext;

    let num = this.mPasses.length;
    for (let i=0; i<num; i++ )
    {
        this.mPasses[i].StopOutput( wa );
    }
}

Effect.prototype.ResumeOutputs = function()
{
    let wa = this.mAudioContext;

    let num = this.mPasses.length;
    for (let i=0; i<num; i++ )
    {
        this.mPasses[i].ResumeOutput( wa );
    }
}

Effect.prototype.PauseInput = function( passid, id )
{
    return this.mPasses[passid].TooglePauseInput( this.mAudioContext, id );
}

Effect.prototype.ToggleMuteInput = function( passid, id )
{
    return this.mPasses[passid].ToggleMuteInput( this.mAudioContext, id );
}

Effect.prototype.RewindInput = function( passid, id )
{
    this.mPasses[passid].RewindInput( this.mAudioContext, id );
}

Effect.prototype.UpdateInputs = function( passid, forceUpdate )
{
   this.mPasses[passid].UpdateInputs( this.mAudioContext, forceUpdate, this.mKeyboard );
}

Effect.prototype.ResetTime = function()
{
    this.mFrame = 0;
    this.mAudioContext.resume()

    let num = this.mPasses.length;
    for( let i=0; i<num; i++ )
    {
        this.mPasses[i].mFrame = 0;
        for( let j=0; j<this.mPasses[i].mInputs.length; j++ )
            this.mPasses[i].RewindInput(this.mAudioContext, j)
    }
}

Effect.prototype.RequestAnimationFrame = function (id)
{
    if (this.mRenderingStereo && this.mWebVR.IsPresenting())
    {
        this.mWebVR.RequestAnimationFrame(id);
    }
    else
    {
        setTimeout(id,1000/60);
    }
}

Effect.prototype.Paint = function(time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, isPaused)
{
    let wa = this.mAudioContext;
    let da = new Date();
    let vrData = null; if (this.mRenderingStereo) vrData = this.mWebVR.GetData();
    let xres = this.mXres / 1;
    let yres = this.mYres / 1;

    if( this.mFrame===0 )
    {
        for( let i=0; i<this.mMaxBuffers; i++ )
        {
            if( this.mBuffers[i].mTexture[0]!==null )
            {
                this.mRenderer.SetRenderTarget( this.mBuffers[i].mTarget[0] );
                this.mRenderer.Clear( this.mRenderer.CLEAR.Color, [0.0,0.0,0.0,0.0], 1.0, 0   );
                this.mRenderer.SetRenderTarget( this.mBuffers[i].mTarget[1] );
                this.mRenderer.Clear( this.mRenderer.CLEAR.Color, [0.0,0.0,0.0,0.0], 1.0, 0   );

				this.mRenderer.CreateMipmaps( this.mBuffers[i].mTexture[0] );
				this.mRenderer.CreateMipmaps( this.mBuffers[i].mTexture[1] );
            }
        }
        for( let i=0; i<this.mMaxCubeBuffers; i++ )
        {
            if( this.mCubeBuffers[i].mTexture[0]!==null )
            {
                for( let face=0; face<6; face++ )
                {
                    this.mRenderer.SetRenderTargetCubeMap( this.mCubeBuffers[i].mTarget[0], face );
                    this.mRenderer.Clear( this.mRenderer.CLEAR.Color, [0.0,0.0,0.0,0.0], 1.0, 0   );
                    this.mRenderer.SetRenderTargetCubeMap( this.mCubeBuffers[i].mTarget[1], face );
                    this.mRenderer.Clear( this.mRenderer.CLEAR.Color, [0.0,0.0,0.0,0.0], 1.0, 0   );
					this.mRenderer.CreateMipmaps( this.mCubeBuffers[i].mTexture[0] );
				    this.mRenderer.CreateMipmaps( this.mCubeBuffers[i].mTexture[1] );
                }
            }
        }
    }

    let num = this.mPasses.length;

    // render sound first
    for( let i=0; i<num; i++ )
    {
        if( this.mPasses[i].mType !== "sound" ) continue;
        if( this.mPasses[i].mProgram===null ) continue;
        this.mPasses[i].Paint( vrData, wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, null, false, this.mBuffers, this.mCubeBuffers, this.mKeyboard, this );
    }

    // render buffers second
    for( let i=0; i<num; i++ )
    {
        if( this.mPasses[i].mType !== "buffer" ) continue;
        if( this.mPasses[i].mProgram===null ) continue;
        let bufferID = assetID_to_bufferID( this.mPasses[i].mOutputs[0] );

        // check if any downstream pass needs mipmaps when reading from this buffer
        let needMipMaps = false;
        for (let j=0; j<num; j++ )
        {
            for (let k=0; k<this.mPasses[j].mInputs.length; k++ )
            {
                let inp = this.mPasses[j].mInputs[k];
                if( inp!==null && inp.mInfo.mType==="buffer" && inp.id === bufferID && inp.mInfo.mSampler.filter === "mipmap")
                {
                    needMipMaps = true;
                    break;
                }
            }
        }

        this.mPasses[i].Paint( vrData, wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, bufferID, needMipMaps, this.mBuffers, this.mCubeBuffers, this.mKeyboard, this );
    }


    // render cubemap buffers second
    for( let i=0; i<num; i++ )
    {
        if( this.mPasses[i].mType !== "cubemap" ) continue;
        if( this.mPasses[i].mProgram===null ) continue;
        let bufferID = 0;//assetID_to_bufferID( this.mPasses[i].mOutputs[0] );

        // check if any downstream pass needs mipmaps when reading from this buffer
        let needMipMaps = false;

        for (let j=0; j<num; j++ )
        {
            for (let k=0; k<this.mPasses[j].mInputs.length; k++ )
            {
                let inp = this.mPasses[j].mInputs[k];
                if( inp!==null && inp.mInfo.mType==="cubemap" )
                {
                    if( assetID_to_cubemapBuferID(inp.mInfo.mID)===0 && inp.mInfo.mSampler.filter === "mipmap" )
                    {
                        needMipMaps = true;
                        break;
                    }
                }
            }
        }

        this.mPasses[i].Paint( vrData, wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, bufferID, needMipMaps, this.mBuffers, this.mCubeBuffers, this.mKeyboard, this );
    }

    // render image last
    for( let i=0; i<num; i++ )
    {
        if( this.mPasses[i].mType !== "image" ) continue;
        if( this.mPasses[i].mProgram===null ) continue;
        this.mPasses[i].Paint( vrData, wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, null, false, this.mBuffers, this.mCubeBuffers, this.mKeyboard, this );
    }

    // erase keypresses
    for (let k=0; k<256; k++ )
    {
       this.mKeyboard.mData[ k + 1*256 ] = 0;
    }
    this.mRenderer.UpdateTexture( this.mKeyboard.mTexture, 0, 0, 256, 3, this.mKeyboard.mData );

    if( this.mRenderingStereo ) this.mWebVR.Finish();

    this.mFrame++;
}

Effect.prototype.NewShader = function( passid, preventCache, onResolve )
{
    let commonSourceCodes = [];
    for (let i=0; i<this.mPasses.length; i++ )
    {
        if( this.mPasses[i].mType==="common")
        {
            commonSourceCodes.push(this.mPasses[i].mSource);
        }
    }

    this.mPasses[passid].NewShader(commonSourceCodes, preventCache, onResolve );
}

Effect.prototype.GetNumPasses = function()
{
    return this.mPasses.length;
}

Effect.prototype.GetNumOfType = function(passtype)
{
    let id = 0;
    for (let j=0; j<this.mPasses.length; j++ )
    {
        if( this.mPasses[j].mType===passtype )
        {
            id++;
        }
    }
    return id;
}

Effect.prototype.GetPassType = function( id )
{
    return this.mPasses[id].mType;
}
Effect.prototype.GetPassName = function( id )
{
    return this.mPasses[id].mName;
}
Effect.prototype.GetCode = function( id )
{
    return this.mPasses[id].mSource;
}
Effect.prototype.SetCode = function( id, source )
{
    this.mPasses[id].SetCode(source);
}
Effect.prototype.GetError = function (id)
{
    return this.mPasses[id].mError;
}
Effect.prototype.GetErrorStr = function (id)
{
    return this.mPasses[id].mErrorStr;
}
Effect.prototype.GetErrorGlobal = function()
{
    for (let i = 0; i < this.mPasses.length; i++)
    {
        if (this.mPasses[i].mError)
        {
            return true;
        }
    }
    return false;
}

Effect.prototype.Load = function (jobj )
{
    if (jobj.ver !== "0.1")
    {
        console.log("Wrong Format");
        return false;
    }

    let numPasses = jobj.renderpass.length;

    if( numPasses<1 || numPasses>this.mMaxPasses )
    {
        console.log("Corrupted Shader - " + numPasses);
        return false;
    }

    this.mPasses = [];
    for (let j = 0; j < numPasses; j++)
    {
        let rpass = jobj.renderpass[j];

        // skip sound passes if in thumbnail mode
        if( this.mForceMuted && rpass.type === "sound" ) continue;

        let wpass = new EffectPass(this.mRenderer, this.mIs20, this.mIsLowEnd, this.mShaderTextureLOD,
                                   this.mTextureCallbackFun, this.mTextureCallbackObj, this.mForceMuted, this.mForcePaused, this.mGainNode,
                                   this.mProgramDownscale, j, this);

        wpass.Create(rpass.type, this.mAudioContext);

        let numInputs = rpass.inputs.length;

        for (let i = 0; i < 4; i++)
        {
            wpass.NewTexture(this.mAudioContext, i, null, null, null);
        }
        for (let i = 0; i < numInputs; i++)
        {
            let lid  = rpass.inputs[i].channel;
            let styp = rpass.inputs[i].type;
            let sid  = rpass.inputs[i].id;
            let ssrc = rpass.inputs[i].filepath;
            let psrc = rpass.inputs[i].previewfilepath;
            let samp = rpass.inputs[i].sampler;

            wpass.NewTexture(this.mAudioContext, lid, { mType: styp, mID: sid, mSrc: ssrc, mSampler: samp, mPreviewSrc: psrc }, this.mBuffers, this.mCubeBuffers, this.mKeyboard);
        }

        for (let i = 0; i < 4; i++)
        {
            wpass.SetOutputs(i, null);
        }

        let numOutputs = rpass.outputs.length;
        for (let i = 0; i < numOutputs; i++)
        {
            let outputID = rpass.outputs[i].id;
            let outputCH = rpass.outputs[i].channel;
            wpass.SetOutputs(outputCH, outputID);
        }

        // create some hardcoded names. This should come from the DB
        let rpassName = "";
        if (rpass.type === "common" ) rpassName = "Common";
        if (rpass.type === "sound"  ) rpassName = "Sound";
        if (rpass.type === "image"  ) rpassName = "Image";
        if (rpass.type === "buffer") rpassName = "Buffer " + String.fromCharCode(65 + assetID_to_bufferID(wpass.mOutputs[0]));
        if (rpass.type === "cubemap") rpassName = "Cube A";// " + String.fromCharCode(65 + assetID_to_bufferID(this.mPasses[j].mOutputs[0]));
        wpass.SetName(rpassName);
        wpass.SetCode(rpass.code);

        this.mPasses.push(wpass);
    }
    return true;
}

Effect.prototype.CompileSome = function ( passes, preventCache, onResolve )
{
    let me = this;

    let to = (new Date()).getTime();
    let allPromisses = [];
    for (let j = 0; j < passes.length; j++)
    {
        allPromisses.push(new Promise(function (resolve, reject)
        {
            me.NewShader(passes[j], preventCache, function () { resolve(1); });
        }));
    }

    // aggregated callback when all passes have been compiled
    Promise.all(allPromisses).then(function (values)
    {
        let totalError = false;
        for (let j = 0; j < me.mPasses.length; j++)
        {
            if (me.mPasses[j].mError)
            {
                totalError = true;
                break;
            }
        }
        me.mCompilationTime = (new Date()).getTime() - to;
        onResolve(!totalError);
    }).catch(console.log);
}

Effect.prototype.Compile = function (preventCache, onResolve )
{
    let me = this;

    let to = (new Date()).getTime();
    let allPromisses = [];
    let numPasses = this.mPasses.length;
    for (let j = 0; j < numPasses; j++)
    {
        allPromisses.push(new Promise(function (resolve, reject)
        {
            me.NewShader(j, preventCache, function () { resolve(1); });
        }));
    }

    // aggregated callback when all passes have been compiled
    Promise.all(allPromisses).then(function (values)
    {
        let totalError = false;
        for (let j = 0; j < numPasses; j++)
        {
            if (me.mPasses[j].mError)
            {
                totalError = true;
                break;
            }
        }
        me.mCompilationTime = (new Date()).getTime() - to;
        onResolve(!totalError);
    }).catch(console.log);
}

Effect.prototype.GetCompilationTime = function( id )
{
    return this.mPasses[id].GetCompilationTime()/1000.0;
}
Effect.prototype.GetTotalCompilationTime = function()
{
    return this.mCompilationTime/1000.0;
}

Effect.prototype.DestroyPass = function( id )
{
   this.mPasses[id].Destroy( this.mAudioContext );
   this.mPasses.splice(id, 1);
}

Effect.prototype.AddPass = function( passType, passName, onResolve )
{
    let shaderStr = null;

    if( passType==="sound"   ) shaderStr = "vec2 mainSound( int samp, float time )\n{\n    // A 440 Hz wave that attenuates quickly overt time\n    return vec2( sin(6.2831*440.0*time)*exp(-3.0*time) );\n}";
    if( passType==="buffer"  ) shaderStr = "void mainImage( out vec4 fragColor, in vec2 fragCoord )\n{\n    fragColor = vec4(0.0,0.0,1.0,1.0);\n}";
    if( passType==="common"  ) shaderStr = "vec4 someFunction( vec4 a, float b )\n{\n    return a+b;\n}";
    if( passType==="cubemap" ) shaderStr = "void mainCubemap( out vec4 fragColor, in vec2 fragCoord, in vec3 rayOri, in vec3 rayDir )\n{\n    // Ray direction as color\n    vec3 col = 0.5 + 0.5*rayDir;\n\n    // Output to cubemap\n    fragColor = vec4(col,1.0);\n}";

    let id = this.GetNumPasses();
    this.mPasses[id] = new EffectPass( this.mRenderer, this.mIs20, this.mIsLowEnd, this.mShaderTextureLOD,
                                       this.mTextureCallbackFun, this.mTextureCallbackObj, this.mForceMuted, this.mForcePaused, this.mGainNode,
                                       this.mProgramDownscale, id, this );

    this.mPasses[id].Create( passType, this.mAudioContext );
    this.mPasses[id].SetName( passName );
    this.mPasses[id].SetCode( shaderStr );
    this.NewShader(id, false, function ()
    {
        onResolve();
    });

    return { mId : id, mShader : shaderStr };
}

// this should be removed once we have MultiPass 2.0 and passes render to arbitrary buffers
Effect.prototype.IsBufferPassUsed = function( bufferID )
{
    for (let j=0; j<this.mPasses.length; j++ )
    {
        if( this.mPasses[j].mType !== "buffer" ) continue;
        if( this.mPasses[j].mOutputs[0] === bufferID_to_assetID(bufferID) ) return true;
    }
    return false;
}

Effect.prototype.Save = function()
{
    var result = {};

    result.ver = "0.1";

    result.renderpass = [];

    let numPasses = this.mPasses.length;
    for (let j=0; j<numPasses; j++ )
    {
        result.renderpass[j] = {};

        result.renderpass[j].outputs = new Array();
        for (let i = 0; i<4; i++ )
        {
            let outputID = this.mPasses[j].mOutputs[i];
            if( outputID===null ) continue;
            result.renderpass[j].outputs.push( { channel: i, id: outputID } );
        }
        result.renderpass[j].inputs = new Array();
        for (let i = 0; i<4; i++ )
        {
            if( this.mPasses[j].mInputs[i]===null ) continue;
            result.renderpass[j].inputs.push( {channel: i,
                                               type    : this.mPasses[j].mInputs[i].mInfo.mType,
                                               id      : this.mPasses[j].mInputs[i].mInfo.mID,
                                               filepath: this.mPasses[j].mInputs[i].mInfo.mSrc,
                                               sampler : this.mPasses[j].mInputs[i].mInfo.mSampler });
        }

        result.renderpass[j].code = this.mPasses[j].mSource;
        result.renderpass[j].name = this.mPasses[j].mName
        result.renderpass[j].description = "";
        result.renderpass[j].type = this.mPasses[j].mType;
    }

    result.flags = this.calcFlags();

    return result;
}

Effect.prototype.calcFlags = function ()
{
    let flagVR = false;
    let flagWebcam = false;
    let flagSoundInput = false;
    let flagSoundOutput = false;
    let flagKeyboard = false;
    let flagMultipass = false;
    let flagMusicStream = false;

    let numPasses = this.mPasses.length;
    for (let j = 0; j < numPasses; j++)
    {
        let pass = this.mPasses[j];

        if (pass.mType === "sound") flagSoundOutput = true;
        if (pass.mType === "buffer") flagMultipass = true;

        for (let i = 0; i < 4; i++)
        {
            if (pass.mInputs[i] === null) continue;

            if (pass.mInputs[i].mInfo.mType === "webcam") flagWebcam = true;
            else if (pass.mInputs[i].mInfo.mType === "keyboard") flagKeyboard = true;
            else if (pass.mInputs[i].mInfo.mType === "mic") flagSoundInput = true;
            else if (pass.mInputs[i].mInfo.mType === "musicstream") flagMusicStream = true;
        }

        let n1 = pass.mSource.indexOf("mainVR(");
        let n2 = pass.mSource.indexOf("mainVR (");
        if (n1 > 0 || n2 > 0) flagVR = true;
    }

    return {
        mFlagVR: flagVR,
        mFlagWebcam: flagWebcam,
        mFlagSoundInput: flagSoundInput,
        mFlagSoundOutput: flagSoundOutput,
        mFlagKeyboard: flagKeyboard,
        mFlagMultipass: flagMultipass,
        mFlagMusicStream: flagMusicStream
    };
}
