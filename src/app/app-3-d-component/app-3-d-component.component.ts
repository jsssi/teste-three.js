import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import * as THREE from 'three';

import { AnimationMixer } from 'three';
import { GLTFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';


@Component({
  selector: 'app-model-viewer',
  standalone: true,
  templateUrl: './app-3-d-component.component.html',
  styleUrls: ['./app-3-d-component.component.scss']
})
export class ModelViewerComponent implements OnInit, OnDestroy {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model!: THREE.Object3D;
  private mixer!: AnimationMixer;
  private animationFrameId: number | undefined;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private targetZoomPosition = new THREE.Vector3();
  private zoomSpeed = 0.1; // Velocidade do zoom
  private zoomDistance = 3; // Distância do zoom final
  private zooming = false;
  private newCameraPosition = new THREE.Vector3(); // Adiciona esta variável para armazenar a nova posição da câmera
  private controls!: OrbitControls;

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.initThree();
    this.loadModel();
    this.animate();
    this.setupEventListeners()
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

  }

  private initThree(): void {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(5, 5, 10);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const container = this.elementRef.nativeElement.querySelector('.model-container');
    if (container) {
      container.appendChild(this.renderer.domElement);
    } else {
      console.error('Container element not found');
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    this.scene.add(directionalLight);

    // Initialize OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.25;
    this.controls.enableZoom = true;

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
    });
  }

  private loadModel(): void {
    const loader = new GLTFLoader();
    loader.load('../../assets/human_skeleton-v1.glb', (gltf) => {
      this.model = gltf.scene;
      this.scene.add(this.model);

      // Configura o AnimationMixer se houver animações
      this.mixer = new AnimationMixer(this.model);
      gltf.animations.forEach((clip) => {
        this.mixer.clipAction(clip).play();
      });

      const box = new THREE.Box3().setFromObject(this.model);
      const size = box.getSize(new THREE.Vector3());
      const desiredSize = 12;
      const scale = desiredSize / Math.max(size.x, size.y, size.z);
      this.model.scale.set(scale, scale, scale);

      this.model.position.set(0, 0, 0);
    }, undefined, (error) => {
      console.error('An error occurred while loading the model:', error);
    });
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    if (this.mixer) {
      this.mixer.update(0.01);
    }

    if (this.zooming) {
      this.zoomCamera();
    }

    // Update the controls on each frame
    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }

  private setupEventListeners(): void {
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('click', this.onMouseClick.bind(this));
  }

  private onMouseMove(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  }

  private onMouseClick(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      this.targetZoomPosition.copy(point);

      // Calcula a nova posição da câmera para o zoom
      const direction = new THREE.Vector3().subVectors(this.camera.position, this.targetZoomPosition).normalize();
      this.newCameraPosition.copy(this.targetZoomPosition).add(direction.multiplyScalar(this.zoomDistance));

      this.zooming = true;
    }
  }

  private zoomCamera(): void {
    if (!this.zooming) return;

    // Interpola a posição da câmera em direção ao ponto de zoom
    const distanceToTarget = this.camera.position.distanceTo(this.newCameraPosition);
    if (distanceToTarget < this.zoomSpeed) {
      this.camera.position.copy(this.newCameraPosition);
      this.zooming = false;
      return;
    }

    // Move a câmera suavemente em direção ao ponto de zoom
    const direction = new THREE.Vector3().subVectors(this.newCameraPosition, this.camera.position).normalize();
    this.camera.position.add(direction.multiplyScalar(this.zoomSpeed));
  }
}
