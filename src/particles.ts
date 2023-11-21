import * as THREE from "three";

const particlePositions: THREE.Vector3[] = [];
const particleCount = 1000; // Adjust based on desired density
const particleGeometry = new THREE.SphereGeometry(0.02, 4, 6); // Small spheres
const particleMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
particleMaterial.emissive = new THREE.Color(0x444444); // Slight glow
particleMaterial.roughness = 0.7; // Adjust for shininess

const particleMesh = new THREE.InstancedMesh(
  particleGeometry,
  particleMaterial,
  particleCount
);

export function addParticles(group: THREE.Group) {
  group.add(particleMesh);

  for (let i = 0; i < particleCount; i++) {
    const position = new THREE.Vector3(
      (Math.random() - 0.5) * 10, // Adjust range as needed
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    );

    particlePositions.push(position);

    const dummy = new THREE.Object3D();
    dummy.position.copy(position);
    dummy.updateMatrix();
    particleMesh.setMatrixAt(i, dummy.matrix);
  }

  particleMesh.instanceMatrix.needsUpdate = true;
}

export function updateParticles() {
  // Update particles
  const time = performance.now() * 0.0001; // Time in seconds
  particlePositions.forEach((position, i) => {
    const dummy = new THREE.Object3D();
    dummy.position.copy(position);

    // Simple floating motion
    dummy.position.y += Math.sin(time / 10.0 + i) * 5; // Adjust motion parameters as needed
    dummy.position.z += Math.cos(time / 10.0 + i) * 5; // Adjust motion parameters as needed
    dummy.scale.x = 0.1;
    dummy.scale.y = 0.8;
    dummy.scale.z = 0.5;
    dummy.rotation.y = Math.cos(time + i) * Math.PI * 2;
    dummy.updateMatrix();
    particleMesh.setMatrixAt(i, dummy.matrix);
  });

  particleMesh.instanceMatrix.needsUpdate = true;
}
