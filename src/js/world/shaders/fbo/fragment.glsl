uniform sampler2D sourceTexture;
uniform sampler2D prevTexture;
uniform vec2 uAspect;
uniform float uTime; // 添加时间 uniform
uniform float uNoiseScale;
uniform float uTimeScale;
uniform float uDistortionScale;
uniform float uBlendFactor;
uniform float uColorIntensity; // 新增颜色强度控制

varying vec2 vUv;

#include utils.glsl

void main() {
    vec4 color = texture2D(sourceTexture, vUv);
    vec4 prevColor = texture2D(prevTexture, vUv);

    float timeScale = sin(uTime * 1.0) * 0.5 +1.5;
    float noise =fbm(vUv * uNoiseScale+ uTime * uTimeScale);
    // vec2 noiseVec2 = fbm(vUv * uNoiseScale + uTime * uTimeScale) * uAspect * uDistortionScale;
    vec2 noiseVec2 = noise * uAspect * uDistortionScale;

    vec4 leftMove = color + texture2D(prevTexture, vec2(vUv.x + noiseVec2.x, vUv.y)) * uBlendFactor;
    vec4 rightMove = color + texture2D(prevTexture, vec2(vUv.x - noiseVec2.x, vUv.y)) * uBlendFactor;
    vec4 upMove = color + texture2D(prevTexture, vec2(vUv.x, vUv.y + noiseVec2.y)) * uBlendFactor;
    vec4 downMove = color+ texture2D(prevTexture, vec2(vUv.x, vUv.y - noiseVec2.y)) * uBlendFactor;

    vec3 postprocessColor = blendLighter(color.rgb, leftMove.rgb);
    // 混合右移颜色
    postprocessColor = blendLighter(postprocessColor, rightMove.rgb);
    // 混合上移颜色
    postprocessColor = blendLighter(postprocessColor, upMove.rgb);
    // 混合下移颜色
    postprocessColor = blendLighter(postprocessColor, downMove.rgb);

    // 最终输出颜色
    gl_FragColor = vec4(postprocessColor, 1.0);
    // gl_FragColor = leftMove;
}
    // float angle = uTime * 0.002; // 控制旋转角度
    // mat2 rotation = mat2(
    //     cos(angle), -sin(angle),
    //     sin(angle), cos(angle)
    // );

    // // 创建螺旋状的扭曲效果
    // float spiral = length(vUv - 0.5) * 5.0;
    // vec2 spiralOffset = vec2(
    //     cos(spiral + uTime*0.02),
    //     sin(spiral + uTime*0.02)
    // ) * noiseVec2;
    //     // 添加旋转和螺旋扭曲
    // vec2 rotatedNoise = rotation * noiseVec2;
    // vec4 spiral1 = color + texture2D(prevTexture, vUv + rotatedNoise + spiralOffset) * uBlendFactor;
    // vec4 spiral2 = color + texture2D(prevTexture, vUv - rotatedNoise - spiralOffset * 0.5) * uBlendFactor;
    // vec4 spiral3 = color + texture2D(prevTexture, vUv + vec2(rotatedNoise.y, -rotatedNoise.x) + spiralOffset * 0.7) * uBlendFactor;
    // vec4 spiral4 = color + texture2D(prevTexture, vUv + vec2(-rotatedNoise.y, rotatedNoise.x) - spiralOffset * 0.3) * uBlendFactor;

    // vec3 postprocessColor = blendLighter(color.rgb, spiral1.rgb);
    // postprocessColor = blendLighter(postprocessColor, spiral2.rgb);
    // postprocessColor = blendLighter(postprocessColor, spiral3.rgb);
    // postprocessColor = blendLighter(postprocessColor, spiral4.rgb);