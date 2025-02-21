/* eslint-disable unicorn/no-null */
import * as THREE from 'three';

import Experience from '../experience';
import fragmentShader from './shaders/fbo/fragment.glsl';
import vertexShader from './shaders/fbo/vertex.glsl';

export default class FBOScene {
  constructor() {
    this.experience = new Experience();
    this.sizes = this.experience.sizes;
    this.elapsed = this.experience.time.elapsed;
    this.debug = this.experience.debug.ui;
    this.debugActive = this.experience.debug.active; // 添加这行

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
        uAspect: { value: new THREE.Vector2(1, this.sizes.aspect) },
        uTime: { value: 0 },
        uNoiseScale: { value: 52 }, // 新增：噪声缩放
        uTimeScale: { value: 0.1 }, // 新增：时间缩放
        uDistortionScale: { value: 0.003 }, // 新增：扭曲强度
        uBlendFactor: { value: 0.95 }, // 新增：混合系数
        uColorIntensity: { value: 0.99 },
        // ... 其他 uniforms ...
        uRotationSpeed: { value: 0.2 },
        uSpiralIntensity: { value: 5 } // 新增颜色强度控制，默认值设为之前硬编码的 0.99
      }
    });

    // 创建网格
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    this.debuggerInit(); // 添加这行
  }

  // 统一更新纹理的方法
  updateTextures(sourceTexture, previousTexture) {
    this.material.uniforms.sourceTexture.value = sourceTexture;
    this.material.uniforms.prevTexture.value = previousTexture;
    this.update();
  }

  // 更新时间uniform
  update() {
    this.material.uniforms.uTime.value = this.experience.time.elapsed * 0.05;
  }

  // 渲染场景
  render(renderer, target) {
    renderer.setRenderTarget(target);
    renderer.render(this.scene, this.camera);
  }

  // 添加调试面板初始化方法
  debuggerInit() {
    if (this.debugActive) {
      const f1 = this.debug.addFolder({
        title: 'FBO Effects'
      });

      // 噪声缩放控制
      f1.addBinding(this.material.uniforms.uNoiseScale, 'value', {
        label: 'Noise Scale 噪声复杂程度',
        min: 1,
        max: 100,
        step: 1
      });

      // 时间缩放控制
      f1.addBinding(this.material.uniforms.uTimeScale, 'value', {
        label: 'Time Scale',
        min: 0.01,
        max: 3,
        step: 0.01
      });

      // 扭曲强度控制
      f1.addBinding(this.material.uniforms.uDistortionScale, 'value', {
        label: 'Distortion Scale',
        min: 0,
        max: 0.02,
        step: 0.001
      });

      // 混合系数控制
      f1.addBinding(this.material.uniforms.uBlendFactor, 'value', {
        label: 'Blend Factor',
        min: 0.9,
        max: 0.99,
        step: 0.01
      });
      f1.addBinding(this.material.uniforms.uColorIntensity, 'value', {
        label: 'Color Intensity',
        min: 0,
        max: 1,
        step: 0.01
      });
    }
  }
}
