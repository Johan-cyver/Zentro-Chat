import requests
import json

print("Testing Ollama connection...")

# Check if Ollama is running
try:
    print("Checking if Ollama server is accessible...")
    response = requests.get("http://localhost:11435/api/tags", timeout=5)
    print(f"Response status code: {response.status_code}")
    
    if response.status_code == 200:
        print("Ollama server is running!")
        data = response.json()
        print(f"Available models: {json.dumps(data, indent=2)}")
        
        # Check if tinyllama is available
        models = data.get("models", [])
        tinyllama_available = any("tinyllama" in model.lower() for model in models)
        print(f"TinyLlama available: {tinyllama_available}")
        
        # Try to generate text with tinyllama
        print("\nTesting text generation with tinyllama...")
        try:
            gen_response = requests.post(
                "http://localhost:11435/api/generate",
                json={
                    "model": "tinyllama",
                    "prompt": "Tell me about artificial intelligence in one paragraph.",
                    "stream": False
                },
                timeout=30
            )
            
            print(f"Generation response status: {gen_response.status_code}")
            
            if gen_response.status_code == 200:
                gen_data = gen_response.json()
                print("Generation successful!")
                print(f"Response keys: {gen_data.keys()}")
                print("\nGenerated text:")
                print(gen_data.get("response", "No response text"))
            else:
                print(f"Generation failed with status {gen_response.status_code}")
                print(f"Error: {gen_response.text}")
        except Exception as e:
            print(f"Error during generation: {str(e)}")
    else:
        print(f"Ollama server returned error status: {response.status_code}")
        print(f"Response: {response.text}")
except Exception as e:
    print(f"Error connecting to Ollama: {str(e)}")

print("\nTest completed.")
