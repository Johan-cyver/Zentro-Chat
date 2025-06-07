import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner, FaExternalLinkAlt, FaClipboard, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { performBlogResearch } from '../../services/api';

const BlogResearchEngine = ({ onInsertContent }) => {
  const [query, setQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('comprehensive');
  const [showCompactFormats, setShowCompactFormats] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [ollamaResponse, setOllamaResponse] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const resultsPerPage = 5;

  // Blog format options
  const blogFormats = [
    {
      value: 'comprehensive',
      label: 'Comprehensive Guide',
      description: 'Complete overview with all aspects covered',
      icon: '📚',
      example: 'Introduction → What is X? → Types → Benefits → Getting Started → Challenges → Future → Conclusion'
    },
    {
      value: 'comparison',
      label: 'Comparison Guide',
      description: 'Compare different options side-by-side',
      icon: '⚖️',
      example: 'Option A vs Option B vs Option C → Pros/Cons → Comparison Table → Recommendations'
    },
    {
      value: 'howto',
      label: 'How-To Guide',
      description: 'Step-by-step instructions and tutorials',
      icon: '🛠️',
      example: 'Prerequisites → Step 1 → Step 2 → Step 3 → Troubleshooting → Advanced Tips'
    },
    {
      value: 'listicle',
      label: 'List Article',
      description: 'Engaging numbered lists and tips',
      icon: '📝',
      example: '10 Essential Things → Point 1 → Point 2 → Point 3 → Bonus Tip → Conclusion'
    },
    {
      value: 'news',
      label: 'News Style',
      description: 'Latest developments and breaking news format',
      icon: '📰',
      example: 'Executive Summary → What\'s Happening → Key Players → Impact → Expert Opinions'
    }
  ];

  // Perform search
  const performSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setSelectedResult(null);
    setOllamaResponse(null);

    try {
      // Call the AI API for real research results with selected format
      const response = await performBlogResearch(query.trim(), selectedFormat);

      // Check if there was an error in the response
      if (response.error) {
        console.warn("Ollama API error:", response.error);
        // We'll still show the response if we have content (fallback content)
        if (!response.content) {
          throw new Error(response.error);
        }
      }

      // Store the Ollama response and system status
      setOllamaResponse(response);
      if (response.system_status) {
        setSystemStatus(response.system_status);
        console.log("System status:", response.system_status);
      }

      // Generate search results based on the query
      // We'll still use mock results for the search list, but show real Ollama content
      const mockResults = generateMockResults(query);

      // Add the AI result as the first result
      const formatLabel = blogFormats.find(f => f.value === selectedFormat)?.label || 'Comprehensive Guide';
      const combinedResults = [
        {
          id: 'ai-1',
          title: response.title || `${query}: ${formatLabel}`,
          snippet: response.error
            ? 'AI-generated fallback content (AI services unavailable)'
            : `AI-generated ${formatLabel.toLowerCase()} based on your query`,
          source: getProviderName(response.provider),
          date: new Date().toLocaleDateString(),
          content: response.content,
          isAIResult: true,
          provider: response.provider || 'fallback',
          isFallback: response.provider === 'fallback' || !!response.error,
          errors: response.errors,
          format: selectedFormat
        },
        ...mockResults
      ];

      setResults(combinedResults);
      setTotalResults(combinedResults.length);

      // Automatically select the Ollama result
      setSelectedResult(combinedResults[0]);

    } catch (err) {
      console.error('Search error:', err);
      setError(`Failed to perform search: ${err.message}`);

      // Fall back to mock results if Ollama fails
      const mockResults = generateMockResults(query);
      setResults(mockResults);
      setTotalResults(mockResults.length);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock search results
  const generateMockResults = (searchQuery) => {
    // Create realistic-looking search results based on the query
    const topics = [
      'technology', 'science', 'health', 'business', 'politics',
      'environment', 'education', 'arts', 'sports', 'travel'
    ];

    const sources = [
      'Wikipedia', 'Research Journal', 'News Article', 'Blog Post',
      'Academic Paper', 'Government Report', 'Industry Analysis'
    ];

    // Check if query matches any topic
    const matchedTopics = topics.filter(topic =>
      searchQuery.toLowerCase().includes(topic) ||
      topic.includes(searchQuery.toLowerCase())
    );

    // If no direct matches, use all topics
    const relevantTopics = matchedTopics.length > 0 ? matchedTopics : topics;

    // Generate 10-15 results
    const numResults = Math.floor(Math.random() * 6) + 10;
    const results = [];

    for (let i = 0; i < numResults; i++) {
      const topic = relevantTopics[Math.floor(Math.random() * relevantTopics.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const year = 2018 + Math.floor(Math.random() * 6); // 2018-2023

      results.push({
        id: i + 1,
        title: generateTitle(searchQuery, topic),
        snippet: generateSnippet(searchQuery, topic),
        url: `https://example.com/${topic}/${searchQuery.replace(/\\s+/g, '-').toLowerCase()}`,
        source: source,
        date: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Math.floor(Math.random() * 12)]} ${year}`,
        content: generateContent(searchQuery, topic)
      });
    }

    return results;
  };

  // Generate a title based on the query and topic
  const generateTitle = (query, topic) => {
    const titleTemplates = [
      `${query}: A Comprehensive Guide`,
      `Understanding ${query} in the Context of ${topic}`,
      `The Impact of ${query} on Modern ${topic}`,
      `${query}: Current Trends and Future Directions`,
      `A Deep Dive into ${query}`,
      `${topic} and ${query}: The Connection Explained`,
      `Essential Facts About ${query} Everyone Should Know`,
      `How ${query} is Transforming ${topic}`,
      `The Evolution of ${query} in ${topic}`,
      `${query}: Myths and Realities`
    ];

    return titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
  };

  // Generate a snippet based on the query and topic
  const generateSnippet = (query, topic) => {
    const snippetTemplates = [
      `This article explores the relationship between ${query} and ${topic}, highlighting key developments and implications for future research.`,
      `An in-depth analysis of ${query} reveals significant impacts on ${topic}, with potential applications in various fields.`,
      `Recent studies on ${query} have shown promising results in the field of ${topic}, opening new avenues for innovation and growth.`,
      `Understanding ${query} is essential for anyone interested in ${topic}, as it provides valuable insights into underlying mechanisms and processes.`,
      `This comprehensive guide to ${query} covers fundamental concepts, practical applications, and its role in advancing ${topic}.`
    ];

    return snippetTemplates[Math.floor(Math.random() * snippetTemplates.length)];
  };

  // Generate full content for a result
  const generateContent = (query, topic) => {
    return `# ${generateTitle(query, topic)}

## Introduction
${query} has become increasingly important in the field of ${topic} over the past decade. This article explores the key aspects of ${query}, its applications, and implications for future developments in ${topic}.

## Background
The concept of ${query} first emerged in the early 2000s, though its roots can be traced back to earlier developments in related fields. Initially, ${query} was primarily used in specialized contexts, but its applications have expanded significantly over time.

## Key Aspects
At its core, ${query} encompasses several fundamental principles that drive its functionality and applications in ${topic}:

1. **Systematic approach**: ${query} relies on a methodical framework that integrates multiple perspectives and methodologies.
2. **Adaptability**: One of the strengths of ${query} is its ability to be implemented in various contexts with different requirements.
3. **User-centered design**: ${query} prioritizes addressing real needs and providing tangible benefits to end-users.

## Current Trends
The landscape of ${query} is constantly evolving, with several notable trends shaping its trajectory in ${topic}:

- Integration with artificial intelligence and machine learning
- Growing emphasis on sustainability and ethical considerations
- Increased focus on cross-disciplinary applications
- Development of standardized frameworks and best practices

## Challenges and Opportunities
Despite its numerous advantages, ${query} faces several challenges in the context of ${topic}:

- Implementation complexity requiring specialized knowledge
- Data privacy and security concerns
- Regulatory frameworks still catching up to technological advancements
- Need for better integration with existing systems and processes

However, these challenges also present opportunities for innovation and improvement.

## Conclusion
${query} represents a powerful approach with diverse applications and significant potential for positive impact on ${topic}. As we have explored throughout this article, its evolution continues to be shaped by technological advancements, changing user needs, and broader societal trends.

Looking ahead, the future of ${query} in ${topic} appears promising, with opportunities for innovation and refinement. By addressing current challenges and building on established strengths, ${query} will likely continue to play an important role in shaping solutions to complex problems in ${topic}.`;
  };

  // Get a friendly name for the AI provider
  const getProviderName = (provider) => {
    if (!provider) return 'AI Service';

    const providerNames = {
      'gemini': 'Google Gemini',
      'ollama': 'Ollama AI',
      'openai': 'OpenAI',
      'fallback': 'AI Fallback',
      'direct_fallback': 'AI Assistant'
    };

    return providerNames[provider] || 'AI Service';
  };

  // Format markdown content to HTML
  const formatMarkdown = (markdown) => {
    if (!markdown) return '';

    // Basic markdown formatting
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-purple-300 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-6 mb-4">$1</h1>')

      // Bold and italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')

      // Lists
      .replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-6 list-decimal">$1</li>')
      .replace(/^\s*[\-\*]\s+(.*$)/gim, '<li class="ml-6 list-disc">$1</li>')

      // Links
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-blue-400 hover:underline" target="_blank">$1</a>')

      // Code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre class="bg-gray-900 p-3 rounded-md my-4 overflow-x-auto"><code>$1</code></pre>')

      // Inline code
      .replace(/`(.*?)`/gim, '<code class="bg-gray-900 px-1 rounded text-pink-300">$1</code>')

      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-purple-500 pl-4 py-1 my-4 text-gray-400">$1</blockquote>')

      // Paragraphs
      .replace(/\n\s*\n/gim, '</p><p class="mb-4">')

      // Fix lists
      .replace(/<\/li>\n<li/gim, '</li><li');

    // Wrap in paragraph tags if not already
    if (!html.startsWith('<h') && !html.startsWith('<p')) {
      html = '<p class="mb-4">' + html;
    }
    if (!html.endsWith('</p>')) {
      html = html + '</p>';
    }

    return html;
  };

  // Handle inserting content into the blog editor
  const handleInsertContent = (content) => {
    if (onInsertContent) {
      onInsertContent(content);
    }
  };

  // Get paginated results
  const getPaginatedResults = () => {
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    return results.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return (
    <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-4 shadow-lg mb-6">
      <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
        <FaSearch className="text-purple-400" />
        Blog Research Engine
      </h3>

      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-gray-400">Research your blog topic</label>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Format:</span>
              <span className="px-2 py-1 bg-purple-900/30 border border-purple-500/50 rounded-full text-purple-300 flex items-center gap-1">
                {blogFormats.find(f => f.value === selectedFormat)?.icon}
                {blogFormats.find(f => f.value === selectedFormat)?.label}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                placeholder="Enter your topic (e.g., 'artificial intelligence', 'web development')..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={performSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 shadow-lg"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              <span>Generate</span>
            </button>
          </div>
        </div>

        {/* Blog Format Selection */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-purple-400">📝</span>
                Choose Your Blog Format
              </h3>
              <button
                onClick={() => setShowCompactFormats(!showCompactFormats)}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                {showCompactFormats ? '📋 Detailed View' : '⚡ Compact View'}
              </button>
            </div>
            <p className="text-sm text-gray-400">
              Select the format that best fits your content goals. Each format creates a different structure and style.
            </p>
          </div>

          {/* Format Options */}
          {showCompactFormats ? (
            /* Compact View */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {blogFormats.map((format) => (
                <button
                  key={format.value}
                  onClick={() => setSelectedFormat(format.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-300 text-center ${
                    selectedFormat === format.value
                      ? 'bg-purple-900/30 border-purple-400 shadow-lg shadow-purple-500/10'
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-650 hover:border-purple-500/50'
                  }`}
                >
                  <div className="text-2xl mb-2">{format.icon}</div>
                  <div className={`text-sm font-medium ${
                    selectedFormat === format.value ? 'text-white' : 'text-gray-200'
                  }`}>
                    {format.label}
                  </div>
                  {selectedFormat === format.value && (
                    <div className="mt-2">
                      <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                        ✓
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            /* Detailed View */
            <div className="space-y-4">
              {blogFormats.map((format) => (
                <div key={format.value} className="w-full">
                  <button
                    onClick={() => setSelectedFormat(format.value)}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                      selectedFormat === format.value
                        ? 'bg-purple-900/30 border-purple-400 shadow-lg shadow-purple-500/10'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-650 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <span className="text-3xl">{format.icon}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`font-semibold ${
                            selectedFormat === format.value ? 'text-white' : 'text-gray-200'
                          }`}>
                            {format.label}
                          </h4>
                          {selectedFormat === format.value && (
                            <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                              ✓ Selected
                            </span>
                          )}
                        </div>

                        <p className={`text-sm mb-3 ${
                          selectedFormat === format.value ? 'text-gray-300' : 'text-gray-400'
                        }`}>
                          {format.description}
                        </p>

                        {/* Structure Preview */}
                        <div className={`text-xs p-3 rounded border-l-4 ${
                          selectedFormat === format.value
                            ? 'bg-purple-900/20 border-purple-400 text-purple-200'
                            : 'bg-gray-800 border-gray-600 text-gray-500'
                        }`}>
                          <div className="font-medium mb-1">
                            {selectedFormat === format.value ? '📋 Structure:' : '📋 Preview:'}
                          </div>
                          <div className="leading-relaxed">
                            {format.example}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 p-3 bg-gray-900 rounded-lg border border-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">💡</span>
              <div className="text-xs text-gray-400">
                <p className="font-medium text-gray-300 mb-1">How it works:</p>
                <p>Each format uses specialized prompts to generate content with the appropriate structure, tone, and style. The AI will automatically adapt its response based on your selection.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 mb-4">
            {error}
          </div>
        )}



        {/* Search Results */}
        {results.length > 0 && !selectedResult && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Search Results</h4>

            <div className="space-y-4">
              {getPaginatedResults().map((result) => (
                <div
                  key={result.id}
                  className={`${
                    result.isAIResult
                      ? result.provider === 'openai'
                        ? 'bg-green-900/20 border border-green-500/50'
                        : result.provider === 'ollama'
                          ? 'bg-purple-900/20 border border-purple-500/50'
                          : result.isFallback
                            ? 'bg-yellow-900/20 border border-yellow-500/50'
                            : 'bg-blue-900/20 border border-blue-500/50'
                      : 'bg-gray-800'
                  } rounded-lg p-4 hover:bg-gray-750 transition-colors`}
                >
                  <h5 className="text-white font-medium mb-1">{result.title}</h5>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <span className={
                      result.isAIResult
                        ? result.provider === 'openai'
                          ? 'text-green-400'
                          : result.provider === 'ollama'
                            ? 'text-purple-400'
                            : result.isFallback
                              ? 'text-yellow-400'
                              : 'text-blue-400'
                        : ''
                    }>{result.source}</span>
                    <span>•</span>
                    <span>{result.date}</span>
                    {result.isAIResult && (
                      <>
                        <span>•</span>
                        {result.provider === 'gemini' ? (
                          <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded-full text-xs">Zenny</span>
                        ) : result.provider === 'openai' ? (
                          <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded-full text-xs">Zenny</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded-full text-xs">Zenny</span>
                        )}
                        {result.format && (
                          <>
                            <span>•</span>
                            <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded-full text-xs">
                              {blogFormats.find(f => f.value === result.format)?.icon} {blogFormats.find(f => f.value === result.format)?.label}
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{result.snippet}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedResult(result)}
                      className={`text-sm ${result.isOllamaResult ? 'text-purple-400 font-medium' : 'text-purple-400'} hover:text-purple-300`}
                    >
                      View Full Content
                    </button>
                    {!result.isOllamaResult && result.url && (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <FaExternalLinkAlt className="text-xs" />
                        <span>Visit Source</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="p-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                >
                  <FaArrowLeft />
                </button>
                <span className="text-gray-300">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="p-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                >
                  <FaArrowRight />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Selected Result View */}
        {selectedResult && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              {!selectedResult.isAIResult && (
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <FaArrowLeft />
                  <span>Back to Results</span>
                </button>
              )}

              {selectedResult.isAIResult && (
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-medium">Research by Zenny</span>
                  <span className="px-2 py-1 bg-purple-900/50 text-xs text-purple-300 rounded-full">Zenny AI</span>

                  {/* Show a note about the content type */}
                  {(selectedResult.provider === 'gemini' || selectedResult.provider === 'openai') && (
                    <span className="ml-2 text-xs text-gray-400">
                      (Comprehensive Blog Format)
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={() => handleInsertContent(selectedResult.content)}
                className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm"
              >
                <FaClipboard className="text-xs" />
                Insert to Editor
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="prose prose-invert max-w-none">
                {selectedResult.isAIResult ? (
                  <div className="markdown-content">
                    <h2 className="text-xl font-bold text-white mb-4">{selectedResult.title}</h2>
                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(selectedResult.content) }} />

                    {selectedResult.errors && selectedResult.errors.length > 0 && (
                      <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg text-yellow-400 text-sm">
                        <p className="font-medium mb-1">Note: Some AI providers were unavailable</p>
                        <ul className="list-disc list-inside">
                          {selectedResult.errors.map((error, index) => (
                            <li key={index} className="text-xs">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-gray-300">{selectedResult.content}</pre>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogResearchEngine;
