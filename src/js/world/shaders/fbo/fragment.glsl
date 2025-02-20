uniform sampler2D sourceTexture;
uniform sampler2D prevTexture;
uniform vec2 uAspect;

varying vec2 vUv;

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9595,78.233)))*
        43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 4

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

float blendLighter(float base, float blend) {
    return max(blend,base);
}

vec3 blendLighter(vec3 base, vec3 blend ) {
 return vec3( blendLighter(base.r,blend.r), blendLighter(base.g,blend.g),blendLighter(base.b,blend.b) );
}

vec3 blendLighter(vec3 base, vec3 blend, float opacity ) {
 return (blendLighter( base,  blend )*opacity + base*(1.0-opacity));
}

void main() {
    vec4 color = texture2D(sourceTexture, vUv);
    vec4 prevColor = texture2D(prevTexture, vUv);

    vec2 aspect = vec2(uAspect.x,uAspect.y*1.0);
    vec2 noiseVec2 = fbm(vUv * 52.0)*uAspect*0.005;

    vec4 leftMove =color + texture2D(prevTexture,vec2(vUv.x + noiseVec2.x ,vUv.y))*0.97;
    vec4 rightMove =color + texture2D(prevTexture,vec2(vUv.x - noiseVec2.x,vUv.y))*0.97;
    vec4 upMove = color + texture2D(prevTexture,vec2(vUv.x,vUv.y + noiseVec2.y))*0.97;
    vec4 downMove = color + texture2D(prevTexture,vec2(vUv.x,vUv.y - noiseVec2.y))*0.97;

    vec3 postprocessColor = blendLighter(color.rgb, leftMove.rgb);
    // 混合右移颜色
    postprocessColor = blendLighter(postprocessColor, rightMove.rgb);
    // 混合上移颜色
    postprocessColor = blendLighter(postprocessColor, upMove.rgb);
    // 混合下移颜色
    postprocessColor = blendLighter(postprocessColor, downMove.rgb);

    // 最终输出颜色
    vec4 processColor = vec4(postprocessColor, 1.0);
    gl_FragColor = processColor;
}