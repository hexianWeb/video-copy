precision highp float;
uniform float uTime;
// uniform sampler2D tDiffuse1;
// uniform sampler2D tDiffuse2;
uniform sampler2D tMask;
varying vec2 vUv;

vec3 hsl2rgb(float h, float s, float l) {
  float c = (1.0 - abs(2.0 * l - 1.0)) * s;
  float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
  float m = l - c / 2.0;

  vec3 rgb;

  if (h < 1.0 / 6.0) {
    rgb = vec3(c, x, 0.0);
  } else if (h < 2.0 / 6.0) {
    rgb = vec3(x, c, 0.0);
  } else if (h < 3.0 / 6.0) {
    rgb = vec3(0.0, c, x);
  } else if (h < 4.0 / 6.0) {
    rgb = vec3(0.0, x, c);
  } else if (h < 5.0 / 6.0) {
    rgb = vec3(x, 0.0, c);
  } else {
    rgb = vec3(c, 0.0, x);
  }

  return rgb + m;
}

// 将颜色限制在图片的主色系范围内
vec3 getPinkThemeColor(float t) {
  // 基础粉色hsl(340, 100.00%, 62.00%) (约等于HSL中的343°, 100%, 62%)
  // 红色点缀hsl(340, 96.00%, 49.00%) (约等于HSL中的348°, 95%, 49%)
  // 将时间映射到0-1之间的值，减慢变化速度
  float cyclicTime = fract(t*0.1);
  // 在深粉色(343°/360 ≈ 0.95)和红色(348°/360 ≈ 0.97)之间变化
  float hue = mix(0.93, 0.97, sin(cyclicTime * 3.14) * 0.5 + 0.5);
  // 饱和度保持很高，在85%-100%之间变化
  float saturation = mix(0.65, 1.0, sin(cyclicTime * 2.5) * 0.5 + 0.5);
  // 亮度在35%-50%之间变化，使颜色更深沉
  float lightness = mix(0.4, 0.6, sin(cyclicTime * 4.2) * 0.5 + 0.5);
  return hsl2rgb(hue, saturation, lightness);
}

void main() {
  vec4 mask = texture2D(tMask, vUv);

  // 使用mask的alpha通道作为混合因子
  float mixFactor = mask.r;
  // 使用新的函数获取粉色主题的颜色
  vec3 themeColor = getPinkThemeColor(0.1 * uTime);
  vec4 finalColor = mix(vec4(1.0), vec4(themeColor,1.0), mixFactor);

  gl_FragColor = finalColor;
}