import * as THREE from "three";
import { addListener } from "./sequencer";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass.js";
import { RenderPixelatedPass } from "three/examples/jsm/postprocessing/RenderPixelatedPass.js";
import { addParticles, updateParticles } from "./particles";
import { updateCamera } from "./camera";

class CylinderCreature {
  positions: THREE.Vector3[];
  segmentCount: number;
  target: THREE.Object3D;
  segmentRadius: number;
  segmentLength: number;
  mesh: THREE.Mesh;
  frequency: number = 0;

  constructor(
    group: THREE.Group,
    target: THREE.Object3D,
    color: string,
    segmentCount = 10,
    segmentRadius = 0.2,
    segmentLength = 0.3
  ) {
    this.target = target;
    this.segmentCount = segmentCount;
    this.segmentRadius = segmentRadius;
    this.segmentLength = segmentLength;
    this.positions = new Array(segmentCount)
      .fill(0)
      .map(() => new THREE.Vector3());
    this.frequency = Math.random() * 1.0 + 0.01;

    // Geometry
    const geometry = new THREE.BufferGeometry();

    // Vertices
    const vertices = [];
    for (let i = 0; i < segmentCount; i++) {
      for (let j = 0; j < 8; j++) {
        // 8 vertices per ring
        const angle = (j / 8) * Math.PI * 2;
        vertices.push(
          Math.cos(angle) * segmentRadius * Math.sin(i), // x
          Math.sin(angle) * segmentRadius * Math.sin(i), // y
          -i * segmentLength // z
        );
      }
    }
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );

    const normals = [];
    for (let i = 0; i < segmentCount; i++) {
      for (let j = 0; j < 8; j++) {
        const angle = (j / 8) * Math.PI * 2;
        normals.push(
          Math.cos(angle), // x
          Math.sin(angle), // y
          0 // z, normals are perpendicular to the cylinder's axis
        );
      }
    }

    geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(normals, 3)
    );

    // Indices
    const indices = [];
    for (let i = 0; i < segmentCount - 1; i++) {
      for (let j = 0; j < 8; j++) {
        const current = i * 8 + j;
        const next = current + 8;

        // Correct calculation for the indices
        indices.push(current, next, ((j + 1) % 8) + i * 8);
        indices.push(((j + 1) % 8) + i * 8, next, ((j + 1) % 8) + (i + 1) * 8);
      }
    }
    geometry.setIndex(indices);

    // Material
    const material = new THREE.MeshPhysicalMaterial({
      color: color,
      side: THREE.DoubleSide,
    });
    material.specularIntensity = 0.5;
    material.clearcoat = 1;
    material.roughness = 0.5;

    // debugger;

    // Mesh
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.geometry.attributes.position.needsUpdate = true;
    group.add(this.mesh);

    addListener((note, velocity) => {
      // Check if there's a cube for the note
      const orb = orbs[note];
      if (orb && orb.cube == this.target) {
        // Set the emissive color based on velocity
        const mat = this.mesh.material as THREE.MeshPhysicalMaterial;
        mat.emissive.setHex(0xff00ff);
        mat.emissiveIntensity = velocity * 0.4;

        // Fade out the emissive color
        // (You might need to implement a more complex fading logic in your animation loop)
        setTimeout(() => mat.emissive.setHex(0x000000), 500);
      }
    });
  }

  update() {
    // Move head towards target
    this.positions[0].lerp(this.target.position, 0.1);

    // Update trailing positions
    for (let i = 1; i < this.segmentCount; i++) {
      this.positions[i].lerp(this.positions[i - 1], 0.1);
    }

    // Update vertex positions
    const positions = this.mesh.geometry.attributes.position.array;
    for (let i = 0; i < this.segmentCount; i++) {
      for (let j = 0; j < 8; j++) {
        const angle = (j / 8) * Math.PI * 2;
        const index = (i * 8 + j) * 3;
        let r = this.segmentRadius * Math.abs(Math.sin(i * this.frequency));
        if (i === 0 || i === this.segmentCount - 1) {
          r = 0;
        }
        positions[index] = Math.cos(angle) * r + this.positions[i].x;
        positions[index + 1] = Math.sin(angle) * r + this.positions[i].y;
        positions[index + 2] = this.positions[i].z;
      }
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
  }
}

class RibbonCreature {
  positions: THREE.Vector3[];
  segmentCount: number;
  target: THREE.Object3D;
  segmentLength: number;
  mesh: THREE.Mesh;

  constructor(
    target: THREE.Object3D,
    segmentCount = 10,
    segmentLength = 1,
    segmentWidth = 0.8
  ) {
    this.target = target;
    this.segmentCount = segmentCount;
    this.segmentLength = segmentLength;
    this.positions = new Array(segmentCount)
      .fill(0)
      .map(() => new THREE.Vector3());

    // Create the geometry
    const geometry = new THREE.BufferGeometry();

    // Vertices
    const vertices = new Float32Array(segmentCount * 2 * 3); // Two vertices per segment, three coordinates each
    for (let i = 0; i < segmentCount; i++) {
      vertices[i * 6] = 0; // x
      vertices[i * 6 + 1] = 0; // y
      vertices[i * 6 + 2] = -i * segmentWidth; // z

      vertices[i * 6 + 3] = 0; // x
      vertices[i * 6 + 4] = 0; // y
      vertices[i * 6 + 5] = -i * segmentWidth; // z
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    // Faces
    const indices = [];
    for (let i = 0; i < segmentCount - 1; i++) {
      const topLeft = i * 2;
      const topRight = topLeft + 1;
      const bottomLeft = topLeft + 2;
      const bottomRight = topRight + 2;

      // Two triangles per quad
      indices.push(topLeft, bottomLeft, topRight);
      indices.push(bottomLeft, bottomRight, topRight);
    }
    geometry.setIndex(indices);

    // Material
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
    });

    // Create the mesh
    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
  }

  update() {
    // Move head towards target
    const headPosition = this.positions[0];
    headPosition.lerp(this.target.position, 0.1); // Smooth movement towards the target

    // Update trailing positions
    for (let i = 1; i < this.segmentCount; i++) {
      this.positions[i].lerp(this.positions[i - 1], 0.1);
    }

    // Update vertices positions for a continuous ribbon
    const positions = this.mesh.geometry.attributes.position.array;
    for (let i = 0; i < this.segmentCount - 1; i++) {
      // Define vertices for the ribbon segment
      const p1 = this.positions[i];
      const p2 = this.positions[i + 1];

      positions[i * 12] = p1.x;
      positions[i * 12 + 1] = p1.y;
      positions[i * 12 + 2] = p1.z;
      positions[i * 12 + 3] = p2.x;
      positions[i * 12 + 4] = p2.y;
      positions[i * 12 + 5] = p2.z;

      // Repeat or offset for the second vertex of the pair
      positions[i * 12 + 6] = p1.x;
      positions[i * 12 + 7] = p1.y + 0.1;
      positions[i * 12 + 8] = p1.z;
      positions[i * 12 + 9] = p2.x;
      positions[i * 12 + 10] = p2.y + 0.1;
      positions[i * 12 + 11] = p2.z;
    }

    this.mesh.geometry.attributes.position.needsUpdate = true;
  }
}

class Creature {
  segments: THREE.Mesh[];
  target: THREE.Object3D;
  segmentDistance: number;
  damping: number;
  t: number = 0;

  constructor(target: THREE.Object3D, color: string, segmentCount = 5) {
    this.segments = [];
    this.target = target; // The target cube that the head follows
    this.segmentDistance = 0.2; // Distance between segments
    this.damping = 0.05; // Damping for movement, adjust as needed

    for (let i = 0; i < segmentCount; i++) {
      const geometry = new THREE.SphereGeometry(
        0.05 * (segmentCount - i),
        16,
        16
      ); // Decrease size for each segment
      const material = new THREE.MeshPhysicalMaterial({ color: color });
      material.specularIntensity = 0.5;
      material.clearcoat = 1;
      const sphere = new THREE.Mesh(geometry, material);

      // Position spheres along a line initially
      sphere.position.x = i * -this.segmentDistance;
      scene.add(sphere);
      this.segments.push(sphere);
    }

    addListener((note, velocity) => {
      // Check if there's a cube for the note
      const orb = orbs[note];
      if (orb && orb.cube == this.target) {
        // Set the emissive color based on velocity
        const mat = this.segments[0].material as THREE.MeshPhysicalMaterial;
        mat.emissive.setHex(0xff00ff);
        mat.emissiveIntensity = velocity;

        // Fade out the emissive color
        // (You might need to implement a more complex fading logic in your animation loop)
        setTimeout(() => mat.emissive.setHex(0x000000), 500);
      }
    });
  }

  update() {
    this.t++;
    // Move head towards target
    const head = this.segments[0];
    const direction = new THREE.Vector3().subVectors(
      this.target.position,
      head.position
    );
    direction.multiplyScalar(this.damping);
    head.position.add(direction);

    // Make each segment follow its predecessor with a minimum distance
    for (let i = 1; i < this.segments.length; i++) {
      const segment = this.segments[i];
      const previousSegment = this.segments[i - 1];

      const followDirection = new THREE.Vector3().subVectors(
        previousSegment.position,
        segment.position
      );
      const distance = followDirection.length();

      // Check if the distance is less than the minimum segment distance
      if (distance < this.segmentDistance) {
        // followDirection
        //   .normalize()
        //   .multiplyScalar(this.segmentDistance - distance);
        // segment.position.add(followDirection);
      } else {
        followDirection.multiplyScalar(this.damping);
        segment.position.add(followDirection);
      }
    }
  }
}

// Basic Three.js setup
const scene = new THREE.Scene();
const group = new THREE.Group();
scene.fog = new THREE.Fog(0x0, 5, 15);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPixelatedPass(1, scene, camera);
composer.addPass(renderPass);
const afterimagePass = new AfterimagePass(0.96); // Damp value, adjust for effect strength
composer.addPass(afterimagePass);

document.body.appendChild(renderer.domElement);
new OrbitControls(camera, renderer.domElement);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x0000ff, 1.5);
group.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffdddd, 5);
directionalLight.position.set(5, 5, 5);
group.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xddffdd, 5);
directionalLight.position.set(-5, -5, -5);
group.add(directionalLight2);

scene.add(group);

const boundingSphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: true })
);
group.add(boundingSphere);

camera.position.z = 7;

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
const initialVelocity = 0.025; // Adjust as needed
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
  // scene.add(mesh);
});

const creatures = notes.map(
  (note, idx) => new CylinderCreature(group, orbs[note].cube, colors[idx])
);

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
      orb.velocity.add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.07,
          (Math.random() - 0.5) * 0.07,
          (Math.random() - 0.5) * 0.07
        )
      );
      orb.velocity.multiplyScalar(0.5); // Apply friction
    }
  });
  updateParticles();
  updateCamera(group);

  creatures.forEach((creature) => creature.update());

  composer.render();
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
    const acceleration = velocity * 0.3; // Adjust multiplier as needed
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

addParticles(group);
