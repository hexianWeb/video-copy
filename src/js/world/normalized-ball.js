/* eslint-disable unicorn/no-null */
import * as THREE from 'three';

import Experience from '../experience.js';
import FBOScene from './fbo-scene.js';

export default class normalizedBall {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.iMouse = this.experience.iMouse;
    this.resources = this.experience.resources;
    this.camera = this.experience.camera.instance;
    this.sizes = this.experience.sizes;
    this.renderer = this.experience.renderer.instance;

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.setupPipeline();
  }

  setGeometry() {
    this.geometry = new THREE.SphereGeometry(0.22, 32, 32);
  }

  setMaterial() {
    this.material = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      wireframe: false
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
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
    this.finalMaterial = new THREE.MeshBasicMaterial({
      map: this.sourceTarget.texture
    });
    this.finalMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2 * this.sizes.aspect, 2, 1, 1),
      this.finalMaterial
    );
    this.finalScene.add(this.finalMesh);
  }

  update() {
    this.updatePosition();
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

      // 渲染最终场景
      this.finalMesh.material.map = this.renderTargets[0].texture;
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.finalScene, this.camera);

      // 交换渲染目标
      const temporary = this.renderTargets[0];
      this.renderTargets[0] = this.renderTargets[1];
      this.renderTargets[1] = temporary;
    }
  }

  // 更新小球位置
  updatePosition() {
    const mouseX = this.iMouse.normalizedMouse.x * this.sizes.aspect;
    const mouseY = this.iMouse.normalizedMouse.y * 1;

    this.mesh.position.x = mouseX;
    this.mesh.position.y = mouseY;
  }
}
