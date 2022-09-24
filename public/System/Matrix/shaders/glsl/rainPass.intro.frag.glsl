precision highp float;

// This shader governs the "intro"— the initial stream of rain from a blank screen.
// It writes falling rain to the channels of a data texture:
// 		R: raindrop length
// 		G: unused
// 		B: unused
// 		A: unused

#define PI 3.14159265359
#define SQRT_2 1.4142135623730951
#define SQRT_5 2.23606797749979

uniform sampler2D previousIntroState;
uniform float numColumns, numRows;
uniform float time, tick;
uniform float animationSpeed, fallSpeed;

uniform bool skipIntro;

// Helper functions for generating randomness, borrowed from elsewhere

highp float randomFloat( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract(sin(sn) * c);
}

vec2 randomVec2( const in vec2 uv ) {
	return fract(vec2(sin(uv.x * 591.32 + uv.y * 154.077), cos(uv.x * 391.32 + uv.y * 49.077)));
}

float wobble(float x) {
	return x + 0.3 * sin(SQRT_2 * x) + 0.2 * sin(SQRT_5 * x);
}

// Main function

vec4 computeResult(float simTime, bool isFirstFrame, vec2 glyphPos, vec2 screenPos, vec4 previous) {
	if (skipIntro) {
		return vec4(1., 0., 0., 0.);
	}

	float columnTimeOffset;
	int column = int(glyphPos.x);
	if (column == int(numColumns / 2.)) {
		columnTimeOffset = -1.;
	} else if (column == int(numColumns * 0.75)) {
		columnTimeOffset = -2.;
	} else {
		columnTimeOffset = randomFloat(vec2(glyphPos.x, 0.)) * -4.;
		columnTimeOffset += (sin(glyphPos.x / numColumns * PI) - 1.) * 2. - 2.5;
	}
	float introTime = (simTime + columnTimeOffset) * fallSpeed / numRows * 100.;

	vec4 result = vec4(introTime, 0., 0., 0.);
	return result;
}

void main()	{
	float simTime = time * animationSpeed;
	bool isFirstFrame = tick <= 1.;
	vec2 glyphPos = gl_FragCoord.xy;
	vec2 screenPos = glyphPos / vec2(numColumns, numRows);
	vec4 previous = texture2D( previousIntroState, screenPos );
	gl_FragColor = computeResult(simTime, isFirstFrame, glyphPos, screenPos, previous);
}
