# Image Trail Shader

An advanced trail shader implementation built with React Three Fiber and WebGL post-processing to create visual persistence effects.

## How It Works

The trail shader creates visual persistence effects by blending current frames with previous ones using ping-pong rendering technique:

### Core Algorithm

1. **Frame Capture**: Each frame is captured to a WebGL render target
2. **Ping-pong Buffering**: Two render targets alternate between current and previous frame
3. **Blending**: Frames are mixed based on trail amount
4. **Post-processing**: The effect is applied as a post-processing pass

### Technical Implementation

```typescript
// Create effect with configurable options
const trailEffect = new TrailEffect({
    trailAmount: 80,        // Persistence intensity (0-99.9%)
    trailEnabled: true,     // Enable/disable effect
    resolutionScale: 0.5,   // Performance scaling
    blendFunction: BlendFunction.SCREEN
});
```

## Installation and Setup

```bash
# Clone repository
git clone <repo-url>
cd image-trail-shader

# Install dependencies with bun
bun install

# Start development server
bun run dev

# Build for production
bun run build
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
- **Memory Management**: Efficient WebGL texture management
- **Real-time Updates**: Parameter updates at runtime

### Configurable Parameters

| Parameter | Range | Description |
|-----------|-------|-------------|
| `trailAmount` | 50-99.9% | Trail persistence intensity |
| `resolutionScale` | 0.01-1.0 | Resolution scale for performance optimization |
| `blendFunction` | Various | Blending mode (Screen, Add, Multiply, etc.) |
| `trailEnabled` | Boolean | Enable/disable the effect |

### Fragment Shader

```glsl
uniform sampler2D currentFrame;
uniform sampler2D previousFrame;
uniform float trailAmount;
uniform bool trailEnabled;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec4 current = texture2D(currentFrame, uv);
    
    if (trailEnabled) {
        vec4 previous = texture2D(previousFrame, uv);
        outputColor = vec4(mix(current.rgb, previous.rgb, trailAmount), 1.0);
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
- Automatic WebGL resource cleanup
- Efficient render target reuse
- Configurable texture formats for different hardware

## Tech Stack

- **React Three Fiber**: React integration with Three.js
- **Postprocessing**: Post-processing effects library
- **Three.js**: WebGL 3D engine
- **TypeScript**: Type safety
- **Leva**: Real-time UI controls

## Supported Blend Functions

- **SCREEN**: Brightens the image, good for light trails
- **ADD**: Additive blending, creates bright accumulative effects  
- **MULTIPLY**: Darkens, useful for shadow-like trails
- **OVERLAY**: Combines multiply and screen for balanced results
- **And many more**: All postprocessing BlendFunctions available

## License

MIT