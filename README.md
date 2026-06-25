<div align="center">

# Image Trail Shader

Real-time WebGL trail / visual-persistence post-processing effect built with React Three Fiber.

[![GitHub stars](https://img.shields.io/github/stars/niccolofanton/image-trail-shader?style=for-the-badge)](https://github.com/niccolofanton/image-trail-shader/stargazers)

### [▶ Live demo](https://trail.niccolofanton.dev)

</div>

Trail shader implementation built with React Three Fiber and WebGL post-processing to create visual persistence effects.

## How It Works

The trail shader creates visual persistence effects by blending current frames with previous ones using a ping-pong rendering technique:

### Core Algorithm

1. **Frame Capture**: Each frame is captured to a WebGL render target
2. **Ping-pong Buffering**: Two render targets alternate between current and previous frame
3. **Blending**: Frames are mixed using an exponential decay derived from `trailAmount`
4. **Post-processing**: The effect is applied as a post-processing pass

### Technical Implementation

```typescript
// Create effect with configurable options
const trailEffect = new TrailEffect({
    trailAmount: 80,        // Decay speed (Leva range 1.0-199.9; normalized by /100 in the shader)
    trailEnabled: true,     // Enable/disable effect
    resolutionScale: 0.5,   // Performance scaling
    blendFunction: BlendFunction.SCREEN
});
```

## Installation and Setup

```bash
# Clone repository
git clone https://github.com/niccolofanton/image-trail-shader.git
cd image-trail-shader

# Install dependencies with yarn
yarn install

# Start development server
yarn dev

# Build for production
yarn build
```

## Trail Shader Structure

```
src/trail-shader/
├── trail-effect.ts      # Main effect class
└── post-processing.tsx  # React Three Fiber integration
```

### TrailEffect Class

The `TrailEffect` class extends postprocessing's `Effect` and implements:

- **Render Targets**: Two buffers for ping-pong rendering
- **GLSL Shader**: Fragment shader for frame mixing
- **Memory Management**: WebGL texture cleanup on dispose
- **Real-time Updates**: Parameter updates at runtime

### Configurable Parameters

| Parameter | Range | Description |
|-----------|-------|-------------|
| `trailAmount` | 1.0-199.9 | Decay speed (labeled "Decay Speed" in the Leva UI); higher values fade the trail faster |
| `resolutionScale` | 0.01-1.0 | Resolution scale for performance optimization |
| `blendFunction` | Various | Blending mode (Screen, Add, Multiply, etc.) |
| `trailEnabled` | Boolean | Enable/disable the effect |

The constructor normalizes `trailAmount` by dividing it by 100 before passing it to the shader.

### Fragment Shader

```glsl
uniform sampler2D previousFrame;
uniform sampler2D currentFrame;
uniform float trailAmount;
uniform bool trailEnabled;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec4 current = texture2D(currentFrame, uv);

    if (trailEnabled) {
        vec4 previous = texture2D(previousFrame, uv);
        // Exponential decay simulates the real fade-out of light persistence.
        float decay = exp(-trailAmount * 0.2);
        vec3 blended = mix(current.rgb, previous.rgb, decay);
        outputColor = vec4(blended, 1.0);
    } else {
        outputColor = current;
    }
}
```

## React Integration

The `PostProcessing` component handles:

- EffectComposer setup
- Real-time controls with Leva
- Window resize management
- Effect parameter updates

```typescript
// Usage in React component
<PostProcessing />
```

## Performance Optimizations

### Resolution Scaling
```typescript
// High quality (full resolution)
resolutionScale: 1.0

// Balanced (half resolution)  
resolutionScale: 0.5

// Performance mode (quarter resolution)
resolutionScale: 0.25
```

### Memory Management
- WebGL resources (render targets, geometry, material) released on `dispose()`
- Two render targets reused via ping-pong swapping

## Tech Stack

- **React Three Fiber**: React integration with Three.js
- **Postprocessing**: Post-processing effects library
- **Three.js**: WebGL 3D engine
- **TypeScript**: Type safety
- **Leva**: Real-time UI controls

## Supported Blend Functions

The `TrailEffect` accepts any `BlendFunction` from the postprocessing library, for example:

- **SCREEN**: Brightens the image, good for light trails
- **ADD**: Additive blending, creates bright accumulative effects  
- **MULTIPLY**: Darkens, useful for shadow-like trails
- **OVERLAY**: Combines multiply and screen for balanced results

## License

`package.json` declares the project as MIT-licensed. Note that no separate `LICENSE` file is currently included in the repository.
