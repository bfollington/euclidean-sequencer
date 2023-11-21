import * as THREE from "three";

const cameraRotationSpeed = 0.0001; // Speed of rotation

export function updateCamera(group: THREE.Group) {
  group.rotation.y += cameraRotationSpeed;
  group.rotation.z -= cameraRotationSpeed;
}
