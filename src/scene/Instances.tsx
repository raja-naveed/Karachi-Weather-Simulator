import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { Color, InstancedMesh, Object3D } from 'three';

export interface Instance {
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}

/** One draw call per material; layouts are allocated by callers only when inputs change. */
export function Instances({ items, children }: { items: Instance[]; children: ReactNode }) {
  const mesh = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const object = new Object3D();
    const color = new Color();
    items.forEach((item, index) => {
      object.position.set(...item.position);
      object.scale.set(...item.scale);
      object.rotation.set(...(item.rotation ?? [0, 0, 0]));
      object.updateMatrix();
      mesh.current!.setMatrixAt(index, object.matrix);
      mesh.current!.setColorAt(index, color.set(item.color ?? '#ffffff'));
    });
    mesh.current.count = items.length;
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [items]);
  return <instancedMesh ref={mesh} args={[undefined, undefined, items.length]}>{children}</instancedMesh>;
}
