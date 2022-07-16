"use strict"

//==============================================================================
//
// piLibs 2015-2017 - http://www.iquilezles.org/www/material/piLibs/piLibs.htm
//
// piCamera
//
//==============================================================================

function piCamera()
{
    var mMatrix = setIdentity();
    var mMatrixInv = setIdentity();

    var mPosition = [0.0,0.0,0.0];
    var mXRotation = 0.0;
    var mYRotation = 0.0;

    var mPositionTarget = [0.0,0.0,0.0];
    var mXRotationTarget = 0.0;
    var mYRotationTarget = 0.0;

    var me = {};

    me.SetPos = function(pos)
                {
                    mPosition = pos;
                };

    me.LocalMove = function( dis )
                    {
                        dis = matMulvec( setRotationY(-mYRotation), dis);
                        mPositionTarget = sub(mPositionTarget,dis)
                    };

    me.RotateXY = function( x, y)
                  {
                    mXRotationTarget -= x;
                    mYRotationTarget -= y;
                    mXRotationTarget = Math.min( Math.max( mXRotationTarget, -Math.PI/2), Math.PI/2 );
                  };


    me.CameraExectue = function( dt )
    {
        // smooth position
        mXRotation += (mXRotationTarget-mXRotation) * 12.0*dt;
        mYRotation += (mYRotationTarget-mYRotation) * 12.0*dt;
        mPosition = add(mPosition, mul( sub(mPositionTarget, mPosition), 12.0*dt));

        // Make Camera matrix
        mMatrix = matMul( matMul(setRotationX(mXRotation),
                                 setRotationY(mYRotation)),
                                 setTranslation(mPosition));
        mMatrixInv = invertFast(mMatrix);

    }

    me.GetMatrix = function() { return mMatrix; };
    me.GetMatrixInverse = function() { return mMatrixInv; };
    me.SetMatrix = function( mat )
                    {
                        mMatrix = mat;
                        mMatrixInv = invertFast(mMatrix);

                        mPosition = getXYZ(matMulpoint(mat, [0.0,0.0,0.0]));
                        mPositionTarget = mPosition;
                    };

    me.GetPos = function() { return getXYZ(matMulpoint(mMatrixInv, [0.0,0.0,0.0])); }
    me.GetDir = function() { return getXYZ(normalize(matMulvec(mMatrixInv, [0.0,0.0,-1.0]))); }

    return me;
}
//==============================================================================
//
// piLibs 2015-2017 - http://www.iquilezles.org/www/material/piLibs/piLibs.htm
//
// piFile
//
//==============================================================================

function piFile( binaryDataArrayBuffer )
{
    // private
    var mDataView = binaryDataArrayBuffer;
    var mOffset = 0;

    // public members
    var me = {};
    me.mDummy = 0;

    me.Seek = function( off ) { mOffset = off; };
    me.ReadUInt8  = function()  { var res = (new Uint8Array(mDataView,mOffset))[0]; mOffset+=1; return res; };
    me.ReadUInt16 = function()  { var res = (new Uint16Array(mDataView,mOffset))[0]; mOffset+=2; return res; };
    me.ReadUInt32 = function()  { var res = (new Uint32Array(mDataView,mOffset))[0]; mOffset+=4; return res; };
    me.ReadUInt64 = function()  { return me.ReadUInt32() + (me.ReadUInt32()<<32); };
    me.ReadFloat32 = function() { var res = (new Float32Array(mDataView,mOffset))[0]; mOffset+=4; return res; };
    me.ReadFloat32Array = function(n)
                          {
                              var src = new Float32Array(mDataView, mOffset);
                              var res = [];  for( var i=0; i<n; i++ ) { res[i] = src[i]; }
                              mOffset += 4*n;
                              return res;
                          };
    me.ReadFloat32ArrayNative = function(n) { var src = new Float32Array(mDataView, mOffset); mOffset += 4*n; return src; };
    return me;
}
//==============================================================================
//
// piLibs 2015-2017 - http://www.iquilezles.org/www/material/piLibs/piLibs.htm
//
// piMesh
//
//==============================================================================

function piMesh()
{
    this.mChunks = [];
    this.mPrimitiveType = 0;
    this.mVertexFormat = null;
}

piMesh.prototype.createCube = function(renderer)
{
    this.mPrimitiveType = 0;

    this.mChunks[0] = { mVerts : new Float32Array([ -1.0, -1.0, -1.0,
                                       1.0, -1.0, -1.0,
                                      -1.0,  1.0, -1.0,
                                       1.0,  1.0, -1.0,
                                      -1.0, -1.0,  1.0,
                                       1.0, -1.0,  1.0,
                                      -1.0,  1.0,  1.0,
                                       1.0,  1.0,  1.0 ]),

                        mIndices : new Uint16Array([ 0, 2, 1,   1, 2, 3,   5, 1, 3,   5, 3, 7,   4, 5, 7,   4, 7, 6,   4, 6, 2,   4, 2, 0,   6, 7, 3,   6, 3, 2,   4, 0, 1,   4, 1, 5 ]),
                        mNumVertices : 8,
                        mNumFaces : 12,
                        mTransform : setIdentity(),
                        mVBO : null,
                        mIBO : null };

    this.mVertexFormat = { mStride:12, mChannels:[ { mNumComponents:3, mType: renderer.TYPE.FLOAT32, mNormalize: false } ] };

    return true;
}

piMesh.prototype.createCubeSharp = function (renderer)
{
    this.mPrimitiveType = 0;

    this.mChunks[0] = { mVerts : new Float32Array([-1.0, 1.0,-1.0,   0.0, 1.0, 0.0,   0.0, 0.0,
                                    -1.0, 1.0, 1.0,   0.0, 1.0, 0.0,   0.0, 1.0,
                                     1.0, 1.0, 1.0,   0.0, 1.0, 0.0,   1.0, 1.0,
                                     1.0, 1.0,-1.0,   0.0, 1.0, 0.0,   1.0, 0.0,

                                    -1.0,-1.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0,
                                     1.0,-1.0, 1.0,   0.0, 0.0, 1.0,   0.0, 1.0,
                                     1.0, 1.0, 1.0,   0.0, 0.0, 1.0,   1.0, 1.0,
                                    -1.0, 1.0, 1.0,   0.0, 0.0, 1.0,   1.0, 0.0,

                                     1.0, 1.0, 1.0,   1.0, 0.0, 0.0,   0.0, 0.0,
                                     1.0,-1.0, 1.0,   1.0, 0.0, 0.0,   0.0, 1.0,
                                     1.0,-1.0,-1.0,   1.0, 0.0, 0.0,   1.0, 1.0,
                                     1.0, 1.0,-1.0,   1.0, 0.0, 0.0,   1.0, 0.0,

                                     1.0,-1.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,
                                    -1.0,-1.0,-1.0,   0.0, 0.0,-1.0,   0.0, 1.0,
                                    -1.0, 1.0,-1.0,   0.0, 0.0,-1.0,   1.0, 1.0,
                                     1.0, 1.0,-1.0,   0.0, 0.0,-1.0,   1.0, 0.0,

                                    -1.0,-1.0, 1.0,   0.0,-1.0, 0.0,   0.0, 0.0,
                                    -1.0,-1.0,-1.0,   0.0,-1.0, 0.0,   0.0, 1.0,
                                     1.0,-1.0,-1.0,   0.0,-1.0, 0.0,   1.0, 1.0,
                                     1.0,-1.0, 1.0,   0.0,-1.0, 0.0,   1.0, 0.0,

                                    -1.0, 1.0, 1.0,  -1.0, 0.0, 0.0,   0.0, 0.0,
                                    -1.0, 1.0,-1.0,  -1.0, 0.0, 0.0,   0.0, 1.0,
                                    -1.0,-1.0,-1.0,  -1.0, 0.0, 0.0,   1.0, 1.0,
                                    -1.0,-1.0, 1.0,  -1.0, 0.0, 0.0,   1.0, 0.0 ]),

                        mIndices : new Uint16Array([0,1,2, 0,2,3,   4,5,6, 4,6,7,    8,9,10,8,10,11,   12,13,14,12,14,15,   16,17,18,16,18,19,   20,21,22,20,22,23]),
                        mNumVertices : 24,
                        mNumFaces : 12,
                        mTransform : setIdentity(),
                        mVBO : null,
                        mIBO : null };


    this.mVertexFormat = { mStride:32, mChannels:[ { mNumComponents:3, mType: renderer.TYPE.FLOAT32, mNormalize: false },
                                                   { mNumComponents:3, mType: renderer.TYPE.FLOAT32, mNormalize: false },
                                                   { mNumComponents:2, mType: renderer.TYPE.FLOAT32, mNormalize: false } ] };

    return true;
}


piMesh.prototype.createUnitQuad = function (renderer)
{
    this.mPrimitiveType = 0;
    this.mVertexFormat = { mStride:8, mChannels: [ {mNumComponents:2, mType: renderer.TYPE.FLOAT32, mNormalize: false} ] };

    this.mChunks[0] = { mVerts : new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0,  1.0, 1.0,  1.0]),
                        mIndices : new Uint16Array([0, 2, 1, 1, 2, 3]),
                        mNumVertices : 4,
                        mNumFaces : 2,
                        mTransform : setIdentity(),
                        mVBO : null,
                        mIBO : null };

    return true;
}




piMesh.prototype.destroy = function()
{ }

piMesh.prototype.scale = function (x, y, z)
{
    var stride = this.mVertexFormat.mStride/4;
    for( var j=0; j<this.mChunks.length; j++ )
    {
        var nv = this.mChunks[j].mNumVertices;
        for (var i = 0; i < nv; i++)
        {
            this.mChunks[j].mVerts[stride * i + 0] *= x;
            this.mChunks[j].mVerts[stride * i + 1] *= y;
            this.mChunks[j].mVerts[stride * i + 2] *= z;
        }
    }
}

piMesh.prototype.translate = function (x, y, z)
{
    var stride = this.mVertexFormat.mStride/4;
    for( var j=0; j<this.mChunks.length; j++ )
    {
        var nv = this.mChunks[j].mNumVertices;
        for (var i = 0; i < nv; i++)
        {
            this.mChunks[j].mVerts[stride * i + 0] += x;
            this.mChunks[j].mVerts[stride * i + 1] += y;
            this.mChunks[j].mVerts[stride * i + 2] += z;
        }
    }
}

piMesh.prototype.GPULoad = function (renderer)
{
    for( var i=0; i<this.mChunks.length; i++ )
    {
        var vbo = renderer.CreateVertexArray(this.mChunks[i].mVerts, renderer.BUFTYPE.STATIC );
        if (vbo == null)
            return false;

        var ibo = renderer.CreateIndexArray(this.mChunks[i].mIndices, renderer.BUFTYPE.STATIC);
        if (ibo == null)
            return false;

        this.mChunks[i].mVBO = vbo;
        this.mChunks[i].mIBO = ibo;
    }
    return true;
}

piMesh.prototype.GPURender = function (renderer, positions )//, matPrj, matCam )
{
    var num = this.mChunks.length;
    for( var i=0; i<num; i++ )
    {
        renderer.AttachVertexArray(this.mChunks[i].mVBO, this.mVertexFormat, positions );
        renderer.AttachIndexArray(this.mChunks[i].mIBO );
        renderer.DrawPrimitive(renderer.PRIMTYPE.TRIANGLES, this.mChunks[i].mNumFaces * 3, true, 1);
        renderer.DetachIndexArray(this.mChunks[i].mIBO);
        renderer.DetachVertexArray(this.mChunks[i].mVBO, this.mVertexFormat );
    }
}
//==============================================================================
//
// piLibs 2014-2017 - http://www.iquilezles.org/www/material/piLibs/piLibs.htm
//
// piRenderer
//
//==============================================================================

function piRenderer()
{
    // private members

    var mGL = null;
    var mBindedShader = null;
    var mIs20 = false;
    var mFloat32Textures;
    var mFloat32Filter;
    var mFloat16Textures;
    var mDrawBuffers;
    var mDepthTextures;
    var mDerivatives;
    var mFloat16Filter;
    var mShaderTextureLOD;
    var mAnisotropic;
    var mRenderToFloat32F;
    var mDebugShader;
    var mAsynchCompile;

    var mVBO_Quad = null;
    var mVBO_Tri = null;
    var mVBO_CubePosNor = null;
    var mVBO_CubePos = null;
    var mShaderHeader = ["",""];
    var mShaderHeaderLines = [0,0];

    // public members
    var me = {};

    me.CLEAR      = { Color: 1, Zbuffer : 2, Stencil : 4 };
    me.TEXFMT     = { C4I8 : 0, C1I8 : 1, C1F16 : 2, C4F16 : 3, C1F32 : 4, C4F32 : 5, Z16 : 6, Z24 : 7, Z32 : 8, C3F32:9 };
    me.TEXWRP     = { CLAMP : 0, REPEAT : 1 };
    me.BUFTYPE    = { STATIC : 0, DYNAMIC : 1 };
    me.PRIMTYPE   = { POINTS : 0, LINES : 1, LINE_LOOP : 2, LINE_STRIP : 3, TRIANGLES : 4, TRIANGLE_STRIP : 5 };
    me.RENDSTGATE = { WIREFRAME : 0, FRONT_FACE : 1, CULL_FACE : 2, DEPTH_TEST : 3, ALPHA_TO_COVERAGE : 4 };
    me.TEXTYPE    = { T2D : 0, T3D : 1, CUBEMAP : 2 };
    me.FILTER     = { NONE : 0, LINEAR : 1, MIPMAP : 2, NONE_MIPMAP : 3 };
    me.TYPE       = { UINT8 : 0, UINT16 : 1, UINT32 : 2, FLOAT16: 3, FLOAT32 : 4, FLOAT64: 5 };

    // private functions

    var iFormatPI2GL = function( format )
    {
        if( mIs20 )
        {
             if (format === me.TEXFMT.C4I8)  return { mGLFormat: mGL.RGBA8,           mGLExternal: mGL.RGBA,             mGLType: mGL.UNSIGNED_BYTE }
        else if (format === me.TEXFMT.C1I8)  return { mGLFormat: mGL.R8,              mGLExternal: mGL.RED,              mGLType: mGL.UNSIGNED_BYTE }
        else if (format === me.TEXFMT.C1F16) return { mGLFormat: mGL.R16F,            mGLExternal: mGL.RED,              mGLType: mGL.FLOAT }
        else if (format === me.TEXFMT.C4F16) return { mGLFormat: mGL.RGBA16F,         mGLExternal: mGL.RGBA,             mGLType: mGL.FLOAT }
        else if (format === me.TEXFMT.C1F32) return { mGLFormat: mGL.R32F,            mGLExternal: mGL.RED,              mGLType: mGL.FLOAT }
        else if (format === me.TEXFMT.C4F32) return { mGLFormat: mGL.RGBA32F,         mGLExternal: mGL.RGBA,             mGLType: mGL.FLOAT }
        else if (format === me.TEXFMT.C3F32) return { mGLFormat: mGL.RGB32F,          mGLExternal: mGL.RGB,              mGLType: mGL.FLOAT }
        else if (format === me.TEXFMT.Z16)   return { mGLFormat: mGL.DEPTH_COMPONENT16, mGLExternal: mGL.DEPTH_COMPONENT,  mGLType: mGL.UNSIGNED_SHORT }
        else if (format === me.TEXFMT.Z24)   return { mGLFormat: mGL.DEPTH_COMPONENT24, mGLExternal: mGL.DEPTH_COMPONENT,  mGLType: mGL.UNSIGNED_SHORT }
        else if (format === me.TEXFMT.Z32)   return { mGLFormat: mGL.DEPTH_COMPONENT32F, mGLExternal: mGL.DEPTH_COMPONENT,  mGLType: mGL.UNSIGNED_SHORT }
        }
        else
        {
             if (format === me.TEXFMT.C4I8)  return { mGLFormat: mGL.RGBA,            mGLExternal: mGL.RGBA,            mGLType: mGL.UNSIGNED_BYTE }
        else if (format === me.TEXFMT.C1I8)  return { mGLFormat: mGL.LUMINANCE,       mGLExternal: mGL.LUMINANCE,       mGLType: mGL.UNSIGNED_BYTE }
        else if (format === me.TEXFMT.C1F16) return { mGLFormat: mGL.LUMINANCE,       mGLExternal: mGL.LUMINANCE,       mGLType: mGL.FLOAT }
        else if (format === me.TEXFMT.C4F16) return { mGLFormat: mGL.RGBA,            mGLExternal: mGL.RGBA,            mGLType: mGL.FLOAT }
        else if (format === me.TEXFMT.C1F32) return { mGLFormat: mGL.LUMINANCE,       mGLExternal: mGL.RED,             mGLType: mGL.FLOAT }
        else if (format === me.TEXFMT.C4F32) return { mGLFormat: mGL.RGBA,            mGLExternal: mGL.RGBA,            mGLType: mGL.FLOAT }
        else if (format === me.TEXFMT.Z16)   return { mGLFormat: mGL.DEPTH_COMPONENT, mGLExternal: mGL.DEPTH_COMPONENT, mGLType: mGL.UNSIGNED_SHORT }
        }

        return null;
     }

    // public functions

    me.Initialize = function( gl )
                    {
                        mGL = gl;

                        mIs20 = !(gl instanceof WebGLRenderingContext);

                        if( mIs20 )
                        {
                            mFloat32Textures  = true;
                            mFloat32Filter    = mGL.getExtension( 'OES_texture_float_linear');
                            mFloat16Textures  = true;
                            mFloat16Filter    = mGL.getExtension( 'OES_texture_half_float_linear' );
                            mDerivatives      = true;
                            mDrawBuffers      = true;
                            mDepthTextures    = true;
                            mShaderTextureLOD = true;
                            mAnisotropic = mGL.getExtension( 'EXT_texture_filter_anisotropic' );
                            mRenderToFloat32F = mGL.getExtension( 'EXT_color_buffer_float');
                            mDebugShader = mGL.getExtension('WEBGL_debug_shaders');
                            mAsynchCompile = mGL.getExtension('KHR_parallel_shader_compile');

							mGL.hint( mGL.FRAGMENT_SHADER_DERIVATIVE_HINT, mGL.NICEST);
                        }
                        else
                        {
                            mFloat32Textures  = mGL.getExtension( 'OES_texture_float' );
                            mFloat32Filter    = mGL.getExtension( 'OES_texture_float_linear');
                            mFloat16Textures  = mGL.getExtension( 'OES_texture_half_float' );
                            mFloat16Filter    = mGL.getExtension( 'OES_texture_half_float_linear' );
                            mDerivatives      = mGL.getExtension( 'OES_standard_derivatives' );
                            mDrawBuffers      = mGL.getExtension( 'WEBGL_draw_buffers' );
                            mDepthTextures    = mGL.getExtension( 'WEBGL_depth_texture' );
                            mShaderTextureLOD = mGL.getExtension( 'EXT_shader_texture_lod' );
                            mAnisotropic      = mGL.getExtension( 'EXT_texture_filter_anisotropic' );
                            mRenderToFloat32F = mFloat32Textures;
                            mDebugShader      = null;
                            mAsynchCompile    = null;

							if( mDerivatives !== null) mGL.hint( mDerivatives.FRAGMENT_SHADER_DERIVATIVE_HINT_OES, mGL.NICEST);
                        }


                        var maxTexSize = mGL.getParameter( mGL.MAX_TEXTURE_SIZE );
                        var maxCubeSize = mGL.getParameter( mGL.MAX_CUBE_MAP_TEXTURE_SIZE );
                        var maxRenderbufferSize = mGL.getParameter( mGL.MAX_RENDERBUFFER_SIZE );
                        var extensions = mGL.getSupportedExtensions();
                        var textureUnits = mGL.getParameter( mGL.MAX_TEXTURE_IMAGE_UNITS );
                        console.log("WebGL (2.0=" + mIs20 + "):" +
                                    " Asynch Compile: "  + ((mAsynchCompile !==null) ? "yes" : "no") +
                                    ", Textures: F32 ["   + ((mFloat32Textures !==null) ? "yes" : "no") +
                                    "], F16 ["   + ((mFloat16Textures !==null) ? "yes" : "no") +
                                    "], Depth [" + ((mDepthTextures   !==null) ? "yes" : "no") +
                                    "], LOD ["    + ((mShaderTextureLOD!==null) ? "yes" : "no") +
                                    "], Aniso ["   + ((mAnisotropic     !==null) ? "yes" : "no") +
                                    "], Units [" + textureUnits +
                                    "], Max Size [" + maxTexSize +
                                    "], Cube Max Size [" + maxCubeSize +
                                    "], Targets: MRT ["            + ((mDrawBuffers     !==null) ? "yes" : "no") +
                                    "], F32 ["     + ((mRenderToFloat32F!==null) ? "yes" : "no") +
                                    "], Max Size [" + maxRenderbufferSize + "]");

                        // create a 2D quad Vertex Buffer
                        var vertices = new Float32Array( [ -1.0, -1.0,   1.0, -1.0,    -1.0,  1.0,     1.0, -1.0,    1.0,  1.0,    -1.0,  1.0] );
                        mVBO_Quad = mGL.createBuffer();
                        mGL.bindBuffer( mGL.ARRAY_BUFFER, mVBO_Quad );
                        mGL.bufferData( mGL.ARRAY_BUFFER, vertices, mGL.STATIC_DRAW );
                        mGL.bindBuffer( mGL.ARRAY_BUFFER, null );

                        // create a 2D triangle Vertex Buffer
                        mVBO_Tri = mGL.createBuffer();
                        mGL.bindBuffer( mGL.ARRAY_BUFFER, mVBO_Tri );
                        mGL.bufferData( mGL.ARRAY_BUFFER, new Float32Array( [ -1.0, -1.0,   3.0, -1.0,    -1.0,  3.0] ), mGL.STATIC_DRAW );
                        mGL.bindBuffer( mGL.ARRAY_BUFFER, null );

                        // create a 3D cube Vertex Buffer
                        mVBO_CubePosNor = mGL.createBuffer();
                        mGL.bindBuffer( mGL.ARRAY_BUFFER, mVBO_CubePosNor );
                        mGL.bufferData( mGL.ARRAY_BUFFER, new Float32Array( [ -1.0, -1.0, -1.0,  -1.0,  0.0,  0.0,
                                                                              -1.0, -1.0,  1.0,  -1.0,  0.0,  0.0,
                                                                              -1.0,  1.0, -1.0,  -1.0,  0.0,  0.0,
                                                                              -1.0,  1.0,  1.0,  -1.0,  0.0,  0.0,
                                                                               1.0,  1.0, -1.0,   1.0,  0.0,  0.0,
                                                                               1.0,  1.0,  1.0,   1.0,  0.0,  0.0,
                                                                               1.0, -1.0, -1.0,   1.0,  0.0,  0.0,
                                                                               1.0, -1.0,  1.0,   1.0,  0.0,  0.0,
                                                                               1.0,  1.0,  1.0,   0.0,  1.0,  0.0,
                                                                               1.0,  1.0, -1.0,   0.0,  1.0,  0.0,
                                                                              -1.0,  1.0,  1.0,   0.0,  1.0,  0.0,
                                                                              -1.0,  1.0, -1.0,   0.0,  1.0,  0.0,
                                                                               1.0, -1.0, -1.0,   0.0, -1.0,  0.0,
                                                                               1.0, -1.0,  1.0,   0.0, -1.0,  0.0,
                                                                              -1.0, -1.0, -1.0,   0.0, -1.0,  0.0,
                                                                              -1.0, -1.0,  1.0,   0.0, -1.0,  0.0,
                                                                              -1.0,  1.0,  1.0,   0.0,  0.0,  1.0,
                                                                              -1.0, -1.0,  1.0,   0.0,  0.0,  1.0,
                                                                               1.0,  1.0,  1.0,   0.0,  0.0,  1.0,
                                                                               1.0, -1.0,  1.0,   0.0,  0.0,  1.0,
                                                                              -1.0, -1.0, -1.0,   0.0,  0.0, -1.0,
                                                                              -1.0,  1.0, -1.0,   0.0,  0.0, -1.0,
                                                                               1.0, -1.0, -1.0,   0.0,  0.0, -1.0,
                                                                               1.0,  1.0, -1.0,   0.0,  0.0, -1.0 ] ), mGL.STATIC_DRAW );
                        mGL.bindBuffer( mGL.ARRAY_BUFFER, null );

                        // create a 3D cube Vertex Buffer
                        mVBO_CubePos = mGL.createBuffer();
                        mGL.bindBuffer( mGL.ARRAY_BUFFER, mVBO_CubePos );
                        mGL.bufferData( mGL.ARRAY_BUFFER, new Float32Array( [ -1.0, -1.0, -1.0,
                                                                              -1.0, -1.0,  1.0,
                                                                              -1.0,  1.0, -1.0,
                                                                              -1.0,  1.0,  1.0,
                                                                               1.0,  1.0, -1.0,
                                                                               1.0,  1.0,  1.0,
                                                                               1.0, -1.0, -1.0,
                                                                               1.0, -1.0,  1.0,
                                                                               1.0,  1.0,  1.0,
                                                                               1.0,  1.0, -1.0,
                                                                              -1.0,  1.0,  1.0,
                                                                              -1.0,  1.0, -1.0,
                                                                               1.0, -1.0, -1.0,
                                                                               1.0, -1.0,  1.0,
                                                                              -1.0, -1.0, -1.0,
                                                                              -1.0, -1.0,  1.0,
                                                                              -1.0,  1.0,  1.0,
                                                                              -1.0, -1.0,  1.0,
                                                                               1.0,  1.0,  1.0,
                                                                               1.0, -1.0,  1.0,
                                                                              -1.0, -1.0, -1.0,
                                                                              -1.0,  1.0, -1.0,
                                                                               1.0, -1.0, -1.0,
                                                                               1.0,  1.0, -1.0 ] ), mGL.STATIC_DRAW );
                        mGL.bindBuffer( mGL.ARRAY_BUFFER, null );

                        //-------------------------------------------------------------------

                        mShaderHeader[0] = "";
                        mShaderHeaderLines[0] = 0;
                        if( mIs20 )
                        {
                            mShaderHeader[0] += "#version 300 es\n" +
                                                "#ifdef GL_ES\n"+
                                                "precision highp float;\n" +
                                                "precision highp int;\n"+
                                                "precision mediump sampler3D;\n"+
                                                "#endif\n";
                            mShaderHeaderLines[0] += 6;
                        }
                        else
                        {
                            mShaderHeader[0] += "#ifdef GL_ES\n"+
                                                "precision highp float;\n" +
                                                "precision highp int;\n"+
                                                "#endif\n"+
                                                "float round( float x ) { return floor(x+0.5); }\n"+
                                                "vec2 round(vec2 x) { return floor(x + 0.5); }\n"+
                                                "vec3 round(vec3 x) { return floor(x + 0.5); }\n"+
                                                "vec4 round(vec4 x) { return floor(x + 0.5); }\n"+
                                                "float trunc( float x, float n ) { return floor(x*n)/n; }\n"+
                                                "mat3 transpose(mat3 m) { return mat3(m[0].x, m[1].x, m[2].x, m[0].y, m[1].y, m[2].y, m[0].z, m[1].z, m[2].z); }\n"+
                                                "float determinant( in mat2 m ) { return m[0][0]*m[1][1] - m[0][1]*m[1][0]; }\n"+
                                                "float determinant( mat4 m ) { float b00 = m[0][0] * m[1][1] - m[0][1] * m[1][0], b01 = m[0][0] * m[1][2] - m[0][2] * m[1][0], b02 = m[0][0] * m[1][3] - m[0][3] * m[1][0], b03 = m[0][1] * m[1][2] - m[0][2] * m[1][1], b04 = m[0][1] * m[1][3] - m[0][3] * m[1][1], b05 = m[0][2] * m[1][3] - m[0][3] * m[1][2], b06 = m[2][0] * m[3][1] - m[2][1] * m[3][0], b07 = m[2][0] * m[3][2] - m[2][2] * m[3][0], b08 = m[2][0] * m[3][3] - m[2][3] * m[3][0], b09 = m[2][1] * m[3][2] - m[2][2] * m[3][1], b10 = m[2][1] * m[3][3] - m[2][3] * m[3][1], b11 = m[2][2] * m[3][3] - m[2][3] * m[3][2];  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;}\n"+
                                                "mat2 inverse(mat2 m) { float det = determinant(m); return mat2(m[1][1], -m[0][1], -m[1][0], m[0][0]) / det; }\n"+
                                                "mat4 inverse(mat4 m ) { float inv0 = m[1].y*m[2].z*m[3].w - m[1].y*m[2].w*m[3].z - m[2].y*m[1].z*m[3].w + m[2].y*m[1].w*m[3].z + m[3].y*m[1].z*m[2].w - m[3].y*m[1].w*m[2].z; float inv4 = -m[1].x*m[2].z*m[3].w + m[1].x*m[2].w*m[3].z + m[2].x*m[1].z*m[3].w - m[2].x*m[1].w*m[3].z - m[3].x*m[1].z*m[2].w + m[3].x*m[1].w*m[2].z; float inv8 = m[1].x*m[2].y*m[3].w - m[1].x*m[2].w*m[3].y - m[2].x  * m[1].y * m[3].w + m[2].x  * m[1].w * m[3].y + m[3].x * m[1].y * m[2].w - m[3].x * m[1].w * m[2].y; float inv12 = -m[1].x  * m[2].y * m[3].z + m[1].x  * m[2].z * m[3].y +m[2].x  * m[1].y * m[3].z - m[2].x  * m[1].z * m[3].y - m[3].x * m[1].y * m[2].z + m[3].x * m[1].z * m[2].y; float inv1 = -m[0].y*m[2].z * m[3].w + m[0].y*m[2].w * m[3].z + m[2].y  * m[0].z * m[3].w - m[2].y  * m[0].w * m[3].z - m[3].y * m[0].z * m[2].w + m[3].y * m[0].w * m[2].z; float inv5 = m[0].x  * m[2].z * m[3].w - m[0].x  * m[2].w * m[3].z - m[2].x  * m[0].z * m[3].w + m[2].x  * m[0].w * m[3].z + m[3].x * m[0].z * m[2].w - m[3].x * m[0].w * m[2].z; float inv9 = -m[0].x  * m[2].y * m[3].w +  m[0].x  * m[2].w * m[3].y + m[2].x  * m[0].y * m[3].w - m[2].x  * m[0].w * m[3].y - m[3].x * m[0].y * m[2].w + m[3].x * m[0].w * m[2].y; float inv13 = m[0].x  * m[2].y * m[3].z - m[0].x  * m[2].z * m[3].y - m[2].x  * m[0].y * m[3].z + m[2].x  * m[0].z * m[3].y + m[3].x * m[0].y * m[2].z - m[3].x * m[0].z * m[2].y; float inv2 = m[0].y  * m[1].z * m[3].w - m[0].y  * m[1].w * m[3].z - m[1].y  * m[0].z * m[3].w + m[1].y  * m[0].w * m[3].z + m[3].y * m[0].z * m[1].w - m[3].y * m[0].w * m[1].z; float inv6 = -m[0].x  * m[1].z * m[3].w + m[0].x  * m[1].w * m[3].z + m[1].x  * m[0].z * m[3].w - m[1].x  * m[0].w * m[3].z - m[3].x * m[0].z * m[1].w + m[3].x * m[0].w * m[1].z; float inv10 = m[0].x  * m[1].y * m[3].w - m[0].x  * m[1].w * m[3].y - m[1].x  * m[0].y * m[3].w + m[1].x  * m[0].w * m[3].y + m[3].x * m[0].y * m[1].w - m[3].x * m[0].w * m[1].y; float inv14 = -m[0].x  * m[1].y * m[3].z + m[0].x  * m[1].z * m[3].y + m[1].x  * m[0].y * m[3].z - m[1].x  * m[0].z * m[3].y - m[3].x * m[0].y * m[1].z + m[3].x * m[0].z * m[1].y; float inv3 = -m[0].y * m[1].z * m[2].w + m[0].y * m[1].w * m[2].z + m[1].y * m[0].z * m[2].w - m[1].y * m[0].w * m[2].z - m[2].y * m[0].z * m[1].w + m[2].y * m[0].w * m[1].z; float inv7 = m[0].x * m[1].z * m[2].w - m[0].x * m[1].w * m[2].z - m[1].x * m[0].z * m[2].w + m[1].x * m[0].w * m[2].z + m[2].x * m[0].z * m[1].w - m[2].x * m[0].w * m[1].z; float inv11 = -m[0].x * m[1].y * m[2].w + m[0].x * m[1].w * m[2].y + m[1].x * m[0].y * m[2].w - m[1].x * m[0].w * m[2].y - m[2].x * m[0].y * m[1].w + m[2].x * m[0].w * m[1].y; float inv15 = m[0].x * m[1].y * m[2].z - m[0].x * m[1].z * m[2].y - m[1].x * m[0].y * m[2].z + m[1].x * m[0].z * m[2].y + m[2].x * m[0].y * m[1].z - m[2].x * m[0].z * m[1].y; float det = m[0].x * inv0 + m[0].y * inv4 + m[0].z * inv8 + m[0].w * inv12; det = 1.0 / det; return det*mat4( inv0, inv1, inv2, inv3,inv4, inv5, inv6, inv7,inv8, inv9, inv10, inv11,inv12, inv13, inv14, inv15);}\n"+
                                                "float sinh(float x)  { return (exp(x)-exp(-x))/2.; }\n"+
                                                "float cosh(float x)  { return (exp(x)+exp(-x))/2.; }\n"+
                                                "float tanh(float x)  { return sinh(x)/cosh(x); }\n"+
                                                "float coth(float x)  { return cosh(x)/sinh(x); }\n"+
                                                "float sech(float x)  { return 1./cosh(x); }\n"+
                                                "float csch(float x)  { return 1./sinh(x); }\n"+
                                                "float asinh(float x) { return    log(x+sqrt(x*x+1.)); }\n"+
                                                "float acosh(float x) { return    log(x+sqrt(x*x-1.)); }\n"+
                                                "float atanh(float x) { return .5*log((1.+x)/(1.-x)); }\n"+
                                                "float acoth(float x) { return .5*log((x+1.)/(x-1.)); }\n"+
                                                "float asech(float x) { return    log((1.+sqrt(1.-x*x))/x); }\n"+
                                                "float acsch(float x) { return    log((1.+sqrt(1.+x*x))/x); }\n";
                            mShaderHeaderLines[0] += 26;
                        }

                        //-------------------------------------------------------

                        mShaderHeader[1] = "";
                        mShaderHeaderLines[1] = 0;
                        if( mIs20 )
                        {
                            mShaderHeader[1] += "#version 300 es\n"+
                                                "#ifdef GL_ES\n"+
                                                "precision highp float;\n"+
                                                "precision highp int;\n"+
                                                "precision mediump sampler3D;\n"+
                                                "#endif\n";
                            mShaderHeaderLines[1] += 6;
                        }
                        else
                        {
                            if( mDerivatives ) { mShaderHeader[1] += "#ifdef GL_OES_standard_derivatives\n#extension GL_OES_standard_derivatives : enable\n#endif\n"; mShaderHeaderLines[1]+=3; }
                            if( mShaderTextureLOD  ) { mShaderHeader[1] += "#extension GL_EXT_shader_texture_lod : enable\n"; mShaderHeaderLines[1]++; }
                            mShaderHeader[1] += "#ifdef GL_ES\n"+
                                                "precision highp float;\n"+
                                                "precision highp int;\n"+
                                                "#endif\n"+
                                                "vec4 texture(     sampler2D   s, vec2 c)                   { return texture2D(s,c); }\n"+
                                                "vec4 texture(     sampler2D   s, vec2 c, float b)          { return texture2D(s,c,b); }\n"+
                                                "vec4 texture(     samplerCube s, vec3 c )                  { return textureCube(s,c); }\n"+
                                                "vec4 texture(     samplerCube s, vec3 c, float b)          { return textureCube(s,c,b); }\n"+
                                                "float round( float x ) { return floor(x+0.5); }\n"+
                                                "vec2 round(vec2 x) { return floor(x + 0.5); }\n"+
                                                "vec3 round(vec3 x) { return floor(x + 0.5); }\n"+
                                                "vec4 round(vec4 x) { return floor(x + 0.5); }\n"+
                                                "float trunc( float x, float n ) { return floor(x*n)/n; }\n"+
                                                "mat3 transpose(mat3 m) { return mat3(m[0].x, m[1].x, m[2].x, m[0].y, m[1].y, m[2].y, m[0].z, m[1].z, m[2].z); }\n"+
                                                "float determinant( in mat2 m ) { return m[0][0]*m[1][1] - m[0][1]*m[1][0]; }\n"+
                                                "float determinant( mat4 m ) { float b00 = m[0][0] * m[1][1] - m[0][1] * m[1][0], b01 = m[0][0] * m[1][2] - m[0][2] * m[1][0], b02 = m[0][0] * m[1][3] - m[0][3] * m[1][0], b03 = m[0][1] * m[1][2] - m[0][2] * m[1][1], b04 = m[0][1] * m[1][3] - m[0][3] * m[1][1], b05 = m[0][2] * m[1][3] - m[0][3] * m[1][2], b06 = m[2][0] * m[3][1] - m[2][1] * m[3][0], b07 = m[2][0] * m[3][2] - m[2][2] * m[3][0], b08 = m[2][0] * m[3][3] - m[2][3] * m[3][0], b09 = m[2][1] * m[3][2] - m[2][2] * m[3][1], b10 = m[2][1] * m[3][3] - m[2][3] * m[3][1], b11 = m[2][2] * m[3][3] - m[2][3] * m[3][2];  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;}\n"+
                                                "mat2 inverse(mat2 m) { float det = determinant(m); return mat2(m[1][1], -m[0][1], -m[1][0], m[0][0]) / det; }\n"+
                                                "mat4 inverse(mat4 m ) { float inv0 = m[1].y*m[2].z*m[3].w - m[1].y*m[2].w*m[3].z - m[2].y*m[1].z*m[3].w + m[2].y*m[1].w*m[3].z + m[3].y*m[1].z*m[2].w - m[3].y*m[1].w*m[2].z; float inv4 = -m[1].x*m[2].z*m[3].w + m[1].x*m[2].w*m[3].z + m[2].x*m[1].z*m[3].w - m[2].x*m[1].w*m[3].z - m[3].x*m[1].z*m[2].w + m[3].x*m[1].w*m[2].z; float inv8 = m[1].x*m[2].y*m[3].w - m[1].x*m[2].w*m[3].y - m[2].x  * m[1].y * m[3].w + m[2].x  * m[1].w * m[3].y + m[3].x * m[1].y * m[2].w - m[3].x * m[1].w * m[2].y; float inv12 = -m[1].x  * m[2].y * m[3].z + m[1].x  * m[2].z * m[3].y +m[2].x  * m[1].y * m[3].z - m[2].x  * m[1].z * m[3].y - m[3].x * m[1].y * m[2].z + m[3].x * m[1].z * m[2].y; float inv1 = -m[0].y*m[2].z * m[3].w + m[0].y*m[2].w * m[3].z + m[2].y  * m[0].z * m[3].w - m[2].y  * m[0].w * m[3].z - m[3].y * m[0].z * m[2].w + m[3].y * m[0].w * m[2].z; float inv5 = m[0].x  * m[2].z * m[3].w - m[0].x  * m[2].w * m[3].z - m[2].x  * m[0].z * m[3].w + m[2].x  * m[0].w * m[3].z + m[3].x * m[0].z * m[2].w - m[3].x * m[0].w * m[2].z; float inv9 = -m[0].x  * m[2].y * m[3].w +  m[0].x  * m[2].w * m[3].y + m[2].x  * m[0].y * m[3].w - m[2].x  * m[0].w * m[3].y - m[3].x * m[0].y * m[2].w + m[3].x * m[0].w * m[2].y; float inv13 = m[0].x  * m[2].y * m[3].z - m[0].x  * m[2].z * m[3].y - m[2].x  * m[0].y * m[3].z + m[2].x  * m[0].z * m[3].y + m[3].x * m[0].y * m[2].z - m[3].x * m[0].z * m[2].y; float inv2 = m[0].y  * m[1].z * m[3].w - m[0].y  * m[1].w * m[3].z - m[1].y  * m[0].z * m[3].w + m[1].y  * m[0].w * m[3].z + m[3].y * m[0].z * m[1].w - m[3].y * m[0].w * m[1].z; float inv6 = -m[0].x  * m[1].z * m[3].w + m[0].x  * m[1].w * m[3].z + m[1].x  * m[0].z * m[3].w - m[1].x  * m[0].w * m[3].z - m[3].x * m[0].z * m[1].w + m[3].x * m[0].w * m[1].z; float inv10 = m[0].x  * m[1].y * m[3].w - m[0].x  * m[1].w * m[3].y - m[1].x  * m[0].y * m[3].w + m[1].x  * m[0].w * m[3].y + m[3].x * m[0].y * m[1].w - m[3].x * m[0].w * m[1].y; float inv14 = -m[0].x  * m[1].y * m[3].z + m[0].x  * m[1].z * m[3].y + m[1].x  * m[0].y * m[3].z - m[1].x  * m[0].z * m[3].y - m[3].x * m[0].y * m[1].z + m[3].x * m[0].z * m[1].y; float inv3 = -m[0].y * m[1].z * m[2].w + m[0].y * m[1].w * m[2].z + m[1].y * m[0].z * m[2].w - m[1].y * m[0].w * m[2].z - m[2].y * m[0].z * m[1].w + m[2].y * m[0].w * m[1].z; float inv7 = m[0].x * m[1].z * m[2].w - m[0].x * m[1].w * m[2].z - m[1].x * m[0].z * m[2].w + m[1].x * m[0].w * m[2].z + m[2].x * m[0].z * m[1].w - m[2].x * m[0].w * m[1].z; float inv11 = -m[0].x * m[1].y * m[2].w + m[0].x * m[1].w * m[2].y + m[1].x * m[0].y * m[2].w - m[1].x * m[0].w * m[2].y - m[2].x * m[0].y * m[1].w + m[2].x * m[0].w * m[1].y; float inv15 = m[0].x * m[1].y * m[2].z - m[0].x * m[1].z * m[2].y - m[1].x * m[0].y * m[2].z + m[1].x * m[0].z * m[2].y + m[2].x * m[0].y * m[1].z - m[2].x * m[0].z * m[1].y; float det = m[0].x * inv0 + m[0].y * inv4 + m[0].z * inv8 + m[0].w * inv12; det = 1.0 / det; return det*mat4( inv0, inv1, inv2, inv3,inv4, inv5, inv6, inv7,inv8, inv9, inv10, inv11,inv12, inv13, inv14, inv15);}\n"+
                                                "float sinh(float x)  { return (exp(x)-exp(-x))/2.; }\n"+
                                                "float cosh(float x)  { return (exp(x)+exp(-x))/2.; }\n"+
                                                "float tanh(float x)  { return sinh(x)/cosh(x); }\n"+
                                                "float coth(float x)  { return cosh(x)/sinh(x); }\n"+
                                                "float sech(float x)  { return 1./cosh(x); }\n"+
                                                "float csch(float x)  { return 1./sinh(x); }\n"+
                                                "float asinh(float x) { return    log(x+sqrt(x*x+1.)); }\n"+
                                                "float acosh(float x) { return    log(x+sqrt(x*x-1.)); }\n"+
                                                "float atanh(float x) { return .5*log((1.+x)/(1.-x)); }\n"+
                                                "float acoth(float x) { return .5*log((x+1.)/(x-1.)); }\n"+
                                                "float asech(float x) { return    log((1.+sqrt(1.-x*x))/x); }\n"+
                                                "float acsch(float x) { return    log((1.+sqrt(1.+x*x))/x); }\n";
                            mShaderHeaderLines[1] += 30;
                            if( mShaderTextureLOD )
                            {
                            mShaderHeader[1] += "vec4 textureLod(  sampler2D   s, vec2 c, float b)          { return texture2DLodEXT(s,c,b); }\n";
                            mShaderHeader[1] += "vec4 textureGrad( sampler2D   s, vec2 c, vec2 dx, vec2 dy) { return texture2DGradEXT(s,c,dx,dy); }\n";
                            mShaderHeaderLines[1] += 2;

                            //mShaderHeader[1] += "vec4 texelFetch( sampler2D s, ivec2 c, int l) { return texture2DLodEXT(s,(vec2(c)+0.5)/vec2(800,450),float(l)); }\n";
                            //mShaderHeaderLines[1] += 1;
                            }
                        }

                        return true;
                    };

        me.GetCaps =    function ()
                        {
                            return { mIsGL20 : mIs20,
                                     mFloat32Textures: mFloat32Textures != null,
                                     mFloat16Textures: mFloat16Textures != null,
                                     mDrawBuffers: mDrawBuffers != null,
                                     mDepthTextures: mDepthTextures != null,
                                     mDerivatives: mDerivatives != null,
                                     mShaderTextureLOD: mShaderTextureLOD != null };
                        };

        me.GetShaderHeaderLines = function (shaderType)
                        {
                            return mShaderHeaderLines[shaderType];
                        };

        me.CheckErrors = function()
                         {
                                var error = mGL.getError();
                                if( error != mGL.NO_ERROR )
                                {
                                    for( var prop in mGL )
                                    {
                                        if( typeof mGL[prop] == 'number' )
                                        {
                                            if( mGL[prop] == error )
                                            {
                                                console.log( "GL Error " + error + ": " + prop );
                                                break;
                                            }
                                        }
                                    }
                                }
                         };

        me.Clear =  function( flags, ccolor, cdepth, cstencil )
                    {
                        var mode = 0;
                        if( flags & 1 ) { mode |= mGL.COLOR_BUFFER_BIT;   mGL.clearColor( ccolor[0], ccolor[1], ccolor[2], ccolor[3] ); }
                        if( flags & 2 ) { mode |= mGL.DEPTH_BUFFER_BIT;   mGL.clearDepth( cdepth ); }
                        if( flags & 4 ) { mode |= mGL.STENCIL_BUFFER_BIT; mGL.clearStencil( cstencil ); }
                        mGL.clear( mode );
                    };


        me.CreateTexture = function ( type, xres, yres, format, filter, wrap, buffer)
                           {
                                if( mGL===null ) return null;

                                var id = mGL.createTexture();

                                var glFoTy = iFormatPI2GL( format );
                                var glWrap = mGL.REPEAT; if (wrap === me.TEXWRP.CLAMP) glWrap = mGL.CLAMP_TO_EDGE;

                                if( type===me.TEXTYPE.T2D )
                                {
                                    mGL.bindTexture( mGL.TEXTURE_2D, id );

                                    mGL.texImage2D( mGL.TEXTURE_2D, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer );
                                    mGL.texParameteri( mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_S, glWrap );
                                    mGL.texParameteri( mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_T, glWrap );

                                    if (filter === me.FILTER.NONE)
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
                                    }
                                    else if (filter === me.FILTER.LINEAR)
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
                                    }
                                    else if (filter === me.FILTER.MIPMAP)
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
                                        mGL.generateMipmap(mGL.TEXTURE_2D);
                                    }
                                    else
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
                                        mGL.generateMipmap(mGL.TEXTURE_2D);
                                    }

                                    mGL.bindTexture( mGL.TEXTURE_2D, null );
                                }
                                else if( type===me.TEXTYPE.T3D )
                                {
                                    if( mIs20 )
                                    {
                                        mGL.bindTexture( mGL.TEXTURE_3D, id );
                                        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_BASE_LEVEL, 0);
                                        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAX_LEVEL, Math.log2(xres));
                                        if (filter === me.FILTER.NONE)
                                        {
                                            mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                                            mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
                                        }
                                        else if (filter === me.FILTER.LINEAR)
                                        {
                                            mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                                            mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
                                        }
                                        else if (filter === me.FILTER.MIPMAP)
                                        {
                                            mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                                            mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
                                        }
                                        else
                                        {
                                            mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                                            mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
                                            mGL.generateMipmap(mGL.TEXTURE_3D);
                                        }
                                        mGL.texImage3D( mGL.TEXTURE_3D, 0, glFoTy.mGLFormat, xres, yres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer );

                                        mGL.texParameteri( mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_R, glWrap );
                                        mGL.texParameteri( mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_S, glWrap );
                                        mGL.texParameteri( mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_T, glWrap );

                                        if (filter === me.FILTER.MIPMAP)
                                            mGL.generateMipmap( mGL.TEXTURE_3D );
                                        mGL.bindTexture( mGL.TEXTURE_3D, null );
                                    }
                                    else
                                    {
                                        return null;
                                    }
                                }
                                else
                                {
                                    mGL.bindTexture( mGL.TEXTURE_CUBE_MAP, id );

                                    mGL.texImage2D( mGL.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer );
                                    mGL.texImage2D( mGL.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer );
                                    mGL.texImage2D( mGL.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer );
                                    mGL.texImage2D( mGL.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer );
                                    mGL.texImage2D( mGL.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer );
                                    mGL.texImage2D( mGL.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer );

                                    if( filter === me.FILTER.NONE)
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                                        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
                                    }
                                    else if (filter === me.FILTER.LINEAR)
                                    {
                                        mGL.texParameteri( mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR );
                                        mGL.texParameteri( mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR );
                                    }
                                    else if (filter === me.FILTER.MIPMAP)
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                                        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
                                    }

                                    if (filter === me.FILTER.MIPMAP)
                                        mGL.generateMipmap( mGL.TEXTURE_CUBE_MAP );

                                    mGL.bindTexture( mGL.TEXTURE_CUBE_MAP, null );
                                }
                        return { mObjectID: id, mXres: xres, mYres: yres, mFormat: format, mType: type, mFilter: filter, mWrap: wrap, mVFlip:false };
                        };

        me.CreateTextureFromImage = function ( type, image, format, filter, wrap, flipY)
                                {
                                    if( mGL===null ) return null;

                                    var id = mGL.createTexture();

                                    var glFoTy = iFormatPI2GL( format );

                                    var glWrap = mGL.REPEAT; if (wrap === me.TEXWRP.CLAMP) glWrap = mGL.CLAMP_TO_EDGE;

                                    if( type===me.TEXTYPE.T2D )
                                    {
                                        mGL.bindTexture(mGL.TEXTURE_2D, id);

                                        mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, flipY);
                                        mGL.pixelStorei(mGL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                                        if( mIs20 ) mGL.pixelStorei(mGL.UNPACK_COLORSPACE_CONVERSION_WEBGL, mGL.NONE );

                                        mGL.texImage2D(mGL.TEXTURE_2D, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image);

                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_S, glWrap);
                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_T, glWrap);

                                        if (filter === me.FILTER.NONE)
                                        {
                                            mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                                            mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
                                        }
                                        else if (filter === me.FILTER.LINEAR)
                                        {
                                            mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                                            mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
                                        }
                                        else if( filter === me.FILTER.MIPMAP)
                                        {
                                            mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                                            mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
                                            mGL.generateMipmap(mGL.TEXTURE_2D);
                                        }
                                        else
                                        {
                                            mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                                            mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
                                            mGL.generateMipmap(mGL.TEXTURE_2D);
                                        }
                                        mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, false);
                                        mGL.bindTexture(mGL.TEXTURE_2D, null);
                                    }
                                    else if( type===me.TEXTYPE.T3D )
                                    {
                                        return null;
                                    }
                                    else
                                    {
                                        mGL.bindTexture( mGL.TEXTURE_CUBE_MAP, id );
                                        mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, flipY);
                                        mGL.activeTexture( mGL.TEXTURE0 );
                                        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[0] );
                                        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[1] );
                                        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, (flipY ? image[3] : image[2]) );
                                        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, (flipY ? image[2] : image[3]) );
                                        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[4] );
                                        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[5] );

                                        if( filter === me.FILTER.NONE)
                                        {
                                            mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                                            mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
                                        }
                                        else if (filter === me.FILTER.LINEAR)
                                        {
                                            mGL.texParameteri( mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR );
                                            mGL.texParameteri( mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR );
                                        }
                                        else if (filter === me.FILTER.MIPMAP)
                                        {
                                            mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                                            mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
                                            mGL.generateMipmap( mGL.TEXTURE_CUBE_MAP );
                                        }
                                        mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, false);
                                        mGL.bindTexture( mGL.TEXTURE_CUBE_MAP, null );
                                    }
                                    return { mObjectID: id, mXres: image.width, mYres: image.height, mFormat: format, mType: type, mFilter: filter, mWrap:wrap, mVFlip:flipY };
                                };

        me.SetSamplerFilter = function (te, filter, doGenerateMipsIfNeeded)
                            {
                                if (te.mFilter === filter) return;

                                if (te.mType === me.TEXTYPE.T2D)
                                {
                                    mGL.bindTexture(mGL.TEXTURE_2D, te.mObjectID);

                                    if (filter === me.FILTER.NONE)
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
                                    }
                                    else if (filter === me.FILTER.LINEAR)
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
                                    }
                                    else if (filter === me.FILTER.MIPMAP)
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
                                        if( doGenerateMipsIfNeeded ) mGL.generateMipmap(mGL.TEXTURE_2D);
                                    }
                                    else
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                                        mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
                                        if( doGenerateMipsIfNeeded ) mGL.generateMipmap(mGL.TEXTURE_2D);
                                    }

                                    mGL.bindTexture(mGL.TEXTURE_2D, null);

                                }
                                else if (te.mType === me.TEXTYPE.T3D)
                                {
                                    mGL.bindTexture(mGL.TEXTURE_3D, te.mObjectID);

                                    if (filter === me.FILTER.NONE)
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                                        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
                                    }
                                    else if (filter === me.FILTER.LINEAR)
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                                        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
                                    }
                                    else if (filter === me.FILTER.MIPMAP)
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                                        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
                                        if( doGenerateMipsIfNeeded ) mGL.generateMipmap(mGL.TEXTURE_3D);
                                    }
                                    else
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                                        mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
                                        if( doGenerateMipsIfNeeded ) mGL.generateMipmap(mGL.TEXTURE_3D);
                                    }

                                    mGL.bindTexture(mGL.TEXTURE_3D, null);

                                }
                                else
                                {
                                    mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, te.mObjectID);

                                    if (filter === me.FILTER.NONE)
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                                        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
                                    }
                                    else if (filter === me.FILTER.LINEAR)
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                                        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
                                    }
                                    else if (filter === me.FILTER.MIPMAP)
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                                        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
                                        if( doGenerateMipsIfNeeded ) mGL.generateMipmap(mGL.TEXTURE_CUBE_MAP);
                                    }
                                    else
                                    {
                                        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                                        mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
                                        if( doGenerateMipsIfNeeded ) mGL.generateMipmap(mGL.TEXTURE_CUBE_MAP);
                                    }

                                    mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);
                                }


                                te.mFilter = filter;
                            };

        me.SetSamplerWrap = function (te, wrap)
                            {
                                if (te.mWrap === wrap) return;

                                var glWrap = mGL.REPEAT; if (wrap === me.TEXWRP.CLAMP) glWrap = mGL.CLAMP_TO_EDGE;

                                var id = te.mObjectID;

                                if (te.mType === me.TEXTYPE.T2D)
                                {
                                    mGL.bindTexture(mGL.TEXTURE_2D, id);
                                    mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_S, glWrap);
                                    mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_T, glWrap);
                                    mGL.bindTexture(mGL.TEXTURE_2D, null);

                                }
                                else if (te.mType === me.TEXTYPE.T3D)
                                {
                                    mGL.bindTexture(mGL.TEXTURE_3D, id);
                                    mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_R, glWrap);
                                    mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_S, glWrap);
                                    mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_T, glWrap);
                                    mGL.bindTexture(mGL.TEXTURE_3D, null);
                                }

                                te.mWrap = wrap;
                            };

        me.SetSamplerVFlip = function (te, vflip, image)
                            {
                                if (te.mVFlip === vflip) return;

                                var id = te.mObjectID;

                                if (te.mType === me.TEXTYPE.T2D)
                                {
                                    if( image != null)
                                    {
                                        mGL.activeTexture( mGL.TEXTURE0 );
                                        mGL.bindTexture(mGL.TEXTURE_2D, id);
                                        mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, vflip);
                                        var glFoTy = iFormatPI2GL( te.mFormat );
                                        mGL.texImage2D(mGL.TEXTURE_2D, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image);
                                        mGL.bindTexture(mGL.TEXTURE_2D, null);
                                        mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, false);
                                    }
                                }
                                else if (te.mType === me.TEXTYPE.CUBEMAP)
                                {
                                    if( image != null)
                                    {
                                        var glFoTy = iFormatPI2GL( te.mFormat );
                                        mGL.activeTexture( mGL.TEXTURE0 );
                                        mGL.bindTexture( mGL.TEXTURE_CUBE_MAP, id );
                                        mGL.pixelStorei( mGL.UNPACK_FLIP_Y_WEBGL, vflip);
                                        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[0] );
                                        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[1] );
                                        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, (vflip ? image[3] : image[2]) );
                                        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, (vflip ? image[2] : image[3]) );
                                        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[4] );
                                        mGL.texImage2D(  mGL.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[5] );
                                        mGL.bindTexture( mGL.TEXTURE_CUBE_MAP, null );
                                        mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, false);
                                    }

                                }

                                te.mVFlip = vflip;
                            };

        me.CreateMipmaps =  function (te)
                            {
                                if( te.mType===me.TEXTYPE.T2D )
                                {
                                    mGL.activeTexture(mGL.TEXTURE0);
                                    mGL.bindTexture(mGL.TEXTURE_2D, te.mObjectID);
                                    mGL.generateMipmap(mGL.TEXTURE_2D);
                                    mGL.bindTexture(mGL.TEXTURE_2D, null);
                                }
                                else if( te.mType===me.TEXTYPE.CUBEMAP )
                                {
                                    mGL.activeTexture(mGL.TEXTURE0);
                                    mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, te.mObjectID);
                                    mGL.generateMipmap( mGL.TEXTURE_CUBE_MAP );
                                    mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);
                                }
                            };

        me.UpdateTexture =  function( tex, x0, y0, xres, yres, buffer )
                            {
                                var glFoTy = iFormatPI2GL( tex.mFormat );
                                if( tex.mType===me.TEXTYPE.T2D )
                                {
                                    mGL.activeTexture( mGL.TEXTURE0);
                                    mGL.bindTexture( mGL.TEXTURE_2D, tex.mObjectID );
                                    mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, tex.mVFlip );
                                    mGL.texSubImage2D( mGL.TEXTURE_2D, 0, x0, y0, xres, yres, glFoTy.mGLExternal, glFoTy.mGLType, buffer );
                                    mGL.bindTexture( mGL.TEXTURE_2D, null );
                                    mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, false);
                                }
                            };

        me.UpdateTextureFromImage = function( tex, image )
                                {
                                    var glFoTy = iFormatPI2GL( tex.mFormat );
                                    if( tex.mType===me.TEXTYPE.T2D )
                                    {
                                        mGL.activeTexture( mGL.TEXTURE0 );
                                        mGL.bindTexture( mGL.TEXTURE_2D, tex.mObjectID );
                                        mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, tex.mVFlip );
                                        mGL.texImage2D(  mGL.TEXTURE_2D, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image );
                                        mGL.bindTexture( mGL.TEXTURE_2D, null );
                                        mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, false);
                                    }
                                };

        me.DestroyTexture = function( te )
                            {
                                 mGL.deleteTexture( te.mObjectID );
                            };

        me.AttachTextures = function (num, t0, t1, t2, t3)
                            {
                                if (num > 0 && t0 != null)
                                {
                                    mGL.activeTexture(mGL.TEXTURE0);
                                         if (t0.mType === me.TEXTYPE.T2D) mGL.bindTexture(mGL.TEXTURE_2D, t0.mObjectID);
                                    else if (t0.mType === me.TEXTYPE.T3D) mGL.bindTexture(mGL.TEXTURE_3D, t0.mObjectID);
                                    else if (t0.mType === me.TEXTYPE.CUBEMAP) mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, t0.mObjectID);
                                }

                                if (num > 1 && t1 != null)
                                {
                                    mGL.activeTexture(mGL.TEXTURE1);
                                         if (t1.mType === me.TEXTYPE.T2D) mGL.bindTexture(mGL.TEXTURE_2D, t1.mObjectID);
                                    else if (t1.mType === me.TEXTYPE.T3D) mGL.bindTexture(mGL.TEXTURE_3D, t1.mObjectID);
                                    else if (t1.mType === me.TEXTYPE.CUBEMAP) mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, t1.mObjectID);
                                }

                                if (num > 2 && t2 != null)
                                {
                                    mGL.activeTexture(mGL.TEXTURE2);
                                         if (t2.mType === me.TEXTYPE.T2D) mGL.bindTexture(mGL.TEXTURE_2D, t2.mObjectID);
                                    else if (t2.mType === me.TEXTYPE.T3D) mGL.bindTexture(mGL.TEXTURE_3D, t2.mObjectID);
                                    else if (t2.mType === me.TEXTYPE.CUBEMAP) mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, t2.mObjectID);
                                }

                                if (num > 3 && t3 != null)
                                {
                                    mGL.activeTexture(mGL.TEXTURE3);
                                         if (t3.mType === me.TEXTYPE.T2D) mGL.bindTexture(mGL.TEXTURE_2D, t3.mObjectID);
                                    else if (t3.mType === me.TEXTYPE.T3D) mGL.bindTexture(mGL.TEXTURE_3D, t3.mObjectID);
                                    else if (t3.mType === me.TEXTYPE.CUBEMAP) mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, t3.mObjectID);
                                }
                            };

        me.DettachTextures = function()
                             {
                                mGL.activeTexture(mGL.TEXTURE0);
                                mGL.bindTexture(mGL.TEXTURE_2D, null);
                                mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);

                                mGL.activeTexture(mGL.TEXTURE1);
                                mGL.bindTexture(mGL.TEXTURE_2D, null);
                                mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);

                                mGL.activeTexture(mGL.TEXTURE2);
                                mGL.bindTexture(mGL.TEXTURE_2D, null);
                                mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);

                                mGL.activeTexture(mGL.TEXTURE3);
                                mGL.bindTexture(mGL.TEXTURE_2D, null);
                                mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);
                             };

        me.CreateRenderTarget = function ( color0, color1, color2, color3, depth, wantZbuffer )
                                {
                                    var id =  mGL.createFramebuffer();
                                    mGL.bindFramebuffer(mGL.FRAMEBUFFER, id);

                                    if (depth === null)
                                    {
                                        if( wantZbuffer===true )
                                        {
                                            var zb = mGL.createRenderbuffer();
                                            mGL.bindRenderbuffer(mGL.RENDERBUFFER, zb);
                                            mGL.renderbufferStorage(mGL.RENDERBUFFER, mGL.DEPTH_COMPONENT16, color0.mXres, color0.mYres);

                                            mGL.framebufferRenderbuffer(mGL.FRAMEBUFFER, mGL.DEPTH_ATTACHMENT, mGL.RENDERBUFFER, zb);
                                        }
                                    }
                                    else
                                    {
                                        mGL.framebufferTexture2D(mGL.FRAMEBUFFER, mGL.DEPTH_ATTACHMENT, mGL.TEXTURE_2D, depth.mObjectID, 0);
                                    }

                                    if( color0 !=null ) mGL.framebufferTexture2D(mGL.FRAMEBUFFER, mGL.COLOR_ATTACHMENT0, mGL.TEXTURE_2D, color0.mObjectID, 0);

                                    if (mGL.checkFramebufferStatus(mGL.FRAMEBUFFER) != mGL.FRAMEBUFFER_COMPLETE)
                                        return null;

                                    mGL.bindRenderbuffer(mGL.RENDERBUFFER, null);
                                    mGL.bindFramebuffer(mGL.FRAMEBUFFER, null);
                                    return { mObjectID: id, mTex0: color0 };
                                };

        me.DestroyRenderTarget = function ( tex )
                                 {
                                     mGL.deleteFramebuffer(tex.mObjectID);
                                 };

        me.SetRenderTarget = function (tex)
                             {
                                if( tex===null )
                                    mGL.bindFramebuffer(mGL.FRAMEBUFFER, null);
                                else
                                    mGL.bindFramebuffer(mGL.FRAMEBUFFER, tex.mObjectID);

                                //mGL.drawBuffers([mGL.COLOR_ATTACHMENT0, mGL.COLOR_ATTACHMENT1]);
                             };

        me.CreateRenderTargetNew = function ( wantColor0, wantZbuffer, xres, yres, samples )
                                {
                                    var id =  mGL.createFramebuffer();
                                    mGL.bindFramebuffer(mGL.FRAMEBUFFER, id);

                                    if( wantZbuffer===true )
                                    {
                                        var zb = mGL.createRenderbuffer();
                                        mGL.bindRenderbuffer(mGL.RENDERBUFFER, zb);

                                        if( samples==1 )
                                        mGL.renderbufferStorage(mGL.RENDERBUFFER, mGL.DEPTH_COMPONENT16, xres, yres);
                                        else
                                        mGL.renderbufferStorageMultisample(mGL.RENDERBUFFER, samples, mGL.DEPTH_COMPONENT16, xres, yres);
                                        mGL.framebufferRenderbuffer(mGL.FRAMEBUFFER, mGL.DEPTH_ATTACHMENT, mGL.RENDERBUFFER, zb);
                                    }

                                    if( wantColor0 )
                                    {
                                        var cb = mGL.createRenderbuffer();
                                        mGL.bindRenderbuffer(mGL.RENDERBUFFER, cb);
                                        if( samples==1 )
                                        mGL.renderbufferStorage(mGL.RENDERBUFFER, mGL.RGBA8, xres, yres);
                                        else
                                        mGL.renderbufferStorageMultisample(mGL.RENDERBUFFER, samples, mGL.RGBA8, xres, yres);
                                        mGL.framebufferRenderbuffer(mGL.FRAMEBUFFER, mGL.COLOR_ATTACHMENT0, mGL.RENDERBUFFER, cb);
                                    }

                                    if (mGL.checkFramebufferStatus(mGL.FRAMEBUFFER) != mGL.FRAMEBUFFER_COMPLETE)
                                    {
                                        return null;
                                    }
                                    mGL.bindRenderbuffer(mGL.RENDERBUFFER, null);
                                    mGL.bindFramebuffer(mGL.FRAMEBUFFER, null);
                                    return { mObjectID: id, mXres: xres, mYres:yres, mTex0: color0 };
                                };

        me.CreateRenderTargetCubeMap = function ( color0, depth, wantZbuffer )
                                {
                                    var id =  mGL.createFramebuffer();
                                    mGL.bindFramebuffer(mGL.FRAMEBUFFER, id);

                                    if (depth === null)
                                    {
                                        if( wantZbuffer===true )
                                        {
                                            var zb = mGL.createRenderbuffer();
                                            mGL.bindRenderbuffer(mGL.RENDERBUFFER, zb);
                                            mGL.renderbufferStorage(mGL.RENDERBUFFER, mGL.DEPTH_COMPONENT16, color0.mXres, color0.mYres);
                                            mGL.framebufferRenderbuffer(mGL.FRAMEBUFFER, mGL.DEPTH_ATTACHMENT, mGL.RENDERBUFFER, zb);
                                        }
                                    }
                                    else
                                    {
                                        mGL.framebufferTexture2D(mGL.FRAMEBUFFER, mGL.DEPTH_ATTACHMENT, mGL.TEXTURE_2D, depth.mObjectID, 0);
                                    }

                                    if( color0 !=null ) mGL.framebufferTexture2D(mGL.FRAMEBUFFER, mGL.COLOR_ATTACHMENT0, mGL.TEXTURE_CUBE_MAP_POSITIVE_X, color0.mObjectID, 0);

                                    if (mGL.checkFramebufferStatus(mGL.FRAMEBUFFER) != mGL.FRAMEBUFFER_COMPLETE)
                                        return null;

                                    mGL.bindRenderbuffer(mGL.RENDERBUFFER, null);
                                    mGL.bindFramebuffer(mGL.FRAMEBUFFER, null);
                                    return { mObjectID: id, mTex0: color0 };
                                };

        me.SetRenderTargetCubeMap = function (fbo, face)
                             {
                                if( fbo===null )
                                    mGL.bindFramebuffer(mGL.FRAMEBUFFER, null);
                                else
                                {
                                    mGL.bindFramebuffer(mGL.FRAMEBUFFER, fbo.mObjectID);
                                    mGL.framebufferTexture2D(mGL.FRAMEBUFFER, mGL.COLOR_ATTACHMENT0, mGL.TEXTURE_CUBE_MAP_POSITIVE_X+face, fbo.mTex0.mObjectID, 0);
                                }
                             };


        me.BlitRenderTarget = function( dst, src )
                                {
                                    mGL.bindFramebuffer(mGL.READ_FRAMEBUFFER, src.mObjectID);
                                    mGL.bindFramebuffer(mGL.DRAW_FRAMEBUFFER, dst.mObjectID);
                                    mGL.clearBufferfv(mGL.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);
                                    mGL.blitFramebuffer( 0, 0, src.mXres, src.mYres,
                                                         0, 0, src.mXres, src.mYres,
                                                         mGL.COLOR_BUFFER_BIT, mGL.LINEAR
                                    );
                                };

        me.SetViewport = function( vp )
                         {
                              mGL.viewport( vp[0], vp[1], vp[2], vp[3] );
                         };

        me.SetWriteMask = function( c0, c1, c2, c3, z )
                          {
                              mGL.depthMask(z);
                              mGL.colorMask(c0,c0,c0,c0);
                          };

        me.SetState = function( stateName, stateValue )
                      {
                            if (stateName === me.RENDSTGATE.WIREFRAME)
                            {
                                if( stateValue ) mGL.polygonMode( mGL.FRONT_AND_BACK, mGL.LINE );
                                else             mGL.polygonMode( mGL.FRONT_AND_BACK, mGL.FILL );
                            }
                            else if (stateName === me.RENDSTGATE.FRONT_FACE)
                            {
                                if( stateValue ) mGL.cullFace( mGL.BACK );
                                else             mGL.cullFace( mGL.FRONT );
                            }
                            else if (stateName === me.RENDSTGATE.CULL_FACE)
                            {
                                if( stateValue ) mGL.enable( mGL.CULL_FACE );
                                else             mGL.disable( mGL.CULL_FACE );
                            }
                            else if (stateName === me.RENDSTGATE.DEPTH_TEST)
                            {
                                if( stateValue ) mGL.enable( mGL.DEPTH_TEST );
                                else             mGL.disable( mGL.DEPTH_TEST );
                            }
                            else if (stateName === me.RENDSTGATE.ALPHA_TO_COVERAGE)
                            {
                                if( stateValue ) { mGL.enable(  mGL.SAMPLE_ALPHA_TO_COVERAGE ); }
                                else             { mGL.disable( mGL.SAMPLE_ALPHA_TO_COVERAGE ); }
                            }
                      };

        me.SetMultisample = function( v)
                    {
                        if( v===true )
                        {
                            mGL.enable(mGL.SAMPLE_COVERAGE);
                            mGL.sampleCoverage(1.0, false);
                        }
                        else
                        {
                            mGL.disable(mGL.SAMPLE_COVERAGE);
                        }
                    };

        me.GetTranslatedShaderSource = function (shader)
                          {
                            if( mGL===null ) return null;
                            if( mDebugShader===null ) return null;
                            let vfs = mGL.getAttachedShaders(shader.mProgram);
                            let str = mDebugShader.getTranslatedShaderSource(vfs[1]);
                            let parts = str.split("GLSL END"); str = (parts.length<2) ? str : parts[1];
                            return str;
                          };

        me.CreateShader = function (vsSource, fsSource, preventCache, forceSynch, onResolve)
                          {
                            if( mGL===null ) return;

                            var vs = mGL.createShader( mGL.VERTEX_SHADER   );
                            var fs = mGL.createShader( mGL.FRAGMENT_SHADER );

                            vsSource = mShaderHeader[0] + vsSource;
                            fsSource = mShaderHeader[1] + fsSource;

                            if( preventCache )
                            {
                                let vran = Math.random().toString(36).substring(7);
                                let fran = Math.random().toString(36).substring(7);
                                vsSource += "\n#define K" + vran + "\n";
                                fsSource += "\n#define K" + fran + "\n";
                            }

                            var timeStart = (new Date()).getTime();

                            mGL.shaderSource(vs, vsSource);
                            mGL.shaderSource(fs, fsSource);
                            mGL.compileShader(vs);
                            mGL.compileShader(fs);

                            var pr = mGL.createProgram();
                            mGL.attachShader(pr, vs);
                            mGL.attachShader(pr, fs);
                            mGL.linkProgram(pr);

                            //-------------
                            let checkErrors = function()
                            {
                                if (!mGL.getProgramParameter(pr, mGL.LINK_STATUS))
                                {
                                    // vs error
                                    if (!mGL.getShaderParameter(vs, mGL.COMPILE_STATUS))
                                    {
                                        let vsLog = mGL.getShaderInfoLog(vs);
                                        onResolve(false, { mErrorType: 0, mErrorStr: vsLog });
                                        mGL.deleteProgram(pr);
                                    }
                                    // fs error
                                    else if (!mGL.getShaderParameter(fs, mGL.COMPILE_STATUS))
                                    {
                                        let fsLog = mGL.getShaderInfoLog(fs);
                                        onResolve(false, { mErrorType: 1, mErrorStr: fsLog });
                                        mGL.deleteProgram(pr);
                                    }
                                    // link error
                                    else
                                    {
                                        let infoLog = mGL.getProgramInfoLog(pr);
                                        onResolve(false, { mErrorType: 2, mErrorStr: infoLog });
                                        mGL.deleteProgram(pr);
                                    }
                                }
                                // no errors
                                else
                                {
                                    let compilationTime = (new Date()).getTime() - timeStart;
                                    onResolve(true, { mProgram: pr, mTime: compilationTime });
                                }
                            };

                            // check compilation
                            if (mAsynchCompile === null || forceSynch===true )
                            {
                                checkErrors();
                            }
                            else
                            {
                                let loopCheckCompletion = function ()
                                {
                                    if( mGL.getProgramParameter(pr, mAsynchCompile.COMPLETION_STATUS_KHR) === true )
                                        checkErrors();
                                    else
                                        setTimeout(loopCheckCompletion, 10);
                                };
                                setTimeout(loopCheckCompletion, 10);
                            }
                        };

        me.AttachShader = function( shader )
                          {
                                if( shader===null )
                                {
                                    mBindedShader = null;
                                    mGL.useProgram( null );
                                }
                                else
                                {
                                    mBindedShader = shader;
                                    mGL.useProgram(shader.mProgram);
                                }
                          };

        me.DetachShader = function ()
                        {
                            mGL.useProgram(null);
                        };

        me.DestroyShader = function( tex )
                        {
                            mGL.deleteProgram(tex.mProgram);
                        };

        me.GetAttribLocation = function (shader, name)
                        {
                            return mGL.getAttribLocation(shader.mProgram, name);
                        };

        me.SetShaderConstantLocation = function (shader, name)
                        {
                            return mGL.getUniformLocation(shader.mProgram, name);
                        };

        me.SetShaderConstantMat4F = function( uname, params, istranspose )
                        {
                            var program = mBindedShader;

                            let pos = mGL.getUniformLocation( program.mProgram, uname );
                            if( pos===null )
                                return false;

                            if( istranspose===false )
                            {
                                var tmp = new Float32Array( [ params[0], params[4], params[ 8], params[12],
                                                              params[1], params[5], params[ 9], params[13],
                                                              params[2], params[6], params[10], params[14],
                                                              params[3], params[7], params[11], params[15] ] );
	                            mGL.uniformMatrix4fv(pos,false,tmp);
                            }
                            else
                                mGL.uniformMatrix4fv(pos,false,new Float32Array(params) );
                            return true;
                        };

        me.SetShaderConstant1F_Pos = function(pos, x)
                        {
                            mGL.uniform1f(pos, x);
                            return true;
                        };

        me.SetShaderConstant1FV_Pos = function(pos, x)
                        {
                            mGL.uniform1fv(pos, x);
                            return true;
                        };

        me.SetShaderConstant1F = function( uname, x )
                        {
                            var pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
                            if (pos === null)
                                return false;
                            mGL.uniform1f(pos, x);
                            return true;
                        };

        me.SetShaderConstant1I = function(uname, x)
                        {
                            let pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
                            if (pos === null)
                                return false;
                            mGL.uniform1i(pos, x);
                            return true;
                        };
        me.SetShaderConstant1I_Pos = function(pos, x)
                        {
                            mGL.uniform1i(pos, x);
                            return true;
                        };


        me.SetShaderConstant2F = function(uname, x)
                        {
                            let pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
                            if (pos === null)
                                return false;
                            mGL.uniform2fv(pos, x);
                            return true;
                        };

        me.SetShaderConstant3F = function(uname, x, y, z)
                        {
                            let pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
                            if (pos === null)
                                return false;
                            mGL.uniform3f(pos, x, y, z);
                            return true;
                        };

        me.SetShaderConstant1FV = function(uname, x)
                        {
                            let pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
                            if (pos === null)
                                return false;
                            mGL.uniform1fv(pos, new Float32Array(x));
                            return true;
                        };

        me.SetShaderConstant3FV = function(uname, x)
                        {
                            let pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
                            if (pos === null) return false;
                            mGL.uniform3fv(pos, new Float32Array(x) );
                            return true;
                        };

        me.SetShaderConstant4FV = function(uname, x)
                        {
                            let pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
                            if (pos === null) return false;
                            mGL.uniform4fv(pos, new Float32Array(x) );
                            return true;
                        };

        me.SetShaderTextureUnit = function( uname, unit )
                        {
                            var program = mBindedShader;
                            let pos = mGL.getUniformLocation(program.mProgram, uname);
                            if (pos === null) return false;
                            mGL.uniform1i(pos, unit);
                            return true;
                        };

        me.CreateVertexArray = function( data, mode )
                        {
                            let id = mGL.createBuffer();
                            mGL.bindBuffer(mGL.ARRAY_BUFFER, id);
                            if (mode === me.BUFTYPE.STATIC)
                                mGL.bufferData(mGL.ARRAY_BUFFER, data, mGL.STATIC_DRAW);
                            else
                                mGL.bufferData(mGL.ARRAY_BUFFER, data, mGL.DYNAMIC_DRAW);
                            return { mObject: id };
                        };

        me.CreateIndexArray = function( data, mode )
                        {
                            let id = mGL.createBuffer();
                            mGL.bindBuffer(mGL.ELEMENT_ARRAY_BUFFER, id );
                            if (mode === me.BUFTYPE.STATIC)
                                mGL.bufferData(mGL.ELEMENT_ARRAY_BUFFER, data, mGL.STATIC_DRAW);
                            else
                                mGL.bufferData(mGL.ELEMENT_ARRAY_BUFFER, data, mGL.DYNAMIC_DRAW);
                            return { mObject: id };
                        };

        me.DestroyArray = function( tex )
                        {
                            mGL.destroyBuffer(tex.mObject);
                        };

        me.AttachVertexArray = function( tex, attribs, pos )
                        {
                            let shader = mBindedShader;

                            mGL.bindBuffer( mGL.ARRAY_BUFFER, tex.mObject);

                            var num = attribs.mChannels.length;
                            var stride = attribs.mStride;

                            var offset = 0;
                            for (var i = 0; i < num; i++)
                            {
                                var id = pos[i];
                                mGL.enableVertexAttribArray(id);
                                var dtype = mGL.FLOAT;
                                var dsize = 4;
                                     if( attribs.mChannels[i].mType === me.TYPE.UINT8   ) { dtype = mGL.UNSIGNED_BYTE;  dsize = 1; }
                                else if( attribs.mChannels[i].mType === me.TYPE.UINT16  ) { dtype = mGL.UNSIGNED_SHORT; dsize = 2; }
                                else if( attribs.mChannels[i].mType === me.TYPE.FLOAT32 ) { dtype = mGL.FLOAT;          dsize = 4; }
                                mGL.vertexAttribPointer(id, attribs.mChannels[i].mNumComponents, dtype, attribs.mChannels[i].mNormalize, stride, offset);
                                offset += attribs.mChannels[i].mNumComponents * dsize;
                            }
                        };

        me.AttachIndexArray = function( tex )
                        {
                            mGL.bindBuffer(mGL.ELEMENT_ARRAY_BUFFER, tex.mObject);
                        };

        me.DetachVertexArray = function (tex, attribs)
                        {
                            let num = attribs.mChannels.length;
                            for (let i = 0; i < num; i++)
                                mGL.disableVertexAttribArray(i);
                            mGL.bindBuffer(mGL.ARRAY_BUFFER, null);
                        };

        me.DetachIndexArray = function( tex )
                        {
                            mGL.bindBuffer(mGL.ELEMENT_ARRAY_BUFFER, null);
                        };

        me.DrawPrimitive = function( typeOfPrimitive, num, useIndexArray, numInstances )
                        {
                            let glType = mGL.POINTS;
                            if( typeOfPrimitive===me.PRIMTYPE.POINTS ) glType = mGL.POINTS;
                            if( typeOfPrimitive===me.PRIMTYPE.LINES ) glType = mGL.LINES;
                            if( typeOfPrimitive===me.PRIMTYPE.LINE_LOOP ) glType = mGL.LINE_LOOP;
                            if( typeOfPrimitive===me.PRIMTYPE.LINE_STRIP ) glType = mGL.LINE_STRIP;
                            if( typeOfPrimitive===me.PRIMTYPE.TRIANGLES ) glType = mGL.TRIANGLES;
                            if( typeOfPrimitive===me.PRIMTYPE.TRIANGLE_STRIP ) glType = mGL.TRIANGLE_STRIP;

                            if( numInstances<=1 )
                            {
  	                            if( useIndexArray ) mGL.drawElements( glType, num, mGL.UNSIGNED_SHORT, 0 );
	                            else                mGL.drawArrays( glType, 0, num );
                            }
                            else
                            {
                                mGL.drawArraysInstanced(glType, 0, num, numInstances);
                                mGL.drawElementsInstanced( glType, num, mGL.UNSIGNED_SHORT, 0, numInstances);
                            }
                        };


        me.DrawFullScreenTriangle_XY = function( vpos )
                        {
                            mGL.bindBuffer( mGL.ARRAY_BUFFER, mVBO_Tri );
                            mGL.vertexAttribPointer( vpos, 2, mGL.FLOAT, false, 0, 0 );
                            mGL.enableVertexAttribArray( vpos );
                            mGL.drawArrays( mGL.TRIANGLES, 0, 3 );
                            mGL.disableVertexAttribArray( vpos );
                            mGL.bindBuffer( mGL.ARRAY_BUFFER, null );
                        };


        me.DrawUnitQuad_XY = function( vpos )
                        {
                            mGL.bindBuffer( mGL.ARRAY_BUFFER, mVBO_Quad );
                            mGL.vertexAttribPointer( vpos, 2, mGL.FLOAT, false, 0, 0 );
                            mGL.enableVertexAttribArray( vpos );
                            mGL.drawArrays( mGL.TRIANGLES, 0, 6 );
                            mGL.disableVertexAttribArray( vpos );
                            mGL.bindBuffer( mGL.ARRAY_BUFFER, null );
                        };

        me.DrawUnitCube_XYZ_NOR = function( vpos )
                        {
                            mGL.bindBuffer( mGL.ARRAY_BUFFER, mVBO_CubePosNor );
                            mGL.vertexAttribPointer( vpos[0], 3, mGL.FLOAT, false, 0, 0 );
                            mGL.vertexAttribPointer( vpos[1], 3, mGL.FLOAT, false, 0, 0 );
                            mGL.enableVertexAttribArray( vpos[0] );
                            mGL.enableVertexAttribArray( vpos[1] );
                            mGL.drawArrays(mGL.TRIANGLE_STRIP, 0, 4);
                            mGL.drawArrays(mGL.TRIANGLE_STRIP, 4, 4);
                            mGL.drawArrays(mGL.TRIANGLE_STRIP, 8, 4);
                            mGL.drawArrays(mGL.TRIANGLE_STRIP, 12, 4);
                            mGL.drawArrays(mGL.TRIANGLE_STRIP, 16, 4);
                            mGL.drawArrays(mGL.TRIANGLE_STRIP, 20, 4);
                            mGL.disableVertexAttribArray( vpos[0] );
                            mGL.disableVertexAttribArray( vpos[1] );
                            mGL.bindBuffer( mGL.ARRAY_BUFFER, null );
                        }

        me.DrawUnitCube_XYZ = function( vpos )
                        {
                            mGL.bindBuffer( mGL.ARRAY_BUFFER, mVBO_CubePos );
                            mGL.vertexAttribPointer( vpos, 3, mGL.FLOAT, false, 0, 0 );
                            mGL.enableVertexAttribArray( vpos );
                            mGL.drawArrays(mGL.TRIANGLE_STRIP, 0, 4);
                            mGL.drawArrays(mGL.TRIANGLE_STRIP, 4, 4);
                            mGL.drawArrays(mGL.TRIANGLE_STRIP, 8, 4);
                            mGL.drawArrays(mGL.TRIANGLE_STRIP, 12, 4);
                            mGL.drawArrays(mGL.TRIANGLE_STRIP, 16, 4);
                            mGL.drawArrays(mGL.TRIANGLE_STRIP, 20, 4);
                            mGL.disableVertexAttribArray( vpos );
                            mGL.bindBuffer( mGL.ARRAY_BUFFER, null );
                        }

        me.SetBlend = function( enabled )
                    {
                        if( enabled )
                        {
                            mGL.enable( mGL.BLEND );
                            mGL.blendEquationSeparate( mGL.FUNC_ADD, mGL.FUNC_ADD );
                            mGL.blendFuncSeparate( mGL.SRC_ALPHA, mGL.ONE_MINUS_SRC_ALPHA, mGL.ONE, mGL.ONE_MINUS_SRC_ALPHA );
                        }
                        else
                        {
                            mGL.disable( mGL.BLEND );
                        }
                    };

        me.GetPixelData = function( data, offset, xres, yres )
                        {
                            mGL.readPixels(0, 0, xres, yres, mGL.RGBA, mGL.UNSIGNED_BYTE, data, offset);
                        };

        me.GetPixelDataRenderTarget = function( obj, data, xres, yres )
                        {
                            mGL.bindFramebuffer(mGL.FRAMEBUFFER, obj.mObjectID);
                            mGL.readBuffer(mGL.COLOR_ATTACHMENT0);
                            mGL.readPixels(0, 0, xres, yres, mGL.RGBA, mGL.FLOAT, data, 0);
                            mGL.bindFramebuffer(mGL.FRAMEBUFFER, null);
                        };
    return me;
}
//==============================================================================
//
// piLibs 2015-2017 - http://www.iquilezles.org/www/material/piLibs/piLibs.htm
//
// piShading
//
//==============================================================================

function smoothstep(a, b, x)
{
    x = (x - a) / (b - a);
    if (x < 0) x = 0; else if (x > 1) x = 1;
    return x * x * (3.0 - 2.0 * x);
}

function clamp01(x)
{
    if( x < 0.0 ) x = 0.0;
    if( x > 1.0 ) x = 1.0;
    return x;
}

function clamp(x, a, b)
{
    if( x < a ) x = a;
    if( x > b ) x = b;
    return x;
}

function screen(a, b)
{
    return 1.0 - (1.0 - a) * (1.0 - b);
}

function parabola(x)
{
    return 4.0 * x * (1.0 - x);
}

function min(a, b)
{
    return (a < b) ? a : b;
}

function max(a, b)
{
    return (a > b) ? a : b;
}

function noise( x )
{
    function grad(i, j, x, y)
    {
        var h = 7 * i + 131 * j;
        h = (h << 13) ^ h;
        h = (h * (h * h * 15731 + 789221) + 1376312589);

        var rx = (h & 0x20000000) ? x : -x;
        var ry = (h & 0x10000000) ? y : -y;

        return rx + ry;
    }

    var i = [ Math.floor(x[0]), Math.floor(x[1]) ];
    var f = [ x[0] - i[0], x[1] - i[1] ];
    var w = [ f[0]*f[0]*(3.0-2.0*f[0]), f[1]*f[1]*(3.0-2.0*f[1]) ];

    var a = grad( i[0]+0, i[1]+0, f[0]+0.0, f[1]+0.0 );
    var b = grad( i[0]+1, i[1]+0, f[0]-1.0, f[1]+0.0 );
    var c = grad( i[0]+0, i[1]+1, f[0]+0.0, f[1]-1.0 );
    var d = grad( i[0]+1, i[1]+1, f[0]-1.0, f[1]-1.0 );

    return a + (b-a)*w[0] + (c-a)*w[1] + (a-b-c+d)*w[0]*w[1];
}//==============================================================================
//
// piLibs 2015-2017 - http://www.iquilezles.org/www/material/piLibs/piLibs.htm
//
// piVecTypes
//
//==============================================================================


function vec3( a, b, c )
{
    return [ a, b, c ];
}

function add( a, b )
{
    return [ a[0]+b[0], a[1]+b[1], a[2]+b[2] ];
}

function sub( a, b )
{
    return [ a[0]-b[0], a[1]-b[1], a[2]-b[2] ];
}

function mul( a, s )
{
    return [ a[0]*s, a[1]*s, a[2]*s ];
}

function cross( a, b )
{
    return [ a[1]*b[2] - a[2]*b[1],
             a[2]*b[0] - a[0]*b[2],
             a[0]*b[1] - a[1]*b[0] ];
}

function dot( a, b )
{
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}

function normalize( v )
{
    var is = 1.0 / Math.sqrt( v[0]*v[0] + v[1]*v[1] + v[2]*v[2] );
    return [ v[0]*is, v[1]*is, v[2]*is ];
}

function createCirclePoint( cen, uuu, vvv, rad, s, t )
{
    return [ cen[0] + rad*(uuu[0]*s + vvv[0]*t),
             cen[1] + rad*(uuu[1]*s + vvv[1]*t),
             cen[2] + rad*(uuu[2]*s + vvv[2]*t) ];
}

function createTangent( a, b, c )
{
    var cb = normalize( [ c[0]-b[0], c[1]-b[1], c[2]-b[2] ] );
    var ba = normalize( [ b[0]-a[0], b[1]-a[1], b[2]-a[2] ] );
    return normalize( [ ba[0]+cb[0], ba[1]+cb[1], ba[2]+cb[2] ] );

}

//===================================

function vec4( a, b, c, d )
{
    return [ a, b, c, d ];
}

function getXYZ( v )
{
    return [ v[0], v[1], v[2] ];
}

//===================================

function setIdentity()
{
    return [ 1.0, 0.0, 0.0, 0.0,
             0.0, 1.0, 0.0, 0.0,
             0.0, 0.0, 1.0, 0.0,
             0.0, 0.0, 0.0, 1.0 ];
}

function setRotationX( t )
{
    var sint = Math.sin(t);
    var cost = Math.cos(t);

    return [ 1.0,   0.0,   0.0, 0.0,
             0.0,  cost, -sint, 0.0,
             0.0,  sint,  cost, 0.0,
             0.0,   0.0,   0.0, 1.0 ];
}

function setRotationY( t )
{
    var sint = Math.sin(t);
    var cost = Math.cos(t);

    return [ cost, 0.0, -sint, 0.0,
              0.0, 1.0,   0.0, 0.0,
             sint, 0.0,  cost, 0.0,
              0.0, 0.0,   0.0, 1.0 ];
}

function extractRotationEuler( m)
{
    var res = [];
    if (m[0] == 1.0)
    {
        res[0] = Math.atan2(m[2], m[11]);
        res[1] = 0.0;
        res[2] = 0.0;

    }
    else if (m[0] == -1.0)
    {
        res[0] = Math.atan2( m[2], m[11]);
        res[1] = 0.0;
        res[2] = 0.0;
    }
    else
    {
        res[0] = Math.atan2( -m[9], m[10]);
        res[1] = Math.atan2( m[8], Math.sqrt(m[9]*m[9] + m[10]*m[10]));
        res[2] = Math.atan2( m[4], m[0]);
    }
    return res;
}

function setFromQuaternion( q )
{
    var ww = q[3]*q[3];
    var xx = q[0]*q[0];
    var yy = q[1]*q[1];
    var zz = q[2]*q[2];

    return [ ww+xx-yy-zz,                   2.0*(q[0]*q[1] - q[3]*q[2]), 2.0*(q[0]*q[2] + q[3]*q[1]), 0.0,
               2.0*(q[0]*q[1] + q[3]*q[2]),   ww-xx+yy-zz,                 2.0*(q[1]*q[2] - q[3]*q[0]), 0.0,
               2.0*(q[0]*q[2] - q[3]*q[1]),   2.0*(q[1]*q[2] + q[3]*q[0]), ww-xx-yy+zz,                 0.0,
               0.0,                           0.0,                         0.0,                         1.0 ];
}

function setPerspective( fovy, aspect, znear, zfar )
{
    var tan = Math.tan(fovy * Math.PI/180.0);
    var x = 1.0 / (tan*aspect);
    var y = 1.0 / (tan);
    var c = -(zfar + znear) / ( zfar - znear);
    var d = -(2.0 * zfar * znear) / (zfar - znear);

    return [ x,    0.0,  0.0,  0.0,
             0.0,  y,    0.0,  0.0,
             0.0,  0.0,  c,     d,
             0.0,  0.0, -1.0,  0.0 ];
}

function setLookAt( eye, tar, up )
{
    var dir = [ -tar[0]+eye[0], -tar[1]+eye[1], -tar[2]+eye[2] ];

	var m00 = dir[2]*up[1] - dir[1]*up[2];
    var m01 = dir[0]*up[2] - dir[2]*up[0];
    var m02 = dir[1]*up[0] - dir[0]*up[1];
    var im = 1.0/Math.sqrt( m00*m00 + m01*m01 + m02*m02 );
    m00 *= im;
    m01 *= im;
    m02 *= im;

	var m04 = m02*dir[1] - m01*dir[2];
    var m05 = m00*dir[2] - m02*dir[0];
    var m06 = m01*dir[0] - m00*dir[1];
    im = 1.0/Math.sqrt( m04*m04 + m05*m05 + m06*m06 );
    m04 *= im;
    m05 *= im;
    m06 *= im;

	var m08 = dir[0];
	var m09 = dir[1];
	var m10 = dir[2];
    im = 1.0/Math.sqrt( m08*m08 + m09*m09 + m10*m10 );
    m08 *= im;
    m09 *= im;
    m10 *= im;

	var m03 = -(m00*eye[0] + m01*eye[1] + m02*eye[2] );
	var m07 = -(m04*eye[0] + m05*eye[1] + m06*eye[2] );
	var m11 = -(m08*eye[0] + m09*eye[1] + m10*eye[2] );

    return [ m00, m01, m02, m03,
             m04, m05, m06, m07,
             m08, m09, m10, m11,
             0.0, 0.0, 0.0, 1.0 ];
}


function setOrtho( left, right, bottom, top, znear, zfar )
{
   var x = 2.0 / (right - left);
   var y = 2.0 / (top - bottom);
   var a = (right + left) / (right - left);
   var b = (top + bottom) / (top - bottom);
   var c = -2.0 / (zfar - znear);
   var d = -(zfar + znear) / ( zfar - znear);

   return [  x, 0.0, 0.0,   a,
           0.0,   y, 0.0,   b,
           0.0, 0.0,   c,   d,
           0.0, 0.0, 0.0, 1.0 ];
}

function setTranslation( p )
{
    return [ 1.0, 0.0, 0.0, p[0],
             0.0, 1.0, 0.0, p[1],
             0.0, 0.0, 1.0, p[2],
             0.0, 0.0, 0.0, 1.0 ];
}

function setScale( s )
{
    return [ s[0], 0.0,  0.0,  0.0,
             0.0,  s[1], 0.0,  0.0,
             0.0,  0.0,  s[2], 0.0,
             0.0,  0.0,  0.0,  1.0];
}

function setProjection( fov, znear, zfar )
{
    var x = 2.0 / (fov[3]+fov[2]);
    var y = 2.0 / (fov[0]+fov[1]);
    var a = (fov[3]-fov[2]) / (fov[3]+fov[2]);
    var b = (fov[0]-fov[1]) / (fov[0]+fov[1]);
    var c = -(zfar + znear) / ( zfar - znear);
    var d = -(2.0*zfar*znear) / (zfar - znear);
    return [   x, 0.0,    a, 0.0,
             0.0,   y,    b, 0.0,
             0.0, 0.0,    c,   d,
             0.0, 0.0, -1.0, 0.0 ];
   // inverse is:
   //return mat4x4( 1.0/x, 0.0f,  0.0f,   a/x,
   //               0.0f,  1.0/y, 0.0f,   b/x,
   //               0.0f,  0.0f,  0.0f,   -1.0,
   //               0.0f,  0.0f,  1.0f/d, c/d );
}


function invertFast( m )
{
    var inv = [

             m[5]  * m[10] * m[15] -
             m[5]  * m[11] * m[14] -
             m[9]  * m[6]  * m[15] +
             m[9]  * m[7]  * m[14] +
             m[13] * m[6]  * m[11] -
             m[13] * m[7]  * m[10],

             -m[1]  * m[10] * m[15] +
              m[1]  * m[11] * m[14] +
              m[9]  * m[2] * m[15] -
              m[9]  * m[3] * m[14] -
              m[13] * m[2] * m[11] +
              m[13] * m[3] * m[10],

             m[1]  * m[6] * m[15] -
             m[1]  * m[7] * m[14] -
             m[5]  * m[2] * m[15] +
             m[5]  * m[3] * m[14] +
             m[13] * m[2] * m[7] -
             m[13] * m[3] * m[6],

             -m[1] * m[6] * m[11] +
              m[1] * m[7] * m[10] +
              m[5] * m[2] * m[11] -
              m[5] * m[3] * m[10] -
              m[9] * m[2] * m[7] +
              m[9] * m[3] * m[6],

             -m[4]  * m[10] * m[15] +
              m[4]  * m[11] * m[14] +
              m[8]  * m[6]  * m[15] -
              m[8]  * m[7]  * m[14] -
              m[12] * m[6]  * m[11] +
              m[12] * m[7]  * m[10],

             m[0]  * m[10] * m[15] -
             m[0]  * m[11] * m[14] -
             m[8]  * m[2] * m[15] +
             m[8]  * m[3] * m[14] +
             m[12] * m[2] * m[11] -
             m[12] * m[3] * m[10],

             -m[0]  * m[6] * m[15] +
              m[0]  * m[7] * m[14] +
              m[4]  * m[2] * m[15] -
              m[4]  * m[3] * m[14] -
              m[12] * m[2] * m[7] +
              m[12] * m[3] * m[6],


             m[0] * m[6] * m[11] -
             m[0] * m[7] * m[10] -
             m[4] * m[2] * m[11] +
             m[4] * m[3] * m[10] +
             m[8] * m[2] * m[7] -
             m[8] * m[3] * m[6],


             m[4]  * m[9] * m[15] -
             m[4]  * m[11] * m[13] -
             m[8]  * m[5] * m[15] +
             m[8]  * m[7] * m[13] +
             m[12] * m[5] * m[11] -
             m[12] * m[7] * m[9],



             -m[0]  * m[9] * m[15] +
              m[0]  * m[11] * m[13] +
              m[8]  * m[1] * m[15] -
              m[8]  * m[3] * m[13] -
              m[12] * m[1] * m[11] +
              m[12] * m[3] * m[9],

              m[0]  * m[5] * m[15] -
              m[0]  * m[7] * m[13] -
              m[4]  * m[1] * m[15] +
              m[4]  * m[3] * m[13] +
              m[12] * m[1] * m[7] -
              m[12] * m[3] * m[5],

              -m[0] * m[5] * m[11] +
               m[0] * m[7] * m[9] +
               m[4] * m[1] * m[11] -
               m[4] * m[3] * m[9] -
               m[8] * m[1] * m[7] +
               m[8] * m[3] * m[5],

              -m[4]  * m[9] * m[14] +
               m[4]  * m[10] * m[13] +
               m[8]  * m[5] * m[14] -
               m[8]  * m[6] * m[13] -
               m[12] * m[5] * m[10] +
               m[12] * m[6] * m[9],

              m[0]  * m[9] * m[14] -
              m[0]  * m[10] * m[13] -
              m[8]  * m[1] * m[14] +
              m[8]  * m[2] * m[13] +
              m[12] * m[1] * m[10] -
              m[12] * m[2] * m[9],

              -m[0]  * m[5] * m[14] +
               m[0]  * m[6] * m[13] +
               m[4]  * m[1] * m[14] -
               m[4]  * m[2] * m[13] -
               m[12] * m[1] * m[6] +
               m[12] * m[2] * m[5],

              m[0] * m[5] * m[10] -
              m[0] * m[6] * m[9] -
              m[4] * m[1] * m[10] +
              m[4] * m[2] * m[9] +
              m[8] * m[1] * m[6] -
              m[8] * m[2] * m[5] ];

    var det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

    det = 1.0/det;

    for( var i = 0; i<16; i++ ) inv[i] = inv[i] * det;

    return inv;
}

function matMul( a, b )
{
    var res = [];
    for( var i=0; i<4; i++ )
    {
        var x = a[4*i+0];
        var y = a[4*i+1];
        var z = a[4*i+2];
        var w = a[4*i+3];

        res[4*i+0] = x * b[ 0] + y * b[ 4] + z * b[ 8] + w * b[12];
        res[4*i+1] = x * b[ 1] + y * b[ 5] + z * b[ 9] + w * b[13];
        res[4*i+2] = x * b[ 2] + y * b[ 6] + z * b[10] + w * b[14];
        res[4*i+3] = x * b[ 3] + y * b[ 7] + z * b[11] + w * b[15];
    }

    return res;
}

function matMulpoint( m, v )
{
    return [ m[0]*v[0] + m[1]*v[1] + m[ 2]*v[2] + m[ 3],
             m[4]*v[0] + m[5]*v[1] + m[ 6]*v[2] + m[ 7],
             m[8]*v[0] + m[9]*v[1] + m[10]*v[2] + m[11] ];
}

function matMulvec( m, v )
{
    return [ m[0]*v[0] + m[1]*v[1] + m[ 2]*v[2],
             m[4]*v[0] + m[5]*v[1] + m[ 6]*v[2],
             m[8]*v[0] + m[9]*v[1] + m[10]*v[2] ];
}


function bound3( infi )
{
    return [ infi, -infi, infi, -infi, infi, -infi ];
}

function bound3_include( a, p )
{
    return [
        (p[0]<a[0]) ? p[0] : a[0],
        (p[0]>a[1]) ? p[0] : a[1],
        (p[1]<a[2]) ? p[1] : a[2],
        (p[1]>a[3]) ? p[1] : a[3],
        (p[2]<a[4]) ? p[2] : a[4],
        (p[2]>a[5]) ? p[2] : a[5] ];
}

function bound3_center( b )
{
    return [ 0.5*(b[0]+b[1]),
             0.5*(b[2]+b[3]),
             0.5*(b[4]+b[5]) ];
}

function bound3_radius( b )
{
    return [ 0.5*(b[1]-b[0]),
             0.5*(b[3]-b[2]),
             0.5*(b[5]-b[4]) ];
}
//==============================================================================
//
// piLibs 2015-2017 - http://www.iquilezles.org/www/material/piLibs/piLibs.htm
//
// piWebVR
//
//==============================================================================

function WebVR( isVREnabledCallback, canvasElement )
{
    isVREnabledCallback(false);
}

WebVR.prototype.IsSupported = function()
{
    return false;
    //return this.mSupportVR;
}

WebVR.prototype.GetData = function( id )
{
    return {};
}

WebVR.prototype.Enable = function( id )
{
}

WebVR.prototype.Disable = function( id )
{
}

WebVR.prototype.RequestAnimationFrame = function (id)
{
}

WebVR.prototype.IsPresenting = function (id)
{
    return false;
}

WebVR.prototype.Finish = function (id)
{
}

//==============================================================================
//
// piLibs 2015-2017 - http://www.iquilezles.org/www/material/piLibs/piLibs.htm
//
// piWebUtils
//
//==============================================================================



function htmlEntities(str)
{
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g,'&apos;');
}

function piDisableTouch()
{}

var piGetTime = function ( timestamp )
{
    if (timestamp == 0)
        return "";
    return new Date(timestamp * 1000).toISOString().substr(0, 10);
}

function piGetCoords( obj )
{
    var x = 0;
    var y = 0;
    do
    {
         x += obj.offsetLeft;
         y += obj.offsetTop;
    }while( obj = obj.offsetParent );

    return { mX:x, mY:y };
}

function piGetMouseCoords( ev, canvasElement )
{
    var pos = piGetCoords(canvasElement );
    var mcx =                        (ev.pageX - pos.mX) * canvasElement.width / canvasElement.offsetWidth;
    var mcy = canvasElement.height - (ev.pageY - pos.mY) * canvasElement.height / canvasElement.offsetHeight;

    return { mX: mcx, mY: mcy };

}

function piGetSourceElement( e )
{
    var ele = null;
    if( e.target )     ele = e.target;
    if( e.srcElement ) ele = e.srcElement;
    return ele;
}

function piRequestFullScreen( ele )
{}

function piIsFullScreen()
{
    return false;
}

function piExitFullScreen()
{}

function piIsMobile()
{
    return false;
}

function piCreateGlContext( cv, useAlpha, useDepth, usePreserveBuffer, useSupersampling )
{
    var opts = { alpha: useAlpha,
                 depth: useDepth,
                 stencil: false,
                 premultipliedAlpha: false,
                 antialias: useSupersampling,
                 preserveDrawingBuffer: usePreserveBuffer,
                 powerPreference: "high-performance" }; // "low_power", "high_performance", "default"

    var gl = null;
    if( gl === null) gl = cv.getContext( "webgl2", opts );
    if( gl === null) gl = cv.getContext( "experimental-webgl2", opts );
    if( gl === null) gl = cv.getContext( "webgl", opts );
    if( gl === null) gl = cv.getContext( "experimental-webgl", opts );

    return gl;
}

function piCreateAudioContext()
{
    return null;
}

function piHexColorToRGB(str) // "#ff3041"
{
    var rgb = parseInt(str.slice(1), 16);
    var r = (rgb >> 16) & 255;
    var g = (rgb >> 8) & 255;
    var b = (rgb >> 0) & 255;
    return [r, g, b];
}

function piCreateFPSCounter()
{
    var mFrame;
    var mTo;
    var mFPS;

    var iReset = function( time )
    {
        mFrame = 0;
        mTo = time;
        mFPS = 60.0;
    }

    var iCount = function( time )
    {
        mFrame++;

        if( (time-mTo)>500.0 )
        {
            mFPS = 1000.0*mFrame/(time-mTo);
            mFrame = 0;
            mTo = time;
            return true;
        }
        return false;
    }

    var iGetFPS = function()
    {
        return mFPS;
    }

    return { Reset : iReset, Count : iCount, GetFPS : iGetFPS };
}

function piCanMediaRecorded(canvas)
{
    return true;
}

function piCreateMediaRecorder(isRecordingCallback, canvas)
{
    if (piCanMediaRecorded(canvas) == false)
    {
        return null;
    }

    var options = { audioBitsPerSecond : 0, videoBitsPerSecond : 8000000 };
	     if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) options.mimeType = 'video/webm;codecs=h264';
    else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9' )) options.mimeType = 'video/webm;codecs=vp9';
    else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8' )) options.mimeType = 'video/webm;codecs=vp8';
    else                                                              options.mimeType = 'video/webm;';

    var mediaRecorder = new MediaRecorder(canvas.captureStream(), options);
    var chunks = [];

    mediaRecorder.ondataavailable = function(e)
    {
        if (e.data.size > 0)
        {
            chunks.push(e.data);
        }
    };

    mediaRecorder.onstart = function(){
        isRecordingCallback( true );
    };

    mediaRecorder.onstop = function()
    {
         isRecordingCallback( false );
     };

    return mediaRecorder;
}

function piExportToEXR(width, height, numComponents, type, bytes)
{
    var bytesPerComponent = 0;
    if      (type=="Uint")   bytesPerComponent = 4;
    else if (type=="Half")   bytesPerComponent = 2;
    else if (type=="Float")  bytesPerComponent = 4;

    var tHeader = 258 + (18 * numComponents + 1);
    var tTable = 8 * height;
    var tScanlines = height * (4 + 4 + (numComponents * bytesPerComponent * width));
    var tTotal = tHeader + tTable + tScanlines;

    var buffer = new ArrayBuffer(tTotal);
    var data = new DataView(buffer);

    // Header
    {
        // Header : 4 bytes -> 0x76, 0x2f, 0x31, 0x01
        var c = 0;
        data.setUint8 (c++, 0x76);
        data.setUint8 (c++, 0x2f);
        data.setUint8 (c++, 0x31);
        data.setUint8 (c++, 0x01);

        // Version : 4 bytes -> 2, 0, 0, 0
        data.setUint8 (c++, 0x02);
        data.setUint8 (c++, 0x0);
        data.setUint8 (c++, 0x0);
        data.setUint8 (c++, 0x0);

        // Write channel info
        // Write attribute name : "channels"
            data.setUint8 (c++, 0x63);
            data.setUint8 (c++, 0x68);
            data.setUint8 (c++, 0x61);
            data.setUint8 (c++, 0x6e);
            data.setUint8 (c++, 0x6e);
            data.setUint8 (c++, 0x65);
            data.setUint8 (c++, 0x6c);
            data.setUint8 (c++, 0x73);
            data.setUint8 (c++, 0x0);

            // Write attribute type : "chlist"
            data.setUint8 (c++, 0x63);
            data.setUint8 (c++, 0x68);
            data.setUint8 (c++, 0x6c);
            data.setUint8 (c++, 0x69);
            data.setUint8 (c++, 0x73);
            data.setUint8 (c++, 0x74);
            data.setUint8 (c++, 0x00);

            // Write attribute size : 18 x 3 + 1 = 55
            var attribSize = 18 * numComponents + 1;
            data.setUint8 (c++, attribSize);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);

            var i;
            for (i = 0; i < numComponents; i++)
            {
                // Attribute : "B" (42) "G" (47) "R" (52)
                if (i==0)       data.setUint8 (c++, 0x42);
                else if (i==1)  data.setUint8 (c++, 0x47);
                else if (i==2)  data.setUint8 (c++, 0x52);
                data.setUint8 (c++, 0x00);

                // Value : Float (2), Half (1), Uint (0)
                if      (type=="Uint")   data.setUint8 (c++, 0x00);
                else if (type=="Half")   data.setUint8 (c++, 0x01);
                else if (type=="Float")  data.setUint8 (c++, 0x02);
                data.setUint8 (c++, 0x00);
                data.setUint8 (c++, 0x00);
                data.setUint8 (c++, 0x00);

                // Plinear
                data.setUint8 (c++, 0x01);

                // Reserved
                data.setUint8 (c++, 0x00);
                data.setUint8 (c++, 0x00);
                data.setUint8 (c++, 0x00);

                // X sampling
                data.setUint8 (c++, 0x01);
                data.setUint8 (c++, 0x00);
                data.setUint8 (c++, 0x00);
                data.setUint8 (c++, 0x00);

                // Y sampling
                data.setUint8 (c++, 0x01);
                data.setUint8 (c++, 0x00);
                data.setUint8 (c++, 0x00);
                data.setUint8 (c++, 0x00);
            }
            // End attribute
            data.setUint8 (c++, 0x00);

        // Write attribute name : "compression"
            data.setUint8 (c++, 0x63);
            data.setUint8 (c++, 0x6f);
            data.setUint8 (c++, 0x6d);
            data.setUint8 (c++, 0x70);
            data.setUint8 (c++, 0x72);
            data.setUint8 (c++, 0x65);
            data.setUint8 (c++, 0x73);
            data.setUint8 (c++, 0x73);
            data.setUint8 (c++, 0x69);
            data.setUint8 (c++, 0x6f);
            data.setUint8 (c++, 0x6e);
            data.setUint8 (c++, 0x00);

            // Write attribute type : "compression"
            data.setUint8 (c++, 0x63);
            data.setUint8 (c++, 0x6f);
            data.setUint8 (c++, 0x6d);
            data.setUint8 (c++, 0x70);
            data.setUint8 (c++, 0x72);
            data.setUint8 (c++, 0x65);
            data.setUint8 (c++, 0x73);
            data.setUint8 (c++, 0x73);
            data.setUint8 (c++, 0x69);
            data.setUint8 (c++, 0x6f);
            data.setUint8 (c++, 0x6e);
            data.setUint8 (c++, 0x00);

            // Write attribute size : "1"
            data.setUint8 (c++, 0x01);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);

            // Write attribute value : "0" (None)
            data.setUint8 (c++, 0x00);

        // datawindow
            data.setUint8 (c++, 0x64);
            data.setUint8 (c++, 0x61);
            data.setUint8 (c++, 0x74);
            data.setUint8 (c++, 0x61);
            data.setUint8 (c++, 0x57);
            data.setUint8 (c++, 0x69);
            data.setUint8 (c++, 0x6e);
            data.setUint8 (c++, 0x64);
            data.setUint8 (c++, 0x6f);
            data.setUint8 (c++, 0x77);
            data.setUint8 (c++, 0x00);

            // box2i
            data.setUint8 (c++, 0x62);
            data.setUint8 (c++, 0x6f);
            data.setUint8 (c++, 0x78);
            data.setUint8 (c++, 0x32);
            data.setUint8 (c++, 0x69);
            data.setUint8 (c++, 0x00);

            // size 16
            data.setUint8 (c++, 0x10);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);

            // value 0 0 3 2
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);

            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);

            data.setUint32 (c, width-1, true);
            c += 4;

            data.setUint32 (c, height-1, true);
            c += 4;

        // displayWindow
            data.setUint8 (c++, 0x64);
            data.setUint8 (c++, 0x69);
            data.setUint8 (c++, 0x73);
            data.setUint8 (c++, 0x70);
            data.setUint8 (c++, 0x6c);
            data.setUint8 (c++, 0x61);
            data.setUint8 (c++, 0x79);
            data.setUint8 (c++, 0x57);
            data.setUint8 (c++, 0x69);
            data.setUint8 (c++, 0x6e);
            data.setUint8 (c++, 0x64);
            data.setUint8 (c++, 0x6f);
            data.setUint8 (c++, 0x77);
            data.setUint8 (c++, 0x00);

            // box2i
            data.setUint8 (c++, 0x62);
            data.setUint8 (c++, 0x6f);
            data.setUint8 (c++, 0x78);
            data.setUint8 (c++, 0x32);
            data.setUint8 (c++, 0x69);
            data.setUint8 (c++, 0x00);

            // size 16
            data.setUint8 (c++, 0x10);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);

            // value 0 0 3 2
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);

            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);

            data.setUint32 (c, width-1, true);
            c += 4;

            data.setUint32 (c, height-1, true);
            c += 4;

        // lineOrder
            data.setUint8 (c++, 0x6c);
            data.setUint8 (c++, 0x69);
            data.setUint8 (c++, 0x6e);
            data.setUint8 (c++, 0x65);
            data.setUint8 (c++, 0x4f);
            data.setUint8 (c++, 0x72);
            data.setUint8 (c++, 0x64);
            data.setUint8 (c++, 0x65);
            data.setUint8 (c++, 0x72);
            data.setUint8 (c++, 0x00);

            // lineOrder
            data.setUint8 (c++, 0x6c);
            data.setUint8 (c++, 0x69);
            data.setUint8 (c++, 0x6e);
            data.setUint8 (c++, 0x65);
            data.setUint8 (c++, 0x4f);
            data.setUint8 (c++, 0x72);
            data.setUint8 (c++, 0x64);
            data.setUint8 (c++, 0x65);
            data.setUint8 (c++, 0x72);
            data.setUint8 (c++, 0x00);

            // size
            data.setUint8 (c++, 0x01);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);

            // value
            data.setUint8 (c++, 0x00);

        // PixelAspectRatio
            data.setUint8 (c++, 0x70);
            data.setUint8 (c++, 0x69);
            data.setUint8 (c++, 0x78);
            data.setUint8 (c++, 0x65);
            data.setUint8 (c++, 0x6c);
            data.setUint8 (c++, 0x41);
            data.setUint8 (c++, 0x73);
            data.setUint8 (c++, 0x70);
            data.setUint8 (c++, 0x65);
            data.setUint8 (c++, 0x63);
            data.setUint8 (c++, 0x74);
            data.setUint8 (c++, 0x52);
            data.setUint8 (c++, 0x61);
            data.setUint8 (c++, 0x74);
            data.setUint8 (c++, 0x69);
            data.setUint8 (c++, 0x6f);
            data.setUint8 (c++, 0x00);

            // float
            data.setUint8 (c++, 0x66);
            data.setUint8 (c++, 0x6c);
            data.setUint8 (c++, 0x6f);
            data.setUint8 (c++, 0x61);
            data.setUint8 (c++, 0x74);
            data.setUint8 (c++, 0x00);

            // size 4
            data.setUint8 (c++, 0x04);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);

            // value 1.0
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x80);
            data.setUint8 (c++, 0x3f);

        // screenWindowCenter
            data.setUint8 (c++, 0x73);
            data.setUint8 (c++, 0x63);
            data.setUint8 (c++, 0x72);
            data.setUint8 (c++, 0x65);
            data.setUint8 (c++, 0x65);
            data.setUint8 (c++, 0x6e);
            data.setUint8 (c++, 0x57);
            data.setUint8 (c++, 0x69);
            data.setUint8 (c++, 0x6e);
            data.setUint8 (c++, 0x64);
            data.setUint8 (c++, 0x6f);
            data.setUint8 (c++, 0x77);
            data.setUint8 (c++, 0x43);
            data.setUint8 (c++, 0x65);
            data.setUint8 (c++, 0x6e);
            data.setUint8 (c++, 0x74);
            data.setUint8 (c++, 0x65);
            data.setUint8 (c++, 0x72);
            data.setUint8 (c++, 0x00);

            // v2f
            data.setUint8 (c++, 0x76);
            data.setUint8 (c++, 0x32);
            data.setUint8 (c++, 0x66);
            data.setUint8 (c++, 0x00);

            // size 8
            data.setUint8 (c++, 0x08);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);

            // value 0 0
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);

            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);

        // screenWindowWidth
            data.setUint8 (c++, 0x73);
            data.setUint8 (c++, 0x63);
            data.setUint8 (c++, 0x72);
            data.setUint8 (c++, 0x65);
            data.setUint8 (c++, 0x65);
            data.setUint8 (c++, 0x6e);
            data.setUint8 (c++, 0x57);
            data.setUint8 (c++, 0x69);
            data.setUint8 (c++, 0x6e);
            data.setUint8 (c++, 0x64);
            data.setUint8 (c++, 0x6f);
            data.setUint8 (c++, 0x77);
            data.setUint8 (c++, 0x57);
            data.setUint8 (c++, 0x69);
            data.setUint8 (c++, 0x64);
            data.setUint8 (c++, 0x74);
            data.setUint8 (c++, 0x68);
            data.setUint8 (c++, 0x00);

            // float
            data.setUint8 (c++, 0x66);
            data.setUint8 (c++, 0x6c);
            data.setUint8 (c++, 0x6f);
            data.setUint8 (c++, 0x61);
            data.setUint8 (c++, 0x74);
            data.setUint8 (c++, 0x00);

            // size
            data.setUint8 (c++, 0x04);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);

            // value
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x00);
            data.setUint8 (c++, 0x80);
            data.setUint8 (c++, 0x3f);

        // End of header
        data.setUint8 (c++, 0x00);
    }

    // Scanline table
    var initc = c + height * 8;
    for (var scanline = 0 ; scanline < height ; scanline ++)
    {
        var jump = initc + scanline * (8 + width * bytesPerComponent * numComponents);
        data.setUint32 (c, jump, true);
        c += 4;

        data.setUint32 (c, 0x00, true);
        c += 4;
    }

    // Scanlines
    for (var scanline = 0 ; scanline < height ; scanline ++)
    {
        // Scanline
        data.setUint32(c, scanline, true);
        c += 4;

        // size 24
        var size = width * numComponents * bytesPerComponent;
        data.setUint32(c, size, true);
        c += 4;

        var numComponentsSource = 4; // number of components in the SOURCE image
        for (var component = 0; component < numComponents ; component ++)
        {
            for (var pixel = 0 ; pixel < width ; pixel ++)
            {
                // flip vertical, so we read OpenGL buffers without JS image flipping
                var v = bytes[(height-1-scanline) * width *numComponentsSource + pixel * numComponentsSource + (2-component)];
                if      (type=="Float") data.setFloat32(c, v, true);
                else if (type=="Half")  data.setUint16(c, v, true);

                c += bytesPerComponent;
            }
        }
    }

    return new Blob([buffer], {type: 'application/octet-stream'});
}


function piExportToWAV(numSamples, rate, bits, numChannels, words)
{
    let numBytes = numSamples * numChannels * bits/8;

    let buffer = new ArrayBuffer(44 + numBytes);
    let data = new DataView(buffer);

    {
        data.setUint32( 0, 0x46464952, true );  // RIFF
        data.setUint32( 4, numBytes + 36, true);
        {
            data.setUint32( 8, 0x45564157, true );  // WAV_WAVE
            data.setUint32( 12, 0x20746D66, true );  // WAV_FMT
            {
                data.setUint32( 16, 16, true);
                data.setUint16( 20, 1, true ); // WAV_FORMAT_PCM
                data.setUint16( 22, numChannels, true);
                data.setUint32( 24, rate, true);
                data.setUint32( 28, rate*numChannels*bits / 8, true);
                data.setUint16( 32, numChannels*bits / 8, true);
                data.setUint16( 34, bits, true);
            }

            data.setUint32( 36, 0x61746164, true);  // WAV_DATA
            {
                data.setUint32( 40, numBytes, true);
                let numWords = numSamples * numChannels;
                for(let i=0; i<numWords; i++ )
                {
                    data.setInt16( 44 + i*2, words[i], true );
                }
            }
        }
    }


    return new Blob([buffer], {type: 'application/octet-stream'});
}

function piTriggerDownload(name, blob)
{}
