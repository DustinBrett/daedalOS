precision highp float;

// This shader is the star of the show.
// It writes falling rain to the channels of a data texture:
// 		R: raindrop brightness
// 		G: whether the cell is a "cursor"
// 		B: unused
// 		A: unused

// Listen.
// I understand if this shader looks confusing. Please don't be discouraged!
// It's just a handful of sine and fract functions. Try commenting parts out to learn
// how the different steps combine to produce the result. And feel free to reach out. -RM

#define PI 3.14159265359
#define SQRT_2 1.4142135623730951
#define SQRT_5 2.23606797749979

uniform sampler2D previousShineState;
uniform float numColumns, numRows;
uniform float time, tick;
uniform float animationSpeed, fallSpeed;

uniform bool loops;
uniform float brightnessDecay;
uniform float baseContrast, baseBrightness;
uniform float raindropLength, glyphHeightToWidth;

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

// This is the code rain's key underlying concept.
// It's why glyphs that share a column are lit simultaneously, and are brighter toward the bottom.
// It's also why those bright areas are truncated into raindrops.
float getRainBrightness(float simTime, vec2 glyphPos) {
	float columnTimeOffset = randomFloat(vec2(glyphPos.x, 0.)) * 1000.;
	float columnSpeedOffset = randomFloat(vec2(glyphPos.x + 0.1, 0.)) * 0.5 + 0.5;
	if (loops) {
		columnSpeedOffset = 0.5;
	}
	float columnTime = columnTimeOffset + simTime * fallSpeed * columnSpeedOffset;
	float rainTime = (glyphPos.y * 0.01 + columnTime) / raindropLength;
	if (!loops) {
		rainTime = wobble(rainTime);
	}
	return 1.0 - fract(rainTime);
}

// Main function

vec4 computeResult(float simTime, bool isFirstFrame, vec2 glyphPos, vec2 screenPos, vec4 previous) {
	float brightness = getRainBrightness(simTime, glyphPos);
	float brightnessBelow = getRainBrightness(simTime, glyphPos + vec2(0., -1.));
	float cursor = brightness > brightnessBelow ? 1.0 : 0.0;

	// Blend the glyph's brightness with its previous brightness, so it winks on and off organically
	if (!isFirstFrame) {
		float previousBrightness = previous.r;
		brightness = mix(previousBrightness, brightness, brightnessDecay);
	}

	vec4 result = vec4(brightness, cursor, 0.0, 0.0);
	return result;
}

void main()	{
	float simTime = time * animationSpeed;
	bool isFirstFrame = tick <= 1.;
	vec2 glyphPos = gl_FragCoord.xy;
	vec2 screenPos = glyphPos / vec2(numColumns, numRows);
	vec4 previous = texture2D( previousShineState, screenPos );
	gl_FragColor = computeResult(simTime, isFirstFrame, glyphPos, screenPos, previous);
}
