import React, { useState, useEffect } from 'react';

/**
 * AIToggleComponent - A reusable component that integrates AI functionality into a toggle
 * 
 * This component demonstrates how to:
 * 1. Create a toggle with AI functionality
 * 2. Handle AI processing states (idle, loading, success, error)
 * 3. Display AI-generated content
 * 4. Allow user interaction with AI suggestions
 */
const AIToggleComponent = ({ 
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

  // Mock AI request function
  const requestAIAssistance = async () => {
    if (!userPrompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setAIState('loading');
    setError('');
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock responses based on selected option
      let response;
      switch (selectedOption) {
        case 'Writing Help':
          response = `Here are some writing suggestions for "${userPrompt}":\n\n1. Consider starting with a compelling hook\n2. Use more descriptive language\n3. Break up longer paragraphs\n4. Add a clear call-to-action`;
          break;
        case 'Research':
          response = `Research findings for "${userPrompt}":\n\n• Recent studies show increasing interest in this topic\n• Key statistics: 78% of users engage more with visual content\n• Industry experts recommend focusing on user experience\n• Consider exploring related topics like [suggested topics]`;
          break;
        case 'Rewriting':
          response = `Rewritten version:\n\n"${userPrompt.substring(0, 15)}..." could be improved as:\n\n"${userPrompt.split(' ').reverse().join(' ')}"`;
          break;
        case 'Blog Structure':
          response = `Suggested blog structure for "${userPrompt}":\n\n## Introduction\n- Hook the reader\n- Present the problem\n\n## Main Points\n1. First key insight\n2. Supporting evidence\n3. Practical application\n\n## Conclusion\n- Summarize key takeaways\n- Call to action`;
          break;
        default:
          response = `AI suggestions for "${userPrompt}"`;
      }
      
      setAIResponse(response);
      setAIState('success');
      onAIResponse(response);
    } catch (err) {
      setAIState('error');
      setError('Failed to get AI suggestions. Please try again.');
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

export default AIToggleComponent;
