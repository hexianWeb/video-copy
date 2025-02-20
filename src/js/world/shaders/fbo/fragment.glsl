uniform sampler2D sourceTexture;
uniform sampler2D prevTexture;
varying vec2 vUv;

void main() {
    vec4 color = texture2D(sourceTexture, vUv);
    vec4 prevColor = texture2D(prevTexture, vUv);
    gl_FragColor = color + prevColor * 0.9;
}