import React, { useState } from 'react';

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyBxd6iRaTMmt2-IwvMEDU2W0B9NfX12i7s";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

/**
 * OllamaAIToggle - A React component that integrates with Gemini AI
 *
 * This component provides a toggle for AI functionality in the blog editor,
 * sending requests directly to Gemini AI for blog assistance.
 */
const OllamaAIToggle = ({
  label = "AI Assistant",
  options = ["Writing Help", "Research", "Rewriting", "Blog Structure"],
  placeholder = "Ask AI for suggestions...",
  onAIResponse = (response) => console.log("AI Response:", response)
}) => {
  // States
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [userPrompt, setUserPrompt] = useState('');
  const [aiState, setAIState] = useState('idle'); // idle, loading, success, error
  const [aiResponse, setAIResponse] = useState('');
  const [error, setError] = useState('');

  // Toggle AI functionality
  const toggleAI = () => {
    setIsAIEnabled(!isAIEnabled);
    if (!isAIEnabled) {
      setAIState('idle');
      setAIResponse('');
      setError('');
    }
  };

  // Handle option selection
  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setAIState('idle');
    setAIResponse('');
  };

  // Function to send request to FastAPI backend
  const requestAIAssistance = async () => {
    if (!userPrompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setAIState('loading');
    setError('');

    try {
      // Create context-aware prompt based on selected option
      let systemPrompt;
      switch (selectedOption) {
        case 'Writing Help':
          systemPrompt = `You are a professional writing assistant. Provide specific, actionable writing suggestions for the following content. Focus on clarity, engagement, and readability. Give numbered suggestions that the user can implement immediately.`;
          break;
        case 'Research':
          systemPrompt = `You are a research assistant. Provide relevant research insights, statistics, and key points about the following topic. Include current trends, expert opinions, and actionable information that would be valuable for a blog post.`;
          break;
        case 'Rewriting':
          systemPrompt = `You are an expert editor. Rewrite the following content to make it more engaging, clear, and professional. Maintain the original meaning while improving flow, structure, and impact.`;
          break;
        case 'Blog Structure':
          systemPrompt = `You are a blog structure expert. Create a detailed outline for a blog post about the following topic. Include compelling headings, subpoints, and suggestions for content in each section.`;
          break;
        default:
          systemPrompt = `You are a helpful blog writing assistant. Provide useful suggestions and guidance for the following request.`;
      }

      const requestBody = {
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser request: ${userPrompt}\n\nPlease provide a helpful, detailed response that the user can use to improve their blog content.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
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
        const aiResponse = data.candidates[0].content.parts[0].text;
        setAIResponse(aiResponse);
        setAIState('success');
      } else {
        throw new Error('Invalid response from Gemini API');
      }
    } catch (err) {
      setAIState('error');
      setError(`Failed to get AI suggestions: ${err.message}`);
      console.error('AI request error:', err);
    }
  };

  // Insert AI suggestion into parent component
  const insertSuggestion = () => {
    onAIResponse(aiResponse);
  };

  return (
    <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-4 shadow-lg">
      {/* Toggle Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-purple-400">{label}</h3>

        {/* Toggle Switch */}
        <button
          onClick={toggleAI}
          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
            isAIEnabled ? 'bg-purple-600' : 'bg-gray-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
              isAIEnabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* AI Content - Only visible when enabled */}
      {isAIEnabled && (
        <div className="space-y-4 animate-fadeIn">
          {/* Options */}
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionChange(option)}
                className={`px-3 py-1 text-sm rounded-full transition-all duration-300 ${
                  selectedOption === option
                    ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="space-y-2">
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
              rows="3"
            />

            <div className="flex justify-end">
              <button
                onClick={requestAIAssistance}
                disabled={aiState === 'loading'}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
              >
                {aiState === 'loading' ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Get Suggestions'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm p-2 bg-red-900/20 border border-red-800 rounded-lg">
              {error}
            </div>
          )}

          {/* AI Response */}
          {aiState === 'success' && (
            <div className="mt-4 p-4 bg-gray-800/50 border border-purple-500/30 rounded-lg relative overflow-hidden">
              {/* Glowing effect */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 opacity-70"></div>

              <pre className="text-gray-300 whitespace-pre-wrap font-sans">{aiResponse}</pre>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={insertSuggestion}
                  className="px-3 py-1 bg-purple-600/80 hover:bg-purple-600 rounded text-white text-sm transition-colors duration-300"
                >
                  Insert
                </button>
                <button
                  onClick={() => {setAIResponse(''); setAIState('idle');}}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors duration-300"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OllamaAIToggle;
