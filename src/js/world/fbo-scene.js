/* eslint-disable unicorn/no-null */
import * as THREE from 'three';

import Experience from '../experience';
import fragmentShader from './shaders/fbo/fragment.glsl';
import vertexShader from './shaders/fbo/vertex.glsl';

export default class FBOScene {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;

    // 创建独立场景
    this.scene = new THREE.Scene();

    // 创建正交相机
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.z = 1;

    // 创建平面几何体
    this.geometry = new THREE.PlaneGeometry(2, 2);

    // 创建着色器材质
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        sourceTexture: { value: null },
        prevTexture: { value: null },
        uAspect: { value: new THREE.Vector2(1, 1 / this.sizes.aspect) }
      }
    });

    // 创建网格
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }
  // 统一更新纹理的方法
  updateTextures(sourceTexture, previousTexture) {
    this.material.uniforms.sourceTexture.value = sourceTexture;
    this.material.uniforms.prevTexture.value = previousTexture;
  }
  // 渲染场景
  render(renderer, target) {
    renderer.setRenderTarget(target);
    renderer.render(this.scene, this.camera);
  }
}
