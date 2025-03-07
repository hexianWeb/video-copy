/* eslint-disable unicorn/no-null */
import * as THREE from 'three';

import Experience from '../experience.js';
import FBOScene from './fbo-scene.js';
import fragmentShader from './shaders/transition.frag';
import vertexShader from './shaders/transition.vert';

export default class normalizedBall {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.iMouse = this.experience.iMouse;
    this.resources = this.experience.resources;
    this.camera = this.experience.camera.instance;
    this.sizes = this.experience.sizes;
    this.renderer = this.experience.renderer.instance;
    this.time = this.experience.time; // 使用框架自带的时间

    this.originalScale = 0.4; // Original radius from setGeometry
    this.targetScale = this.originalScale;
    this.currentScale = this.originalScale;
    this.scaleSpeed = 0.1; // Adjust this value to control transition speed

    // 添加位置相关的属性
    this.targetPosition = new THREE.Vector2(0, 0);
    this.currentPosition = new THREE.Vector2(0, 0);
    this.positionLerpSpeed = 0.5; // 可以调整这个值来控制位置过渡的速度

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.setupPipeline();
  }

  setGeometry() {
    this.geometry = new THREE.SphereGeometry(this.originalScale, 32, 32);
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

    // 创建自定义着色器材质
    this.finalMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse1: { value: this.resources.items.bg },
        tDiffuse2: { value: this.resources.items.bg2 },
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
    // 使用 experience.time.elapsed 代替 clock
    this.finalMaterial.uniforms.uTime.value = this.time.elapsed * 0.01; // 转换为秒

    this.updatePosition();
    this.updateScale();

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

  updateScale() {
    // Set target scale based on mouse movement
    this.targetScale = this.iMouse.isMouseMoving
      ? this.originalScale / 2
      : this.originalScale;

    // Smoothly interpolate current scale
    this.currentScale +=
      (this.targetScale - this.currentScale) * this.scaleSpeed;

    // Update mesh scale
    this.mesh.scale.set(
      this.currentScale / this.originalScale,
      this.currentScale / this.originalScale,
      this.currentScale / this.originalScale
    );
  }
  // 更新小球位置
  updatePosition() {
    // 更新目标位置
    this.targetPosition.x = this.iMouse.normalizedMouse.x * this.sizes.aspect;
    this.targetPosition.y = this.iMouse.normalizedMouse.y * 1;

    // 使用 lerp 平滑过渡到目标位置
    this.currentPosition.lerp(this.targetPosition, this.positionLerpSpeed);

    // 更新mesh位置
    this.mesh.position.x = this.currentPosition.x;
    this.mesh.position.y = this.currentPosition.y;
  }
}
