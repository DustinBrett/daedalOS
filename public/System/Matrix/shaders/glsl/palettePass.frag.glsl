precision mediump float;
#define PI 3.14159265359

uniform sampler2D tex;
uniform sampler2D bloomTex;
uniform sampler2D palette;
uniform float bloomStrength;
uniform float ditherMagnitude;
uniform float time;
uniform vec3 backgroundColor, cursorColor, glintColor;
varying vec2 vUV;

highp float rand( const in vec2 uv, const in float t ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract(sin(sn) * c + t);
}

vec4 getBrightness(vec2 uv) {
	vec4 primary = texture2D(tex, uv);
	vec4 bloom = texture2D(bloomTex, uv) * bloomStrength;
	return min((primary + bloom) * (2.0 - bloomStrength), 1.0);
}

void main() {
	vec4 brightness = getBrightness(vUV);

	// Dither: subtract a random value from the brightness
	brightness -= rand( gl_FragCoord.xy, time ) * ditherMagnitude / 3.0;

	// Map the brightness to a position in the palette texture
	gl_FragColor = vec4(
		texture2D( palette, vec2(brightness.r, 0.0)).rgb
			+ min(cursorColor * brightness.g, vec3(1.0))
			+ min(glintColor * brightness.b, vec3(1.0))
			+ backgroundColor,
		1.0
	);
}
