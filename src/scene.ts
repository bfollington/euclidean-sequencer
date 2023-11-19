import * as THREE from "three";
import { addListener } from "./sequencer";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
new OrbitControls(camera, renderer.domElement);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

// Bounding sphere
// const boundingSphere = new THREE.Mesh(
//   new THREE.SphereGeometry(5, 32, 32),
//   new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
// );
// scene.add(boundingSphere);

camera.position.z = 10;

const colors = [
  "#355070",
  "#6d597a",
  "#b56576",
  "#e56b6f",
  "#eaac8b",
  "#355070",
  "#6d597a",
  "#b56576",
  "#e56b6f",
  "#eaac8b",
];
const pentatonicScale = ["C4", "Eb4", "F4", "G4", "Bb4"];
const pentatonicScaleOct = ["C5", "Eb5", "F5", "G5", "Bb5"];
const notes = [...pentatonicScale, ...pentatonicScaleOct]; // Example notes
let orbs: { [note: string]: NoteOrb } = {};
const initialVelocity = 0.05; // Adjust as needed
const sphereRadius = 5;

class NoteOrb {
  note: string;
  velocity: THREE.Vector3;
  cube: THREE.Mesh;
  constructor(note: string, velocity: THREE.Vector3, mesh: THREE.Mesh) {
    this.note = note;
    this.velocity = velocity;
    this.cube = mesh;
  }
}

// Create cubes for each note
notes.forEach((note, index) => {
  const geometry = new THREE.SphereGeometry(0.2);
  const material = new THREE.MeshPhysicalMaterial({ color: colors[index] });
  material.specularIntensity = 0.5;
  const mesh = new THREE.Mesh(geometry, material);
  let orb = new NoteOrb(note, new THREE.Vector3(0, 0, 0), mesh);

  // Random initial position inside the sphere
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI;
  mesh.position.x = (sphereRadius / 2) * Math.sin(phi) * Math.cos(theta);
  mesh.position.y = (sphereRadius / 2) * Math.sin(phi) * Math.sin(theta);
  mesh.position.z = (sphereRadius / 2) * Math.cos(phi);

  // Random initial velocity
  orb.velocity = new THREE.Vector3(
    (Math.random() - 0.5) * initialVelocity,
    (Math.random() - 0.5) * initialVelocity,
    (Math.random() - 0.5) * initialVelocity
  );

  orbs[note] = orb;
  console.log(orb);
  scene.add(mesh);
});

function animate() {
  requestAnimationFrame(animate);

  // for (const orb in orbs) {
  //   const idx = notes.indexOf(note);
  //   orbs[orb].position.x = Math.sin(idx) * 2;
  //   orbs[orb].position.y = Math.cos(idx) * 2;
  // }

  // Update cube fading logic here if needed

  Object.values(orbs).forEach((orb) => {
    // Update position
    orb.cube.position.add(orb.velocity);
    orb.velocity.multiplyScalar(0.995); // Apply friction

    // Check for collision with the bounding sphere
    if (orb.cube.position.length() > sphereRadius) {
      orb.cube.position.normalize().multiplyScalar(sphereRadius);
      orb.velocity.negate(); // Invert velocity on collision
    }
  });

  renderer.render(scene, camera);
}
animate();

addListener((note, velocity) => {
  // Check if there's a cube for the note
  const orb = orbs[note];
  if (orb) {
    // Set the emissive color based on velocity
    const mat = orb.cube.material as THREE.MeshStandardMaterial;
    mat.emissive.setHex(0xffffff);
    mat.emissiveIntensity = velocity;

    // Apply acceleration based on velocity
    const acceleration = velocity * 0.5; // Adjust multiplier as needed
    orb.velocity.add(
      new THREE.Vector3(
        (Math.random() - 0.5) * acceleration,
        (Math.random() - 0.5) * acceleration,
        (Math.random() - 0.5) * acceleration
      )
    );

    // Fade out the emissive color
    // (You might need to implement a more complex fading logic in your animation loop)
    setTimeout(() => mat.emissive.setHex(0x000000), 500);
  }
});
