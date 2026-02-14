# Local Vision Model Setup

Instructions for setting up local vision model on DGX Spark for analyzing Marvin's visual experiences.

## Recommended Model: LLaVA-NeXT

LLaVA-NeXT (LLaVA 1.6) is excellent for this use case:
- Fast inference on GPU
- Good visual understanding
- Reasonable VRAM requirements
- Works well with vLLM

## Option 1: vLLM (Preferred)

**When vLLM vision support is ready:**

```bash
# Install vLLM with vision support
pip install vllm

# Download model
huggingface-cli download liuhaotian/llava-v1.6-vicuna-7b

# Start vLLM server with vision model
vllm serve liuhaotian/llava-v1.6-vicuna-7b \
  --host 0.0.0.0 \
  --port 8000 \
  --dtype auto
```

**Update analyze-vision.js to call vLLM endpoint:**

```javascript
async function analyzeScreenshot(imagePath) {
    const imageBase64 = fs.readFileSync(imagePath, 'base64');
    
    const response = await fetch('http://localhost:8000/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'liuhaotian/llava-v1.6-vicuna-7b',
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` }}
                ]
            }],
            max_tokens: 150
        })
    });
    
    const result = await response.json();
    return {
        image: path.basename(imagePath),
        analysis: result.choices[0].message.content,
        timestamp: new Date().toISOString()
    };
}
```

## Option 2: Ollama (Simpler)

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull vision model
ollama pull llava

# Start Ollama (runs as service)
ollama serve
```

**Update analyze-vision.js:**

```javascript
async function analyzeScreenshot(imagePath) {
    const imageBase64 = fs.readFileSync(imagePath, 'base64');
    
    const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'llava',
            prompt: prompt,
            images: [imageBase64]
        })
    });
    
    // Ollama streams responses, collect full output
    const lines = (await response.text()).trim().split('\n');
    const fullResponse = lines
        .map(line => JSON.parse(line))
        .map(obj => obj.response)
        .join('');
    
    return {
        image: path.basename(imagePath),
        analysis: fullResponse,
        timestamp: new Date().toISOString()
    };
}
```

## Option 3: llama.cpp with LLaVA

```bash
# Clone llama.cpp
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp

# Build with GPU support
mkdir build && cd build
cmake .. -DLLAMA_CUBLAS=ON
cmake --build . --config Release

# Download LLaVA model (GGUF format)
wget https://huggingface.co/mys/ggml_llava-v1.5-7b/resolve/main/ggml-model-q4_k.gguf

# Run with image
./bin/llava -m ggml-model-q4_k.gguf --image path/to/image.jpg -p "Describe this scene"
```

## Performance Expectations

**LLaVA 7B on DGX Spark:**
- ~0.5-1 second per image
- Analyzing 288 images (5-min intervals, 24hrs): ~5-10 minutes total
- Negligible VRAM (7B model: ~6GB)
- Zero API cost

**Recommended Schedule:**
Run analysis script during 2am reflection session. Analyzing full day's screenshots takes <10 minutes, well within the 30-minute session window.

## Integration with 2am Workflow

Update `build-session.md`:

```bash
# 1. Read lived experience
node scripts/read-experience.js

# 2. Analyze visual memories
node scripts/analyze-vision.js
```

This provides both:
- Perception logs (where, what, how I felt)
- Visual analysis (what I actually saw)

Combined, they give complete embodied experience for reflection.

## Testing

Once model is set up:

```bash
cd /home/scott/marvin-world
node scripts/analyze-vision.js
```

Should analyze today's screenshots and output summary of visual experiences.

## Next Steps

1. Choose option (Ollama is easiest to start)
2. Install on DGX Spark
3. Update analyze-vision.js with actual model call
4. Test with a few screenshots
5. Add to 2am cron workflow
6. Zero API costs achieved ✓
