import { NoteOrb } from "./scene";
import { addListener } from "./sequencer";
import * as THREE from "three";

export class CylinderCreature {
  positions: THREE.Vector3[];
  segmentCount: number;
  target: THREE.Object3D;
  segmentRadius: number;
  segmentLength: number;
  mesh: THREE.Mesh;
  frequency: number = 0;

  constructor(
    group: THREE.Group,
    orbs: { [note: string]: NoteOrb },
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
    const material = new THREE.MeshStandardMaterial({
      color: color,
      // side: THREE.DoubleSide,
    });
    // material.specularIntensity = 0.5;
    // material.clearcoat = 1;
    // material.roughness = 0.5;

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
        const mat = this.mesh.material as THREE.MeshStandardMaterial;
        mat.emissive.setHex(0xff00ff);
        mat.emissiveIntensity = velocity * 0.8;

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
    group: THREE.Group,
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
    group.add(this.mesh);
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

  constructor(
    group: THREE.Group,
    target: THREE.Object3D,
    color: string,
    segmentCount = 5
  ) {
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
      group.add(sphere);
      this.segments.push(sphere);
    }
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
