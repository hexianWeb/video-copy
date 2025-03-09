/* eslint-disable unicorn/no-null */
import * as THREE from 'three';

import Experience from '../experience.js';
import FBOScene from './fbo-scene.js';
import fragmentShader from './shaders/transition/transition.frag';
import vertexShader from './shaders/transition/transition.vert';

export default class TransitionRenderer {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.camera = this.experience.camera.instance;
    this.sizes = this.experience.sizes;
    this.renderer = this.experience.renderer.instance;
    this.time = this.experience.time;

    this.setupPipeline();
  }

  // 设置 FBO 渲染管道
  setupPipeline() {
    this.sourceTarget = new THREE.WebGLRenderTarget(
      this.sizes.width,
      this.sizes.height,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        colorSpace: THREE.SRGBColorSpace
      }
    );
    // 创建 PING PONG 所需的两个渲染目标
    this.renderTargets = [this.sourceTarget.clone(), this.sourceTarget.clone()];
    // 创建FBO场景
    this.fboScene = new FBOScene();
    // 创建最终场景
    this.finalScene = new THREE.Scene();
    // 创建自定义着色器材质
    this.finalMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse1: { value: null },
        tDiffuse2: { value: this.resources.items['bg'] },
        tMask: { value: this.sourceTarget.texture },
        uAspect: { value: this.sizes.aspect },
        uTime: { value: 0 }
      },
      vertexShader,
      fragmentShader
    });
    this.finalMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2 * this.sizes.aspect, 2, 1, 1),
      this.finalMaterial
    );
    this.finalScene.add(this.finalMesh);
  }

  update() {
    // 更新时间uniform
    this.finalMaterial.uniforms.uTime.value = this.time.elapsed * 0.01; // 转换为秒

    if (this.fboScene) {
      // 用于叠图的素材
      this.renderer.setRenderTarget(this.sourceTarget);
      this.renderer.render(this.experience.scene, this.camera);
      // 渲染FBO场景
      this.fboScene.render(this.renderer, this.renderTargets[0]);
      this.fboScene.updateTextures(
        this.sourceTarget.texture,
        this.renderTargets[0].texture
      );
      // 更新遮罩纹理
      this.finalMaterial.uniforms.tMask.value = this.renderTargets[0].texture;
      // 渲染最终场景
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.finalScene, this.camera);
      // 交换渲染目标
      const temporary = this.renderTargets[0];
      this.renderTargets[0] = this.renderTargets[1];
      this.renderTargets[1] = temporary;
    }
  }
}
