precision highp float;

uniform sampler2D tDiffuse1;
uniform sampler2D tDiffuse2;
uniform sampler2D tMask;
varying vec2 vUv;

void main() {
  vec4 mask = texture2D(tMask, vUv);
  vec4 tex1 = texture2D(tDiffuse1, vUv);
  vec4 tex2 = texture2D(tDiffuse2, vUv);

  // 使用mask的alpha通道作为混合因子
  float mixFactor = mask.r;
  vec4 finalColor = mix(vec4(0.86), tex1, mixFactor);

  gl_FragColor = mask;
}