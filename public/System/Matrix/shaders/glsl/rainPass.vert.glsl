#define PI 3.14159265359
precision lowp float;
attribute vec2 aPosition, aCorner;
uniform sampler2D raindropState, symbolState, effectState;
uniform float density;
uniform vec2 quadSize;
uniform float glyphHeightToWidth, glyphVerticalSpacing;
uniform mat4 camera, transform;
uniform vec2 screenSize;
uniform float time, animationSpeed, forwardSpeed;
uniform bool volumetric;
varying vec2 vUV;
varying vec4 vRaindrop, vSymbol, vEffect;
varying float vDepth;

highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract(sin(sn) * c);
}

void main() {

	vUV = (aPosition + aCorner) * quadSize;
	vRaindrop = texture2D(raindropState, aPosition * quadSize);
	vSymbol   = texture2D(  symbolState, aPosition * quadSize);
	vEffect   = texture2D(  effectState, aPosition * quadSize);

	// Calculate the world space position
	float quadDepth = 0.0;
	if (volumetric) {
		float startDepth = rand(vec2(aPosition.x, 0.));
		quadDepth = fract(startDepth + time * animationSpeed * forwardSpeed);
		vDepth = quadDepth;
	}
	vec2 position = (aPosition * vec2(1., glyphVerticalSpacing) + aCorner * vec2(density, 1.)) * quadSize;
	vec4 pos = vec4((position - 0.5) * 2.0, quadDepth, 1.0);

	// Convert the world space position to screen space
	if (volumetric) {
		pos.x /= glyphHeightToWidth;
		pos = camera * transform * pos;
	} else {
		pos.xy *= screenSize;
	}

	gl_Position = pos;
}
