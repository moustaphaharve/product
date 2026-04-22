# Robot model overrides

Drop `.glb` files here named after a robot category slug and the viewport
will load them automatically instead of the primitive placeholder meshes.

Supported category slugs (see `packages/types/src/robot.ts`):

- `mobile_ground` — wheeled rover
- `mobile_aerial` — drone / quadrotor
- `manipulator_arm` — arm
- `humanoid`
- `quadruped`
- `wheeled_platform`
- `tracked_platform`
- `custom`

Example:

```powershell
# Windows PowerShell: grab a free quadruped from Khronos' sample assets
iwr -Uri "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxAnimated/glTF-Binary/BoxAnimated.glb" `
    -OutFile "apps/desktop/public/models/mobile_ground.glb"
```

Good sources (all free, many CC0):

- Sketchfab — filter **Downloadable** + CC license
- Poly Pizza — <https://poly.pizza>
- Google model-viewer samples — <https://modelviewer.dev/shared-assets/models/>
- NVIDIA Isaac assets (USD ? convert to glTF)
- Open Robotics URDFs (use `urdf-loader` to convert)

Scale considerations: the viewport is metric. Keep models ~0.5–1.5 m tall.
The pivot should be at the model's base (feet/wheels touching y=0).
