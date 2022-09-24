precision highp float;

// This shader governs the glyphs appearing in the rain.
// It writes each glyph's state to the channels of a data texture:
// 		R: symbol
// 		G: age
// 		B: unused
// 		A: unused

#define PI 3.14159265359

uniform sampler2D previousSymbolState, raindropState;
uniform float numColumns, numRows;
uniform float time, tick, cycleFrameSkip;
uniform float animationSpeed, cycleSpeed;
uniform bool loops, showDebugView;
uniform float glyphSequenceLength;

// Helper functions for generating randomness, borrowed from elsewhere

highp float randomFloat( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract(sin(sn) * c);
}

// Main function

vec4 computeResult(float simTime, bool isFirstFrame, vec2 glyphPos, vec2 screenPos, vec4 previous, vec4 raindrop) {

	float previousSymbol = previous.r;
	float previousAge = previous.g;
	bool resetGlyph = isFirstFrame;
	if (loops) {
		resetGlyph = resetGlyph || raindrop.r <= 0.;
	}
	if (resetGlyph) {
		previousAge = randomFloat(screenPos + 0.5);
		previousSymbol = floor(glyphSequenceLength * randomFloat(screenPos));
	}
	float cycleSpeed = animationSpeed * cycleSpeed;
	float age = previousAge;
	float symbol = previousSymbol;
	if (mod(tick, cycleFrameSkip) == 0.) {
		age += cycleSpeed * cycleFrameSkip;
		if (age >= 1.) {
			symbol = floor(glyphSequenceLength * randomFloat(screenPos + simTime));
			age = fract(age);
		}
	}

	vec4 result = vec4(symbol, age, 0., 0.);
	return result;
}

void main()	{
	float simTime = time * animationSpeed;
	bool isFirstFrame = tick <= 1.;
	vec2 glyphPos = gl_FragCoord.xy;
	vec2 screenPos = glyphPos / vec2(numColumns, numRows);
	vec4 previous = texture2D( previousSymbolState, screenPos );
	vec4 raindrop = texture2D( raindropState, screenPos );
	gl_FragColor = computeResult(simTime, isFirstFrame, glyphPos, screenPos, previous, raindrop);
}
