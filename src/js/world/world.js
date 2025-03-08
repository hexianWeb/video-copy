import * as THREE from 'three';

import Experience from '../experience.js';
import Environment from './environment.js';
import NormalizedBall from './normalized-ball.js';
import TransitionRenderer from './transition-renderer.js';

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Environment
    this.resources.on('ready', () => {
      // Setup
      this.environment = new Environment();
      // 归一化小球
      this.normalizedBall = new NormalizedBall();
      // 过渡渲染器
      this.transitionRenderer = new TransitionRenderer();
    });
  }

  update() {
    if (this.normalizedBall) {
      this.normalizedBall.update();
    }

    if (this.transitionRenderer) {
      this.transitionRenderer.update();
    }
  }
}
