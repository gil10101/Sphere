import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Canvas setup
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#151414');
scene.fog = new THREE.FogExp2('#151414', 0.15);

// Performance check
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Create sphere
const sphereGeometry = new THREE.SphereGeometry(1, isMobile ? 24 : 48, isMobile ? 24 : 48);
const sphereMaterial = new THREE.PointsMaterial({
    size: isMobile ? 0.004 : 0.003,
    sizeAttenuation: true,
    color: new THREE.Color('#ffffff'),
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
});

const sphere = new THREE.Points(sphereGeometry, sphereMaterial);
scene.add(sphere);

// Create star field
function createStarField(count, size, spread) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * spread;
        positions[i + 1] = (Math.random() - 0.5) * spread;
        positions[i + 2] = (Math.random() - 0.5) * spread;

        const intensity = 0.7 + Math.random() * 0.3;
        colors[i] = intensity;
        colors[i + 1] = intensity;
        colors[i + 2] = intensity + Math.random() * 0.2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return new THREE.Points(geometry, new THREE.PointsMaterial({
        size,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false
    }));
}

const starLayers = [
    createStarField(700, 0.015, 12),
    createStarField(1200, 0.012, 20),
    createStarField(2000, 0.008, 35)
].forEach(stars => scene.add(stars));

// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 4);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 10;
controls.minDistance = 2;
controls.enablePan = false;
controls.rotateSpeed = 0.5;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Mouse interaction
const mouse = { x: 0, y: 0 };
let targetRotationX = 0;
let targetRotationY = 0;

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) - 0.5;
    mouse.y = (event.clientY / window.innerHeight) - 0.5;
    targetRotationX = mouse.y * 0.5;
    targetRotationY = mouse.x * 0.5;
}, { passive: true });

// Animation
const clock = new THREE.Clock();
let previousTime = 0;

function animate() {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    sphere.rotation.y += deltaTime * 0.1;
    sphere.rotation.x += (targetRotationX - sphere.rotation.x) * 0.05;
    sphere.rotation.y += (targetRotationY - sphere.rotation.y) * 0.05;

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}, { passive: true }); 