// --- SCENE SETUP ---
const scene = new THREE.Scene();
// Dark grey fog for depth - crucial for the "void" look
scene.fog = new THREE.FogExp2(0x0a0a0a, 0.03); 
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
// Start camera slightly lower for a "human eye" view looking up at architecture
camera.position.set(0, 1, 15); 

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true; // Enable shadows for realism
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- ARCHITECTURAL GEOMETRY ---
// We will create a "Tunnel" of arches
const archWidth = 10;
const archHeight = 8;
const archDepth = 1;
const gap = 6; // Distance between arches
const totalArches = 15;

// Texture setup (Procedural concrete feel)
const geometry = new THREE.BoxGeometry(archWidth, archHeight, archDepth);

// Material: Matte concrete look
const material = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.9,
    metalness: 0.1,
});

// Create arches manually for better control over individual positions
const arches = [];
for (let i = 0; i < totalArches; i++) {
    // Left Pillar
    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(1, 8, 1), material);
    leftPillar.position.set(-4, 0, -i * gap);
    leftPillar.castShadow = true;
    leftPillar.receiveShadow = true;
    scene.add(leftPillar);
    arches.push(leftPillar);

    // Right Pillar
    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(1, 8, 1), material);
    rightPillar.position.set(4, 0, -i * gap);
    rightPillar.castShadow = true;
    rightPillar.receiveShadow = true;
    scene.add(rightPillar);
    arches.push(rightPillar);

    // Top Beam
    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(9, 1, 1), material);
    topBeam.position.set(0, 4, -i * gap);
    topBeam.castShadow = true;
    topBeam.receiveShadow = true;
    scene.add(topBeam);
    arches.push(topBeam);
}

// Floor (Reflective-ish)
const floorGeo = new THREE.PlaneGeometry(50, 200);
const floorMat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 0.4, // Slight reflection
    metalness: 0.5,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -4; // Align with bottom of pillars
floor.position.z = -50;
floor.receiveShadow = true;
scene.add(floor);

// --- LIGHTING ---
// 1. Ambient
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// 2. Dramatic Spotlight (The "Sun" or "Streetlight" entering the space)
const spotLight = new THREE.SpotLight(0xffffff, 10);
spotLight.position.set(10, 20, 10);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.5;
spotLight.castShadow = true;
scene.add(spotLight);

// 3. Blue/Cold Fill Light (Cinematic Contrast)
const fillLight = new THREE.PointLight(0x4455ff, 2, 50);
fillLight.position.set(-10, 5, 0);
scene.add(fillLight);

// --- ANIMATION & INTERACTION ---

// Mouse Parallax Logic
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

// GSAP Intro Sequence
function playIntro() {
    const tl = gsap.timeline();

    // 1. Camera "Dolly Zoom" Effect
    tl.from(camera.position, {
        z: 5, // Start close
        y: -2, // Start low
        duration: 3,
        ease: "power3.inOut"
    })
    
    // 2. Reveal Text
    .to('#hero-title', {
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power4.out"
    }, "-=1.5") // Overlap with camera move
    
    .to('.subtitle', {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out"
    }, "-=1");
}

// Main Render Loop
function animate() {
    requestAnimationFrame(animate);

    // Smooth Camera Parallax (The "Cinematic Handheld" feel)
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;

    // Apply rotation with damping
    camera.rotation.y += 0.05 * (-targetX - camera.rotation.y);
    camera.rotation.x += 0.05 * (-targetY - camera.rotation.x);

    // Subtle forward drift (breathing effect)
    const time = Date.now() * 0.0005;
    camera.position.z += Math.sin(time) * 0.002;

    renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start
playIntro();
animate();