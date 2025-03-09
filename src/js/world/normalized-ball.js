/* eslint-disable unicorn/no-null */

import * as THREE from 'three';
import * as YUKA from 'yuka'; // 导入Yuka库

import Experience from '../experience.js';

export default class NormalizedBall {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.iMouse = this.experience.iMouse;
    this.sizes = this.experience.sizes;
    this.time = this.experience.time;
    this.resources = this.experience.resources;

    this.setGeometry();
    this.setMaterial();
    this.setMesh();

    // Yuka相关设置
    this.entityManager = new YUKA.EntityManager();
    this.setupYukaVehicle(); // 设置Yuka Vehicle
  }

  setGeometry() {
    this.geometry = new THREE.SphereGeometry(0.35, 32, 32);
  }

  setMaterial() {
    this.material = new THREE.MeshBasicMaterial({
      color: '#fff'
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  // 设置Yuka Vehicle
  setupYukaVehicle() {
    // 创建Vehicle
    this.vehicle = new YUKA.Vehicle();
    // 设置boundingRaidus
    this.vehicle.boundingRadius = this.originalScale;
    // 设置初始位置
    this.vehicle.position.set(0, -2, 0);
    // 设置最大速度和加速度
    this.vehicle.maxSpeed = 1.5;
    this.vehicle.maxForce = 1.5;

    // 添加到达行为
    this.arriveBehavior = new YUKA.ArriveBehavior(
      new YUKA.Vector3(0, 0, 0),
      0.1
    );
    // 添加徘徊行为
    this.wanderBehavior = new YUKA.WanderBehavior();
    this.wanderBehavior.weight = 1;

    // 需要先计算障碍物的边界盒
    this.obstacleBehavior = new YUKA.ObstacleAvoidanceBehavior(
      this.obstacleGroup
    );
    this.obstacleBehavior.weight = 2;

    // 添加所有行为
    this.vehicle.steering.add(this.arriveBehavior);
    this.vehicle.steering.add(this.wanderBehavior);
    this.vehicle.steering.add(this.obstacleBehavior);

    // 将Vehicle添加到EntityManager
    this.entityManager.add(this.vehicle);

    // 同步Three.js对象和Yuka实体
    this.vehicle.setRenderComponent(this.mesh, this.sync);
  }

  // 同步Three.js对象和Yuka实体的函数
  sync(entity, renderComponent) {
    renderComponent.position.copy(entity.position);
    renderComponent.quaternion.copy(entity.rotation);
  }

  update() {
    // 根据鼠标状态切换行为权重
    if (this.iMouse.isMouseInWindow) {
      this.arriveBehavior.weight = 1;
      this.wanderBehavior.weight = 0;

      // 更新目标位置为鼠标位置
      this.arriveBehavior.target.set(
        this.iMouse.normalizedMouse.x * this.sizes.aspect,
        this.iMouse.normalizedMouse.y,
        0
      );
    } else {
      this.arriveBehavior.weight = 0;
      this.wanderBehavior.weight = 1;
    }

    // 更新Yuka
    const delta = this.time.delta * 0.001; // 转换为秒
    this.entityManager.update(delta);
  }
}
