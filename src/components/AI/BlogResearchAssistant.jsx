import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner, FaLightbulb, FaClipboard, FaRobot, FaBrain, FaFileAlt } from 'react-icons/fa';

const BlogResearchAssistant = ({ onInsertContent }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('detailed');
  const [error, setError] = useState('');
  const [contentType, setContentType] = useState('outline'); // 'outline' or 'full'
  const [typingEffect, setTypingEffect] = useState({ active: false, text: '', fullText: '', speed: 10 });

  // Blog format templates
  const blogFormats = {
    detailed: {
      name: 'Detailed Article',
      description: 'Comprehensive article with introduction, multiple sections, and conclusion',
      sections: ['Introduction', 'Background', 'Main Points (3-5)', 'Analysis', 'Conclusion']
    },
    listicle: {
      name: 'Listicle',
      description: 'List-based article with numbered points and brief explanations',
      sections: ['Introduction', 'List Items (5-10)', 'Summary']
    },
    howTo: {
      name: 'How-To Guide',
      description: 'Step-by-step instructions with explanations',
      sections: ['Introduction', 'Prerequisites', 'Step-by-Step Instructions', 'Tips', 'Conclusion']
    },
    comparison: {
      name: 'Comparison',
      description: 'Compare and contrast two or more subjects',
      sections: ['Introduction', 'Subject Overviews', 'Comparison Points', 'Verdict/Recommendation']
    },
    opinion: {
      name: 'Opinion Piece',
      description: 'Present and defend a viewpoint on a topic',
      sections: ['Introduction', 'Background', 'Arguments', 'Counterarguments', 'Conclusion']
    }
  };

  // Typing effect for more realistic AI response
  useEffect(() => {
    if (typingEffect.active && typingEffect.text.length < typingEffect.fullText.length) {
      const timeout = setTimeout(() => {
        setTypingEffect(prev => ({
          ...prev,
          text: prev.fullText.substring(0, prev.text.length + 1)
        }));
      }, typingEffect.speed);

      return () => clearTimeout(timeout);
    } else if (typingEffect.active && typingEffect.text.length === typingEffect.fullText.length) {
      setTypingEffect(prev => ({ ...prev, active: false }));
    }
  }, [typingEffect]);

  // Generate blog content based on query and selected format
  const generateBlogContent = async () => {
    if (!query.trim()) {
      setError('Please enter a research topic');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      // Simulate AI processing time (shorter for more responsive feel)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const format = blogFormats[selectedFormat];

      // Generate research results based on content type
      const generatedResults = contentType === 'outline'
        ? generateOutlineResults(query, selectedFormat)
        : generateFullContent(query, selectedFormat);

      // Start typing effect for more realistic AI response
      if (contentType === 'full') {
        const fullText = generatedResults.content;
        setTypingEffect({
          active: true,
          text: '',
          fullText,
          speed: 5 // Faster typing for better UX
        });
      }

      setResults(generatedResults);
    } catch (err) {
      console.error('Error generating blog content:', err);
      setError('Failed to generate blog content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate outline results
  const generateOutlineResults = (query, format) => {
    return {
      title: generateTitle(query, format),
      outline: generateOutline(query, format),
      suggestions: generateSuggestions(query),
      references: generateReferences(query)
    };
  };

  // Helper function to generate a title based on the query
  const generateTitle = (query, format) => {
    const formatTitles = {
      detailed: [`The Complete Guide to ${query}`, `Understanding ${query}: A Comprehensive Analysis`, `Exploring the World of ${query}`],
      listicle: [`Top 10 Things to Know About ${query}`, `7 Essential Facts About ${query}`, `5 Ways ${query} is Changing the World`],
      howTo: [`How to Master ${query} in 5 Steps`, `The Ultimate Guide to ${query}`, `${query} Made Simple: A Step-by-Step Guide`],
      comparison: [`${query} vs. Traditional Approaches: Which is Better?`, `Comparing Different Aspects of ${query}`, `The Pros and Cons of ${query}`],
      opinion: [`Why ${query} Matters More Than Ever`, `The Case For (or Against) ${query}`, `Rethinking Our Approach to ${query}`]
    };

    const titles = formatTitles[format] || formatTitles.detailed;
    return titles[Math.floor(Math.random() * titles.length)];
  };

  // Helper function to generate an outline based on the query and format
  const generateOutline = (query, format) => {
    const formatType = blogFormats[format];
    let outline = [];

    switch (format) {
      case 'detailed':
        outline = [
          { heading: 'Introduction', content: `Begin with an engaging hook about ${query}. Provide context and explain why this topic matters.` },
          { heading: 'Background', content: `Explore the history and development of ${query}. Discuss key concepts and terminology.` },
          { heading: 'Key Aspects of ' + query, content: 'Analyze the main components or characteristics.' },
          { heading: 'Current Trends', content: `Examine how ${query} is evolving and current developments in the field.` },
          { heading: 'Challenges and Opportunities', content: `Discuss obstacles and potential growth areas related to ${query}.` },
          { heading: 'Analysis', content: `Provide insights and interpretations about ${query} and its implications.` },
          { heading: 'Conclusion', content: `Summarize key points and offer final thoughts on the future of ${query}.` }
        ];
        break;

      case 'listicle':
        outline = [
          { heading: 'Introduction', content: `Brief overview of ${query} and why it's worth exploring.` },
          { heading: `1. The Fundamentals of ${query}`, content: 'Explain the basic concept.' },
          { heading: `2. History and Evolution of ${query}`, content: 'How it developed over time.' },
          { heading: `3. Key Benefits of ${query}`, content: 'Major advantages and positive impacts.' },
          { heading: `4. Common Misconceptions About ${query}`, content: 'Address and correct popular myths.' },
          { heading: `5. How to Get Started With ${query}`, content: 'Practical first steps for beginners.' },
          { heading: 'Summary', content: `Recap the main points about ${query} and provide a takeaway message.` }
        ];
        break;

      case 'howTo':
        outline = [
          { heading: 'Introduction', content: `Explain what ${query} is and why someone would want to learn it.` },
          { heading: 'Prerequisites', content: `What you need before getting started with ${query}.` },
          { heading: 'Step 1: Getting Started', content: 'The first step in the process.' },
          { heading: 'Step 2: Building Foundation', content: 'Establishing core knowledge or skills.' },
          { heading: 'Step 3: Advanced Techniques', content: 'Moving beyond the basics.' },
          { heading: 'Step 4: Troubleshooting Common Issues', content: 'Addressing problems that might arise.' },
          { heading: 'Tips for Success', content: `Advice for mastering ${query} more effectively.` },
          { heading: 'Conclusion', content: `Summarize the process and encourage readers to try ${query}.` }
        ];
        break;

      case 'comparison':
        outline = [
          { heading: 'Introduction', content: `Introduce ${query} and what will be compared.` },
          { heading: 'Overview of Options', content: 'Brief description of each alternative.' },
          { heading: 'Comparison Criteria', content: 'Explain the factors used for evaluation.' },
          { heading: 'Feature Comparison', content: 'Side-by-side analysis of key features.' },
          { heading: 'Performance Analysis', content: 'How each option performs in real-world scenarios.' },
          { heading: 'Cost Comparison', content: 'Analysis of pricing and value.' },
          { heading: 'Pros and Cons', content: 'Summary of advantages and disadvantages.' },
          { heading: 'Verdict', content: 'Final recommendation based on the comparison.' }
        ];
        break;

      case 'opinion':
        outline = [
          { heading: 'Introduction', content: `Present your thesis statement about ${query}.` },
          { heading: 'Background Context', content: `Relevant information about ${query} to frame your argument.` },
          { heading: 'Main Argument 1', content: 'First key point supporting your position.' },
          { heading: 'Main Argument 2', content: 'Second key point supporting your position.' },
          { heading: 'Main Argument 3', content: 'Third key point supporting your position.' },
          { heading: 'Addressing Counterarguments', content: 'Acknowledge and respond to opposing viewpoints.' },
          { heading: 'Conclusion', content: `Restate your position on ${query} and summarize your arguments.` }
        ];
        break;

      default:
        outline = [
          { heading: 'Introduction', content: `Begin with an engaging hook about ${query}.` },
          { heading: 'Main Content', content: 'Develop your ideas here.' },
          { heading: 'Conclusion', content: 'Summarize key points.' }
        ];
    }

    return outline;
  };

  // Generate content suggestions based on the query
  const generateSuggestions = (query) => {
    return [
      `Include recent statistics about ${query} to add credibility`,
      `Consider interviewing an expert in ${query} for unique insights`,
      `Add personal anecdotes related to ${query} to engage readers`,
      `Include visuals like charts or infographics to explain complex aspects of ${query}`,
      `Address common questions people have about ${query}`
    ];
  };

  // Generate references with more realistic data
  const generateReferences = (query) => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    const twoYearsAgo = currentYear - 2;

    // Create more realistic references based on the query topic
    return [
      {
        title: `The Evolution of ${query} in the Digital Era`,
        author: 'Anderson, J. & Smith, R.',
        year: `${currentYear}`,
        source: 'Journal of Digital Innovation',
        doi: `10.1080/14759.${currentYear}.1234567`
      },
      {
        title: `Understanding ${query}: A Comprehensive Analysis`,
        author: 'Johnson, B. et al.',
        year: `${lastYear}`,
        source: 'International Review of Technology',
        doi: `10.1016/j.techrev.${lastYear}.09.012`
      },
      {
        title: `${query} in Practice: Case Studies and Applications`,
        author: 'Williams, C. & Chen, L.',
        year: `${currentYear}`,
        source: 'Applied Research Quarterly',
        doi: `10.1007/s11528-${currentYear}-00689-x`
      },
      {
        title: `The Impact of ${query} on Modern Society`,
        author: 'Brown, D.',
        year: `${twoYearsAgo}`,
        source: 'Social Studies & Technology',
        doi: `10.1145/3173574.${twoYearsAgo}`
      }
    ];
  };

  // Generate full content for a blog post
  const generateFullContent = (query, format) => {
    const title = generateTitle(query, format);
    const outline = generateOutline(query, format);

    // Generate detailed content based on the outline
    let fullContent = `# ${title}\n\n`;

    // Add realistic content for each section
    outline.forEach(section => {
      fullContent += `## ${section.heading}\n\n`;

      // Generate 2-3 paragraphs of content for each section
      fullContent += generateSectionContent(query, section.heading, format);
      fullContent += '\n\n';
    });

    // Add references section
    const references = generateReferences(query);
    fullContent += `## References\n\n`;
    references.forEach(ref => {
      fullContent += `- ${ref.author} (${ref.year}). ${ref.title}. *${ref.source}*. ${ref.doi ? `DOI: ${ref.doi}` : ''}\n`;
    });

    return {
      title,
      content: fullContent,
      outline,
      references
    };
  };

  // Generate realistic content for each section
  const generateSectionContent = (query, heading, format) => {
    // Create more realistic, detailed content based on the heading and query
    let content = '';

    // Determine what kind of content to generate based on the heading
    if (heading.toLowerCase().includes('introduction')) {
      content = `In recent years, ${query} has emerged as a significant topic of interest across various domains. This article explores the key aspects of ${query}, its implications, and why it matters in today's rapidly evolving landscape.\n\n`;
      content += `Understanding ${query} is essential for professionals and enthusiasts alike, as it continues to shape how we approach problems and develop solutions in the field. This comprehensive guide aims to provide you with valuable insights and practical knowledge about ${query}.`;
    }
    else if (heading.toLowerCase().includes('background') || heading.toLowerCase().includes('history')) {
      content = `The concept of ${query} first emerged in the early 2000s, though its roots can be traced back to earlier developments in related fields. Initially, ${query} was primarily used in specialized contexts, but its applications have expanded significantly over time.\n\n`;
      content += `Several key milestones have marked the evolution of ${query}. In 2010, the first major breakthrough occurred when researchers demonstrated its practical applications in real-world scenarios. By 2015, ${query} had gained widespread recognition, leading to increased adoption across industries.`;
    }
    else if (heading.toLowerCase().includes('key aspects') || heading.toLowerCase().includes('fundamentals')) {
      content = `At its core, ${query} encompasses several fundamental principles that drive its functionality and applications. First, it relies on a systematic approach to problem-solving that integrates multiple perspectives and methodologies.\n\n`;
      content += `Second, ${query} emphasizes adaptability and scalability, allowing it to be implemented in various contexts with different requirements. Third, it prioritizes user-centered design, ensuring that solutions address real needs and provide tangible benefits.`;
    }
    else if (heading.toLowerCase().includes('trends') || heading.toLowerCase().includes('developments')) {
      content = `The landscape of ${query} is constantly evolving, with several notable trends shaping its trajectory. One significant development is the integration of artificial intelligence and machine learning capabilities, which has enhanced the precision and efficiency of ${query}-based solutions.\n\n`;
      content += `Another important trend is the growing emphasis on sustainability and ethical considerations in ${query} implementations. Organizations are increasingly recognizing the importance of responsible practices that minimize negative impacts while maximizing benefits.`;
    }
    else if (heading.toLowerCase().includes('challenges') || heading.toLowerCase().includes('issues')) {
      content = `Despite its numerous advantages, ${query} faces several challenges that must be addressed for continued growth and adoption. One major obstacle is the complexity of implementation, which often requires specialized knowledge and resources that may not be readily available.\n\n`;
      content += `Additionally, there are concerns regarding data privacy and security, particularly as ${query} applications often involve the collection and analysis of sensitive information. Regulatory frameworks are still catching up to the rapid pace of technological advancement in this area.`;
    }
    else if (heading.toLowerCase().includes('analysis') || heading.toLowerCase().includes('implications')) {
      content = `Analyzing the impact of ${query} reveals its far-reaching implications across various domains. In the business sector, organizations that have successfully implemented ${query} report significant improvements in efficiency, decision-making processes, and customer satisfaction.\n\n`;
      content += `From a societal perspective, ${query} has the potential to address pressing challenges in areas such as healthcare, education, and environmental conservation. However, realizing this potential requires thoughtful implementation and ongoing evaluation.`;
    }
    else if (heading.toLowerCase().includes('conclusion') || heading.toLowerCase().includes('summary')) {
      content = `In conclusion, ${query} represents a powerful approach with diverse applications and significant potential for positive impact. As we have explored throughout this article, its evolution continues to be shaped by technological advancements, changing user needs, and broader societal trends.\n\n`;
      content += `Looking ahead, the future of ${query} appears promising, with opportunities for innovation and refinement. By addressing current challenges and building on established strengths, ${query} will likely continue to play an important role in shaping solutions to complex problems.`;
    }
    else if (heading.toLowerCase().includes('step')) {
      // For how-to guides with steps
      const stepNumber = heading.match(/\d+/) ? heading.match(/\d+/)[0] : '1';
      content = `**Step ${stepNumber}** in mastering ${query} involves understanding the fundamental principles and establishing a solid foundation. Begin by familiarizing yourself with the basic concepts and terminology associated with ${query}.\n\n`;
      content += `To implement this step effectively, consider the following actions:\n\n`;
      content += `1. Research reputable sources to gain a comprehensive understanding of ${query}\n`;
      content += `2. Practice with simple examples to reinforce your learning\n`;
      content += `3. Connect with communities or forums where you can ask questions and share insights\n`;
      content += `4. Document your progress and insights for future reference`;
    }
    else if (heading.toLowerCase().includes('comparison') || heading.toLowerCase().includes('vs')) {
      content = `When comparing different approaches to ${query}, several key factors must be considered. Performance metrics indicate that newer methodologies often outperform traditional approaches in terms of efficiency and accuracy, though this can vary depending on the specific context and requirements.\n\n`;
      content += `Cost considerations also play a significant role in the comparison. While implementing ${query} may require initial investment, the long-term benefits often justify the expenditure through improved outcomes and reduced operational costs.`;
    }
    else if (heading.toLowerCase().includes('argument')) {
      // For opinion pieces with arguments
      content = `A compelling argument for the importance of ${query} lies in its potential to transform how we approach complex problems. By providing a structured framework for analysis and decision-making, ${query} enables more informed choices and better outcomes.\n\n`;
      content += `Evidence supporting this argument can be found in numerous case studies across industries, where the implementation of ${query} has led to measurable improvements in performance, user satisfaction, and overall results.`;
    }
    else {
      // Generic content for other sections
      content = `${query} encompasses various important aspects that merit careful consideration. Research indicates that understanding these elements is crucial for effective implementation and achieving desired outcomes.\n\n`;
      content += `Experts in the field emphasize the importance of a holistic approach to ${query}, taking into account both technical considerations and human factors. This balanced perspective ensures that solutions are not only theoretically sound but also practical and user-friendly.`;
    }

    return content;
  };

  // Insert the generated content into the blog editor
  const handleInsertContent = () => {
    if (!results) return;

    // Different handling based on content type
    let contentToInsert = '';

    if (contentType === 'outline') {
      contentToInsert = `# ${results.title}\n\n`;

      results.outline.forEach(section => {
        contentToInsert += `## ${section.heading}\n${section.content}\n\n`;
      });

      contentToInsert += '## References\n';
      results.references.forEach(ref => {
        contentToInsert += `- ${ref.author} (${ref.year}). ${ref.title}. *${ref.source}*. ${ref.doi ? `DOI: ${ref.doi}` : ''}\n`;
      });
    } else {
      // For full content, just use the generated content
      contentToInsert = results.content;
    }

    onInsertContent(contentToInsert);
  };

  return (
    <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-4 shadow-lg mb-6">
      <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
        <FaRobot className="text-purple-400" />
        Blog Research Assistant
      </h3>

      <div className="space-y-4">
        {/* Research Query Input */}
        <div>
          <label className="block text-gray-400 mb-2">What would you like to research?</label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a topic, question, or keyword..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pr-10 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            <button
              onClick={generateBlogContent}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-purple-400 hover:text-purple-300 disabled:text-gray-600"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
            </button>
          </div>
        </div>

        {/* Content Type Selection */}
        <div className="flex gap-3">
          <button
            onClick={() => setContentType('outline')}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
              contentType === 'outline'
                ? 'bg-purple-900/50 border border-purple-500 text-white'
                : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaFileAlt />
            <span>Generate Outline</span>
          </button>
          <button
            onClick={() => setContentType('full')}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
              contentType === 'full'
                ? 'bg-purple-900/50 border border-purple-500 text-white'
                : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaBrain />
            <span>Generate Full Content</span>
          </button>
        </div>

        {/* Blog Format Selection */}
        <div>
          <label className="block text-gray-400 mb-2">Select Blog Format</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.entries(blogFormats).map(([key, format]) => (
              <button
                key={key}
                onClick={() => setSelectedFormat(key)}
                className={`p-2 rounded-lg text-left ${
                  selectedFormat === key
                    ? 'bg-purple-900/50 border border-purple-500'
                    : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                }`}
              >
                <div className="font-medium text-white">{format.name}</div>
                <div className="text-xs text-gray-400">{format.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Results - Outline View */}
        {results && contentType === 'outline' && (
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-white">{results.title}</h4>
              <button
                onClick={handleInsertContent}
                className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm"
              >
                <FaClipboard className="text-xs" />
                Insert to Editor
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 max-h-80 overflow-y-auto">
              {results.outline.map((section, index) => (
                <div key={index} className="mb-3">
                  <h5 className="font-medium text-purple-400">{section.heading}</h5>
                  <p className="text-sm text-gray-300">{section.content}</p>
                </div>
              ))}
            </div>

            <div>
              <h5 className="font-medium text-white flex items-center gap-2 mb-2">
                <FaLightbulb className="text-yellow-400" />
                Content Suggestions
              </h5>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                {results.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Results - Full Content View */}
        {results && contentType === 'full' && (
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-white">{results.title}</h4>
              <button
                onClick={handleInsertContent}
                className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm"
              >
                <FaClipboard className="text-xs" />
                Insert to Editor
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="prose prose-invert max-w-none">
                {typingEffect.active ? (
                  <pre className="whitespace-pre-wrap font-sans text-gray-300">{typingEffect.text}</pre>
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-gray-300">{results.content}</pre>
                )}
              </div>
            </div>

            {/* Loading indicator for typing effect */}
            {typingEffect.active && (
              <div className="flex items-center gap-2 text-purple-400 text-sm">
                <FaSpinner className="animate-spin" />
                <span>AI is generating content...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogResearchAssistant;
