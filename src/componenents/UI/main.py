import requests
import os
import json
import time
import socket
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Any, List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Keys - Updated with your working keys
OPENAI_API_KEY = "your-api-key"

# Gemini API key - Using the newer one first
GEMINI_API_KEY = "your-api-key"

# Function to check internet connectivity
def check_internet_connection():
    try:
        # Try to connect to Google's DNS server
        socket.create_connection(("8.8.8.8", 53), timeout=5)
        return True
    except OSError:
        try:
            # Fallback: try to connect to Cloudflare DNS
            socket.create_connection(("1.1.1.1", 53), timeout=5)
            return True
        except OSError:
            try:
                # Another fallback: try HTTP request to a reliable service
                response = requests.get("https://httpbin.org/status/200", timeout=5)
                return response.status_code == 200
            except:
                # If all else fails, assume internet is available (for development)
                print("Warning: Could not verify internet connection, assuming available")
                return True

# Check if internet is available
INTERNET_AVAILABLE = check_internet_connection()
print(f"Internet connection available: {INTERNET_AVAILABLE}")

# Check if Ollama is running
def check_ollama_running():
    try:
        print("Checking if Ollama is running...")
        # Try multiple possible addresses for Ollama
        for url in ["http://127.0.0.1:11435/api/tags", "http://localhost:11435/api/tags"]:
            try:
                print(f"Trying to connect to Ollama at {url}...")
                response = requests.get(url, timeout=10)  # Increased timeout
                if response.status_code == 200:
                    models = response.json().get("models", [])
                    print(f"Ollama is running with models: {models}")
                    # Check if tinyllama is available
                    tinyllama_available = any("tinyllama" in model.lower() for model in models)
                    print(f"TinyLlama available: {tinyllama_available}")
                    return True
                else:
                    print(f"Ollama returned status code: {response.status_code}")
            except Exception as inner_e:
                print(f"Error connecting to {url}: {str(inner_e)}")
                continue

        # If we get here, all connection attempts failed
        return False
    except Exception as e:
        print(f"Error checking Ollama: {str(e)}")
        return False

OLLAMA_RUNNING = check_ollama_running()
print(f"Ollama server running: {OLLAMA_RUNNING}")

# AI provider configurations - Gemini primary, OpenAI backup
AI_PROVIDERS = {
    "gemini": {
        "enabled": bool(GEMINI_API_KEY) and INTERNET_AVAILABLE,
        "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",  # Try latest model
        "model": "gemini-1.5-flash-latest",
        "timeout": 30
    },
    "openai": {
        "enabled": bool(OPENAI_API_KEY) and INTERNET_AVAILABLE,
        "url": "https://api.openai.com/v1/chat/completions",
        "model": "gpt-3.5-turbo",
        "timeout": 30
    }
}

class BlogPrompt(BaseModel):
    prompt: str

class SearchQuery(BaseModel):
    query: str
    provider: Optional[str] = None  # Allow specifying a preferred provider
    format: Optional[str] = "comprehensive"  # Blog format type

@app.post("/ai-blog")
async def ai_blog(prompt: BlogPrompt):
    try:
        response = requests.post(
            "http://localhost:11435/api/generate",  # Changed to localhost
            json={
                "model": "tinyllama",  # Changed to tinyllama
                "prompt": prompt.prompt,
                "stream": False
            },
            timeout=120
        )
        data = response.json()
        print("Ollama response:", data)
        return {"result": data.get("response", data)}
    except Exception as e:
        return {"result": f"Error: {str(e)}"}

@app.get("/test-gemini")
async def test_gemini():
    """Simple endpoint to test if Gemini API is working"""
    try:
        print("Testing Gemini API connection...")

        if not GEMINI_API_KEY:
            return {
                "status": "error",
                "message": "Gemini API key is not configured"
            }

        if not INTERNET_AVAILABLE:
            return {
                "status": "error",
                "message": "Internet connection is not available"
            }

        print(f"Using API key: {GEMINI_API_KEY[:10]}...")
        print(f"Full API key length: {len(GEMINI_API_KEY)}")
        print(f"API key starts with: {GEMINI_API_KEY[:20]}...")

        # Try a simple test request
        gemini_url = f"{AI_PROVIDERS['gemini']['url']}?key={GEMINI_API_KEY}"

        test_payload = {
            "contents": [{
                "parts": [{
                    "text": "Hello, please respond with 'Gemini API is working correctly!'"
                }]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 100
            }
        }

        print(f"Testing Gemini at: {gemini_url}")
        response = requests.post(
            gemini_url,
            headers={"Content-Type": "application/json"},
            json=test_payload,
            timeout=15
        )

        print(f"Gemini test response status: {response.status_code}")
        print(f"Gemini test response: {response.text[:500]}...")

        if response.status_code != 200:
            return {
                "status": "error",
                "message": f"Gemini API returned status {response.status_code}",
                "details": response.text,
                "api_key_preview": f"{GEMINI_API_KEY[:10]}..."
            }

        data = response.json()

        if "candidates" in data and len(data["candidates"]) > 0:
            candidate = data["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                generated_text = candidate["content"]["parts"][0]["text"]
                return {
                    "status": "success",
                    "message": "Gemini API is working correctly!",
                    "generated_text": generated_text,
                    "model": AI_PROVIDERS["gemini"]["model"]
                }

        return {
            "status": "error",
            "message": "Gemini returned unexpected response format",
            "details": data
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Error testing Gemini: {str(e)}",
            "details": str(e)
        }

def get_blog_format_prompt(query: str, format_type: str) -> str:
    """Generate different blog format prompts based on user selection"""

    base_instruction = f"Write a well-structured, engaging blog post about: {query}"

    if format_type == "comprehensive":
        return f"""
        {base_instruction}

        Please create a complete blog article with the following structure:

        # {query}: A Comprehensive Guide

        ## Introduction
        - Engaging opening that hooks the reader
        - Brief overview of what will be covered
        - Why this topic is important/relevant

        ## What is {query}?
        - Clear definition and explanation
        - Key concepts and terminology
        - Historical background or context

        ## Types/Categories of {query}
        - Different types, categories, or approaches
        - Detailed explanation of each type
        - When to use each type/approach

        ## Key Benefits and Applications
        - Main advantages and benefits
        - Real-world applications and use cases
        - Industries or areas where it's most valuable

        ## How to Get Started with {query}
        - Step-by-step guide for beginners
        - Essential tools, resources, or requirements
        - Best practices and tips

        ## Common Challenges and Solutions
        - Typical problems or obstacles
        - Practical solutions and workarounds
        - Expert advice and recommendations

        ## Latest Trends and Future Outlook
        - Current trends and developments
        - Emerging technologies or approaches
        - Future predictions and opportunities

        ## Conclusion
        - Summary of key points
        - Final thoughts and recommendations
        - Call to action for readers

        Format the entire response in markdown with proper headings, bullet points, numbered lists, and bold text where appropriate. Make it engaging, informative, and ready to publish as a blog post. Include specific examples and actionable advice throughout.
        """

    elif format_type == "comparison":
        return f"""
        {base_instruction}

        Please create a detailed comparison blog post with the following structure:

        # {query}: Complete Comparison Guide

        ## Introduction
        - Why comparing {query} options is important
        - What this comparison will cover
        - How to use this guide

        ## Overview of Options
        - Brief introduction to each option/alternative
        - Key differentiating factors
        - Target audiences for each

        ## Detailed Comparison

        ### Option 1: [Name]
        - **Pros:** List of advantages
        - **Cons:** List of disadvantages
        - **Best for:** Ideal use cases
        - **Pricing:** Cost considerations
        - **Features:** Key capabilities

        ### Option 2: [Name]
        - **Pros:** List of advantages
        - **Cons:** List of disadvantages
        - **Best for:** Ideal use cases
        - **Pricing:** Cost considerations
        - **Features:** Key capabilities

        ### Option 3: [Name]
        - **Pros:** List of advantages
        - **Cons:** List of disadvantages
        - **Best for:** Ideal use cases
        - **Pricing:** Cost considerations
        - **Features:** Key capabilities

        ## Side-by-Side Comparison Table
        Create a comparison table with key features, pricing, and ratings

        ## Which Should You Choose?
        - Decision framework
        - Recommendations based on different needs
        - Final verdict

        ## Conclusion
        - Summary of key differences
        - Final recommendations
        - Next steps for readers

        Format with clear headings, comparison tables, bullet points, and bold text. Include specific examples and real-world scenarios.
        """

    elif format_type == "howto":
        return f"""
        {base_instruction}

        Please create a detailed how-to guide with the following structure:

        # How to {query}: Complete Step-by-Step Guide

        ## Introduction
        - What you'll learn in this guide
        - Who this guide is for
        - What you'll need to get started

        ## Prerequisites
        - Required knowledge or skills
        - Tools and resources needed
        - Time investment required

        ## Step-by-Step Instructions

        ### Step 1: [First Step]
        - Detailed explanation
        - What to do exactly
        - Common mistakes to avoid
        - Expected outcome

        ### Step 2: [Second Step]
        - Detailed explanation
        - What to do exactly
        - Common mistakes to avoid
        - Expected outcome

        ### Step 3: [Third Step]
        - Detailed explanation
        - What to do exactly
        - Common mistakes to avoid
        - Expected outcome

        [Continue with more steps as needed]

        ## Troubleshooting
        - Common problems and solutions
        - Warning signs to watch for
        - When to seek help

        ## Advanced Tips
        - Pro tips for better results
        - Advanced techniques
        - Optimization strategies

        ## Conclusion
        - Summary of what was accomplished
        - Next steps and further learning
        - Additional resources

        Format with numbered steps, bullet points, bold text for important points, and include practical examples throughout.
        """

    elif format_type == "listicle":
        return f"""
        {base_instruction}

        Please create an engaging listicle with the following structure:

        # [Number] Essential Things You Need to Know About {query}

        ## Introduction
        - Hook the reader with an interesting fact or question
        - Preview what the list will cover
        - Why this list matters

        ## 1. [First Point]
        - Clear, engaging headline
        - Detailed explanation
        - Why this matters
        - Practical example or tip

        ## 2. [Second Point]
        - Clear, engaging headline
        - Detailed explanation
        - Why this matters
        - Practical example or tip

        ## 3. [Third Point]
        - Clear, engaging headline
        - Detailed explanation
        - Why this matters
        - Practical example or tip

        [Continue with 7-10 total points]

        ## Bonus Tip
        - Extra valuable insight
        - Something most people don't know
        - Advanced or insider information

        ## Conclusion
        - Recap the most important points
        - Encourage action
        - Provide next steps

        Format with engaging headlines, bullet points, bold text, and include real examples and actionable advice for each point.
        """

    elif format_type == "news":
        return f"""
        {base_instruction}

        Please create a news-style blog post with the following structure:

        # Breaking: Latest Developments in {query}

        ## Executive Summary
        - Key highlights in bullet points
        - Most important takeaways
        - Impact assessment

        ## What's Happening
        - Current situation overview
        - Recent developments
        - Timeline of events

        ## Key Players and Stakeholders
        - Who's involved
        - Their roles and positions
        - Statements and reactions

        ## Impact Analysis
        - Short-term implications
        - Long-term consequences
        - Who will be affected

        ## Expert Opinions
        - Industry expert quotes
        - Analysis and predictions
        - Different perspectives

        ## What This Means for You
        - Personal impact
        - Action items
        - Opportunities and risks

        ## Looking Ahead
        - Future predictions
        - What to watch for
        - Upcoming milestones

        ## Conclusion
        - Summary of key points
        - Final analysis
        - Call to action

        Format like a professional news article with clear headlines, quotes, data points, and factual information.
        """

    else:  # Default to comprehensive
        return get_blog_format_prompt(query, "comprehensive")

@app.post("/blog-research")
async def blog_research(search: SearchQuery):
    try:
        # Create a format-specific blog prompt
        research_prompt = get_blog_format_prompt(search.query, search.format)

        # Check prerequisites - be more lenient for development
        if not GEMINI_API_KEY and not OPENAI_API_KEY:
            return {"error": "No AI API keys configured. Please configure Gemini or OpenAI API key to use AI blog generation."}

        # Force internet available for development if we have API keys
        if GEMINI_API_KEY or OPENAI_API_KEY:
            global INTERNET_AVAILABLE
            INTERNET_AVAILABLE = True
            print("Development mode: Forcing internet available since API keys are configured")

        print("=== AI API DEBUG INFO ===")
        print(f"Gemini API Key: {GEMINI_API_KEY[:10]}..." if GEMINI_API_KEY else "No Gemini key")
        print(f"OpenAI API Key: {OPENAI_API_KEY[:10]}..." if OPENAI_API_KEY else "No OpenAI key")
        print(f"Internet Available: {INTERNET_AVAILABLE}")
        print("=========================")

        # Try Gemini first, then OpenAI as backup
        content = None
        used_provider = None
        error_messages = []

        # Try Gemini first
        if GEMINI_API_KEY:
            try:
                print("Generating blog content with Gemini AI...")
                print(f"Gemini API key: {GEMINI_API_KEY[:10]}...")

                # Gemini API format
                gemini_url = f"{AI_PROVIDERS['gemini']['url']}?key={GEMINI_API_KEY}"
                print(f"Gemini URL: {gemini_url}")

                request_payload = {
                    "contents": [{
                        "parts": [{
                            "text": research_prompt
                        }]
                    }],
                    "generationConfig": {
                        "temperature": 0.7,
                        "topK": 40,
                        "topP": 0.95,
                        "maxOutputTokens": 4096
                    }
                }

                print(f"Sending blog generation request to Gemini...")
                response = requests.post(
                    gemini_url,
                    headers={"Content-Type": "application/json"},
                    json=request_payload,
                    timeout=AI_PROVIDERS["gemini"]["timeout"]
                )

                print(f"Gemini response status: {response.status_code}")

                if response.status_code == 200:
                    data = response.json()
                    print(f"Gemini response received with keys: {data.keys()}")

                    if "candidates" in data and len(data["candidates"]) > 0:
                        candidate = data["candidates"][0]
                        if "content" in candidate and "parts" in candidate["content"]:
                            content = candidate["content"]["parts"][0]["text"]
                            used_provider = "gemini"
                            print("Successfully generated blog content with Gemini!")
                            print(f"Generated content length: {len(content)} characters")
                        else:
                            raise Exception(f"Gemini returned unexpected response format: {data}")
                    else:
                        raise Exception(f"Gemini returned no candidates: {data}")
                else:
                    error_text = response.text
                    print(f"Gemini API error: {error_text}")
                    raise Exception(f"Gemini API error (Status {response.status_code}): {error_text}")

            except Exception as gemini_err:
                error_message = f"Error with Gemini: {str(gemini_err)}"
                print(error_message)
                error_messages.append(error_message)

        # Try OpenAI if Gemini failed
        if not content and OPENAI_API_KEY:
            try:
                print("Trying OpenAI as backup...")
                print(f"OpenAI API key: {OPENAI_API_KEY[:10]}...")

                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {OPENAI_API_KEY}"
                }

                response = requests.post(
                    AI_PROVIDERS["openai"]["url"],
                    headers=headers,
                    json={
                        "model": AI_PROVIDERS["openai"]["model"],
                        "messages": [
                            {"role": "system", "content": "You are a helpful research assistant. Provide comprehensive, factual information in markdown format."},
                            {"role": "user", "content": research_prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 4096
                    },
                    timeout=AI_PROVIDERS["openai"]["timeout"]
                )

                print(f"OpenAI response status: {response.status_code}")

                if response.status_code == 200:
                    data = response.json()
                    if "choices" in data and len(data["choices"]) > 0:
                        content = data["choices"][0]["message"]["content"]
                        used_provider = "openai"
                        print("Successfully generated blog content with OpenAI!")
                        print(f"Generated content length: {len(content)} characters")
                    else:
                        raise Exception(f"OpenAI returned unexpected response format: {data}")
                else:
                    error_text = response.text
                    raise Exception(f"OpenAI API error (Status {response.status_code}): {error_text}")

            except Exception as openai_err:
                error_message = f"Error with OpenAI: {str(openai_err)}"
                print(error_message)
                error_messages.append(error_message)

        # Return results or error
        if content:
            return {
                "title": f"{search.query}: A Comprehensive Guide",
                "content": content,
                "query": search.query,
                "provider": used_provider,
                "system_status": {
                    "internet_available": INTERNET_AVAILABLE,
                    "gemini_configured": bool(GEMINI_API_KEY),
                    "openai_configured": bool(OPENAI_API_KEY),
                    "available_providers": [p for p, c in AI_PROVIDERS.items() if c["enabled"]]
                }
            }
        else:
            return {"error": f"All AI providers failed. Errors: {'; '.join(error_messages)}"}

    except Exception as e:
        print(f"Error in blog research: {str(e)}")
        return {"error": f"Error performing research: {str(e)}"}

@app.get("/test-system")
async def test_system():
    """Test system status and connectivity"""
    return {
        "internet_available": INTERNET_AVAILABLE,
        "gemini_configured": bool(GEMINI_API_KEY),
        "openai_configured": bool(OPENAI_API_KEY),
        "gemini_key_preview": GEMINI_API_KEY[:10] + "..." if GEMINI_API_KEY else None,
        "openai_key_preview": OPENAI_API_KEY[:10] + "..." if OPENAI_API_KEY else None,
        "available_providers": [p for p, c in AI_PROVIDERS.items() if c["enabled"]],
        "system_ready": bool(GEMINI_API_KEY or OPENAI_API_KEY)
    }

# Removed fallback content function - now using Gemini exclusively