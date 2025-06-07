/**
 * API service for handling communication with the backend
 */

// Base URL for API requests - adjust this to match your FastAPI server
const API_BASE_URL = 'http://localhost:8000';

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyBxd6iRaTMmt2-IwvMEDU2W0B9NfX12i7s";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

/**
 * Send a prompt to the Ollama AI via the FastAPI backend
 *
 * @param {string} prompt - The prompt to send to the AI
 * @returns {Promise<Object>} - The AI response
 */
export const sendAIPrompt = async (prompt) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai-blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending AI prompt:', error);
    throw error;
  }
};

/**
 * Perform blog research using our custom AI
 *
 * @param {string} query - The research query to send
 * @param {string} format - The blog format type (comprehensive, comparison, howto, listicle, news)
 * @returns {Promise<Object>} - The research results
 */
export const performBlogResearch = async (query, format = 'comprehensive') => {
  try {
    console.log(`🔍 Blog Research: Generating ${format} content for "${query}" using Gemini AI`);

    // Create context-aware prompt based on format
    let systemPrompt;
    switch (format) {
      case 'comprehensive':
        systemPrompt = `You are a professional content writer. Create a comprehensive, detailed guide about "${query}". Include introduction, main sections with detailed explanations, examples, and conclusion. Make it informative and engaging.`;
        break;
      case 'comparison':
        systemPrompt = `You are a comparison expert. Create a detailed comparison guide about "${query}". Include different options, pros and cons, comparison tables, and recommendations. Make it helpful for decision-making.`;
        break;
      case 'howto':
        systemPrompt = `You are a tutorial expert. Create a step-by-step how-to guide about "${query}". Include prerequisites, detailed steps, troubleshooting tips, and advanced techniques. Make it practical and actionable.`;
        break;
      case 'listicle':
        systemPrompt = `You are a listicle writer. Create an engaging numbered list article about "${query}". Include compelling points, examples, and actionable tips. Make it easy to read and share.`;
        break;
      case 'news':
        systemPrompt = `You are a news writer. Create a news-style article about "${query}". Include current developments, key players, impact analysis, and expert opinions. Make it timely and informative.`;
        break;
      default:
        systemPrompt = `You are a professional content writer. Create a well-structured, informative article about "${query}". Make it engaging and valuable for readers.`;
    }

    const requestBody = {
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\nTopic: ${query}\n\nPlease create a comprehensive, well-structured blog post with proper headings, subheadings, and detailed content. Use markdown formatting for better readability.`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const content = data.candidates[0].content.parts[0].text;
      const wordCount = content.split(' ').length;

      console.log(`✅ Blog Research: Successfully generated ${wordCount} words using Gemini AI`);

      return {
        title: `${query}: ${format.charAt(0).toUpperCase() + format.slice(1)} Guide`,
        content: content,
        provider: 'gemini',
        success: true,
        format: format,
        query: query,
        wordCount: wordCount,
        timestamp: new Date().toISOString(),
        system_status: {
          ai_service: 'Google Gemini',
          status: 'operational',
          response_time: 'fast',
          quality: 'high',
          internet_connection: 'connected'
        }
      };
    } else {
      throw new Error('Invalid response from Gemini API');
    }

  } catch (error) {
    console.error('Error performing blog research:', error);

    // Fallback content
    const fallbackContent = generateCustomFallbackContent(query, format);

    return {
      title: `${query}: ${format.charAt(0).toUpperCase() + format.slice(1)} Guide`,
      content: fallbackContent,
      provider: 'fallback',
      success: false,
      error: error.message,
      format: format,
      query: query,
      system_status: {
        ai_service: 'Fallback Content',
        status: 'limited',
        response_time: 'fast',
        quality: 'basic',
        internet_connection: 'disconnected'
      }
    };
  }
};

/**
 * Generate custom fallback content when AI fails
 */
const generateCustomFallbackContent = (query, format) => {
  return `# ${query}: ${format.charAt(0).toUpperCase() + format.slice(1)} Guide

## Introduction

Welcome to this guide about ${query}! While our advanced AI research system is experiencing a temporary hiccup, I can still provide you with valuable information to get you started.

## What I Know About ${query}

${query} is a fascinating topic that deserves exploration. Here's what I can share with you right now:

### Key Concepts
- ${query} involves multiple interconnected aspects
- Understanding the fundamentals is crucial for success
- There are both theoretical and practical elements to consider

### Why ${query} Matters
- It has significant relevance in today's world
- Many professionals and enthusiasts are actively working in this area
- The field continues to evolve with new developments

## How Zentro Chat Can Help You Explore ${query}

While our AI research is temporarily limited, you can still use Zentro Chat's features to dive deeper:

### 🤖 **Ask Zentro Bot**
- Chat with me directly for specific questions about ${query}
- I can provide guidance and point you in the right direction
- Get personalized assistance based on your interests

### 📝 **Use the Blog Platform**
- Create your own blog posts about ${query}
- Share your experiences and insights with the community
- Engage with others who are interested in this topic

### 👥 **Connect with Experts**
- Use the Talent Directory to find professionals in this field
- Network with others who have experience with ${query}
- Join conversations and learn from the community

### 🎵 **Find Inspiration**
- Use the music player to find focus music while researching
- Create playlists that help you think about ${query}
- Share your creative process with others

## Next Steps

1. **Ask me specific questions** about ${query} - I'm here to help!
2. **Explore Zentro Chat's features** to research and connect
3. **Share your own knowledge** through blog posts
4. **Connect with the community** for collaborative learning

## Conclusion

Even though our advanced AI research is temporarily unavailable, ${query} remains an exciting topic worth exploring. Use Zentro Chat's community features to continue your journey, and don't hesitate to ask me for help along the way!

---

*💡 **Tip**: Try asking me more specific questions about ${query} - I might be able to provide better targeted assistance!*

*🔧 **Note**: This is simplified content while our full AI research system is being optimized. For the best experience, try again soon!*`;
};

/**
 * Legacy fallback function (kept for compatibility)
 */
const generateFallbackContent = (query, format) => {
  return generateCustomFallbackContent(query, format);
};

/**
 * Save a blog draft
 *
 * @param {Object} blogData - The blog data to save
 * @returns {Promise<Object>} - The saved blog data
 */
export const saveBlogDraft = async (blogData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blogData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving blog draft:', error);
    throw error;
  }
};

/**
 * Publish a blog
 *
 * @param {Object} blogData - The blog data to publish
 * @returns {Promise<Object>} - The published blog data
 */
export const publishBlog = async (blogData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blogData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error publishing blog:', error);
    throw error;
  }
};

export default {
  sendAIPrompt,
  saveBlogDraft,
  publishBlog,
};
