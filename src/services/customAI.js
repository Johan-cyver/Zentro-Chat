// Custom AI Service for Zentro Chat
// Replaces Gemini AI with our own intelligent assistant

class ZentroCustomAI {
  constructor() {
    this.conversationHistory = new Map(); // Store conversation history per user
    this.userMemory = new Map(); // Store user preferences and memory
    this.userPersonas = new Map(); // Store active persona per user
    this.userAchievements = new Map(); // Store user achievements and XP
    this.dailyPrompts = new Map(); // Store daily prompts per user
    this.userVibes = new Map(); // Store user energy/vibe patterns
    this.conversationStorage = new Map(); // Persistent conversation storage
    this.appKnowledge = this.initializeAppKnowledge(); // Zentro Chat knowledge base

    // Enhanced tracking and learning systems
    this.globalInteractions = new Map(); // Track all interactions across users
    this.learningData = new Map(); // Collective learning from user interactions
    this.searchQueries = new Map(); // Track search/research queries
    this.platformActions = new Map(); // Track platform feature usage
    this.contentSuggestions = new Map(); // AI-generated content suggestions
    this.userFeedback = new Map(); // User feedback on AI responses

    // Admin analytics
    this.analyticsData = {
      totalInteractions: 0,
      dailyActiveUsers: new Set(),
      popularQueries: new Map(),
      featureUsage: new Map(),
      userSatisfaction: new Map(),
      learningProgress: new Map()
    };

    // Initialize from localStorage on startup
    this.loadFromStorage();

    // Auto-save every 30 seconds
    setInterval(() => this.saveToStorage(), 30000);

    // Daily analytics reset
    setInterval(() => this.resetDailyAnalytics(), 24 * 60 * 60 * 1000);
  }

  // Initialize comprehensive knowledge about Zentro Chat
  initializeAppKnowledge() {
    return {
      features: {
        messaging: {
          description: "Real-time messaging with DMs, group chats, and voice messages",
          capabilities: ["Text messaging", "Voice messages", "Media sharing", "Emoji reactions", "Message editing", "Reply functionality"]
        },
        smartProfile: {
          description: "Customizable user profiles with professional and personal views",
          capabilities: ["Profile customization", "Professional toggle", "Skills showcase", "Activity tracking", "Privacy controls"]
        },
        blog: {
          description: "Integrated blogging platform with AI assistance",
          capabilities: ["Blog creation", "AI research assistant", "Content generation", "Public/private posts", "Comments system", "Likes and engagement"]
        },
        music: {
          description: "In-app music player with comprehensive search and controls",
          capabilities: ["Music search", "Playlist creation", "Play controls", "Genre exploration", "Favorites management"]
        },
        talentDirectory: {
          description: "Professional networking and talent discovery",
          capabilities: ["Professional profiles", "Skill-based search", "Recruiter tools", "Portfolio showcase", "Networking features"]
        },
        themes: {
          description: "Customizable UI themes and appearance",
          capabilities: ["Dark/light modes", "Neon themes", "Color customization", "Futuristic styling", "Accessibility options"]
        },
        aiAssistant: {
          description: "Zentro Bot - Native AI assistant with app knowledge",
          capabilities: ["App guidance", "Feature explanations", "Content creation help", "Technical assistance", "Personalized recommendations"]
        }
      },
      navigation: {
        appHub: "Main dashboard with access to all features",
        dms: "Direct messaging interface",
        blog: "Blogging platform and content creation",
        music: "Music player and discovery",
        talentDirectory: "Professional networking hub",
        smartProfile: "User profile management"
      },
      userTypes: {
        general: "Regular users exploring social features",
        professional: "Users focused on networking and career development",
        creative: "Content creators and bloggers",
        developer: "Technical users interested in coding features"
      }
    };
  }

  // Enhanced system prompt for GPT-like behavior
  get systemPrompt() {
    return `You are Zentro Bot, an advanced AI assistant built specifically for Zentro Chat. You combine the intelligence of modern AI with deep knowledge of the Zentro Chat ecosystem.

🧠 YOUR INTELLIGENCE LEVEL:
- Think step-by-step through complex problems
- Provide detailed, well-reasoned explanations
- Ask clarifying questions when needed
- Offer multiple solutions and perspectives
- Learn from each interaction to improve

🎯 YOUR CORE CAPABILITIES:
- Expert knowledge of all Zentro Chat features and integrations
- Advanced content creation and blog optimization
- Profile enhancement and professional networking guidance
- Real-time platform control and feature management
- Mini search engine for research and fact-finding
- Continuous learning from user interactions across the platform

🏠 ZENTRO CHAT MASTERY:
- Smart Profile Panel: Complete customization, professional optimization, visibility controls
- DM System: Advanced messaging, media sharing, voice integration, group management
- Blog Platform: Content creation, SEO optimization, audience engagement, publishing strategies
- Music Player: Discovery algorithms, playlist curation, social sharing integration
- Talent Directory: Professional networking, skill matching, recruiter connections
- Themes & UI: Customization, accessibility, user experience optimization

💬 COMMUNICATION EXCELLENCE:
- Communicate like a knowledgeable friend who happens to be an expert
- Adapt your tone and complexity to match the user's needs
- Provide actionable advice with clear next steps
- Use examples and analogies to explain complex concepts
- Be honest about limitations and uncertainties

🔧 PLATFORM INTEGRATION:
- Can directly suggest profile improvements and blog optimizations
- Provide real-time guidance on feature usage
- Help users discover and utilize advanced platform capabilities
- Offer personalized recommendations based on user behavior
- Facilitate connections between users with similar interests

⚠️ TRANSPARENCY:
- Always mention when information might not be 100% accurate
- Suggest verification for important decisions
- Acknowledge when you're functioning as a search engine vs. giving expert advice
- Be clear about the difference between Zentro Chat facts and general knowledge

🌟 YOUR MISSION:
Help users get the absolute most out of Zentro Chat while providing intelligent, helpful, and honest assistance for any topic they need help with.`;
  }

  // Persona definitions
  getPersonaInfo(persona) {
    const personas = {
      chill_friend: {
        name: "Chill Friend",
        emoji: "😎",
        tone: "Relaxed, casual, and supportive. Uses casual language and is great for general conversations.",
        specialties: ["General chat", "App exploration", "Casual advice", "Feature discovery"]
      },
      study_buddy: {
        name: "Study Buddy",
        emoji: "📚",
        tone: "Focused, encouraging, and educational. Helps with learning and productivity.",
        specialties: ["Learning assistance", "Blog writing", "Research help", "Skill development"]
      },
      journal_coach: {
        name: "Journal Coach",
        emoji: "✍️",
        tone: "Reflective, thoughtful, and encouraging. Great for personal growth and blogging.",
        specialties: ["Blog creation", "Personal reflection", "Content ideas", "Writing improvement"]
      },
      hype_bot: {
        name: "Hype Bot",
        emoji: "🚀",
        tone: "Energetic, motivational, and enthusiastic. Pumps you up and celebrates achievements.",
        specialties: ["Motivation", "Achievement celebration", "Goal setting", "Energy boost"]
      },
      content_reviewer: {
        name: "Content Reviewer",
        emoji: "🔍",
        tone: "Analytical, detailed, and constructive. Helps improve and optimize content.",
        specialties: ["Content review", "Blog optimization", "SEO tips", "Quality improvement"]
      }
    };

    return personas[persona] || personas.chill_friend;
  }

  // Get user's current persona
  getPersona(userId) {
    return this.userPersonas.get(userId) || 'chill_friend';
  }

  // Set user's persona
  setPersona(userId, persona) {
    this.userPersonas.set(userId, persona);
    this.saveToStorage();
  }

  // Get conversation history for a user
  getConversationHistory(userId) {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    return this.conversationHistory.get(userId);
  }

  // Clear conversation history
  clearHistory(userId) {
    this.conversationHistory.set(userId, []);
    this.saveToStorage();
  }

  // Persistent Storage Methods
  loadFromStorage() {
    try {
      // Load conversation history
      const savedConversations = localStorage.getItem('zentro_custom_ai_conversations');
      if (savedConversations) {
        const conversations = JSON.parse(savedConversations);
        Object.entries(conversations).forEach(([userId, history]) => {
          this.conversationHistory.set(userId, history);
        });
      }

      // Load user memory
      const savedMemory = localStorage.getItem('zentro_custom_ai_memory');
      if (savedMemory) {
        const memory = JSON.parse(savedMemory);
        Object.entries(memory).forEach(([userId, data]) => {
          this.userMemory.set(userId, data);
        });
      }

      // Load user personas
      const savedPersonas = localStorage.getItem('zentro_custom_ai_personas');
      if (savedPersonas) {
        const personas = JSON.parse(savedPersonas);
        Object.entries(personas).forEach(([userId, persona]) => {
          this.userPersonas.set(userId, persona);
        });
      }

      // Load user vibes
      const savedVibes = localStorage.getItem('zentro_custom_ai_vibes');
      if (savedVibes) {
        const vibes = JSON.parse(savedVibes);
        Object.entries(vibes).forEach(([userId, data]) => {
          this.userVibes.set(userId, data);
        });
      }

      console.log('✅ Custom AI: Loaded all data from storage');
    } catch (error) {
      console.error('❌ Custom AI: Error loading from storage:', error);
    }
  }

  saveToStorage() {
    try {
      // Save conversation history
      const conversations = {};
      this.conversationHistory.forEach((history, userId) => {
        conversations[userId] = history;
      });
      localStorage.setItem('zentro_custom_ai_conversations', JSON.stringify(conversations));

      // Save user memory
      const memory = {};
      this.userMemory.forEach((data, userId) => {
        memory[userId] = data;
      });
      localStorage.setItem('zentro_custom_ai_memory', JSON.stringify(memory));

      // Save user personas
      const personas = {};
      this.userPersonas.forEach((persona, userId) => {
        personas[userId] = persona;
      });
      localStorage.setItem('zentro_custom_ai_personas', JSON.stringify(personas));

      // Save user vibes
      const vibes = {};
      this.userVibes.forEach((data, userId) => {
        vibes[userId] = data;
      });
      localStorage.setItem('zentro_custom_ai_vibes', JSON.stringify(vibes));

      console.log('💾 Custom AI: Saved all data to storage');
    } catch (error) {
      console.error('❌ Custom AI: Error saving to storage:', error);
    }
  }

  // Add message to conversation history
  addToHistory(userId, role, content) {
    const history = this.getConversationHistory(userId);
    history.push({ role, content, timestamp: new Date().toISOString() });

    // Keep only last 20 messages to manage context length
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    this.conversationHistory.set(userId, history);

    // Update user memory based on conversation
    this.updateUserMemory(userId, content, role);

    // Update user vibe analysis
    this.updateUserVibe(userId, content, role);

    // Save to persistent storage
    this.saveToStorage();
  }

  // Memory System - Store user preferences and patterns
  updateUserMemory(userId, content, role) {
    if (!this.userMemory.has(userId)) {
      this.userMemory.set(userId, {
        preferences: {},
        interests: [],
        favoriteTopics: [],
        conversationPatterns: [],
        lastActive: new Date().toISOString(),
        totalMessages: 0,
        achievements: []
      });
    }

    const memory = this.userMemory.get(userId);
    memory.lastActive = new Date().toISOString();

    if (role === 'user') {
      memory.totalMessages++;

      // Analyze content for interests and preferences
      const lowerContent = content.toLowerCase();

      // Track topic interests
      const topics = ['music', 'blog', 'coding', 'photography', 'gaming', 'art', 'travel', 'food', 'zentro', 'profile', 'messaging'];
      topics.forEach(topic => {
        if (lowerContent.includes(topic) && !memory.favoriteTopics.includes(topic)) {
          memory.favoriteTopics.push(topic);
        }
      });

      // Track conversation patterns
      memory.conversationPatterns.push({
        timestamp: new Date().toISOString(),
        length: content.length,
        hasQuestion: content.includes('?'),
        sentiment: this.analyzeSentiment(content)
      });

      // Keep only last 10 patterns
      if (memory.conversationPatterns.length > 10) {
        memory.conversationPatterns.shift();
      }
    }

    this.userMemory.set(userId, memory);
  }

  // Simple sentiment analysis
  analyzeSentiment(text) {
    const positiveWords = ['good', 'great', 'awesome', 'love', 'like', 'amazing', 'fantastic', 'excellent', 'wonderful', 'happy', 'excited'];
    const negativeWords = ['bad', 'hate', 'terrible', 'awful', 'sad', 'angry', 'frustrated', 'annoying', 'boring', 'disappointed'];

    const lowerText = text.toLowerCase();
    let score = 0;

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score += 1;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score -= 1;
    });

    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  // Vibe Matching & Energy Tuning System
  updateUserVibe(userId, content, role) {
    if (role !== 'user') return;

    if (!this.userVibes.has(userId)) {
      this.userVibes.set(userId, {
        energyLevel: 'medium',
        communicationStyle: 'casual',
        emojiUsage: 'moderate',
        responseLength: 'medium',
        enthusiasm: 'balanced',
        recentVibes: [],
        lastUpdated: new Date().toISOString()
      });
    }

    const vibe = this.userVibes.get(userId);
    const analysis = this.analyzeMessageVibe(content);

    // Add to recent vibes (keep last 5)
    vibe.recentVibes.push({
      ...analysis,
      timestamp: new Date().toISOString()
    });

    if (vibe.recentVibes.length > 5) {
      vibe.recentVibes.shift();
    }

    // Update overall vibe based on recent patterns
    this.updateOverallVibe(vibe);
    vibe.lastUpdated = new Date().toISOString();

    this.userVibes.set(userId, vibe);
  }

  // Analyze individual message vibe
  analyzeMessageVibe(content) {
    const length = content.length;
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
    const exclamationCount = (content.match(/!/g) || []).length;
    const questionCount = (content.match(/\?/g) || []).length;
    const capsCount = (content.match(/[A-Z]/g) || []).length;

    // Energy indicators
    const energyWords = ['excited', 'amazing', 'awesome', 'love', 'wow', 'omg', 'yes', 'cool'];
    const lowEnergyWords = ['tired', 'meh', 'okay', 'fine', 'whatever', 'boring'];

    let energyScore = 0;
    energyWords.forEach(word => {
      if (content.toLowerCase().includes(word)) energyScore += 1;
    });
    lowEnergyWords.forEach(word => {
      if (content.toLowerCase().includes(word)) energyScore -= 1;
    });

    // Communication style indicators
    const casualWords = ['hey', 'yo', 'sup', 'lol', 'haha', 'gonna', 'wanna'];
    const formalWords = ['please', 'thank you', 'certainly', 'however', 'therefore'];

    let styleScore = 0;
    casualWords.forEach(word => {
      if (content.toLowerCase().includes(word)) styleScore += 1;
    });
    formalWords.forEach(word => {
      if (content.toLowerCase().includes(word)) styleScore -= 1;
    });

    return {
      energyLevel: energyScore > 2 ? 'high' : energyScore < -1 ? 'low' : 'medium',
      emojiUsage: emojiCount > 2 ? 'high' : emojiCount === 0 ? 'low' : 'moderate',
      enthusiasm: exclamationCount > 1 ? 'high' : exclamationCount === 0 ? 'low' : 'medium',
      responseLength: length > 100 ? 'long' : length < 20 ? 'short' : 'medium',
      communicationStyle: styleScore > 0 ? 'casual' : styleScore < 0 ? 'formal' : 'neutral',
      punctuationIntensity: exclamationCount + questionCount + (capsCount / 10)
    };
  }

  updateOverallVibe(vibe) {
    if (vibe.recentVibes.length === 0) return;

    // Calculate averages from recent vibes
    const recent = vibe.recentVibes;

    // Energy level (most common)
    const energyLevels = recent.map(v => v.energyLevel);
    vibe.energyLevel = this.getMostCommon(energyLevels);

    // Communication style (most common)
    const styles = recent.map(v => v.communicationStyle);
    vibe.communicationStyle = this.getMostCommon(styles);

    // Emoji usage (most common)
    const emojiUsages = recent.map(v => v.emojiUsage);
    vibe.emojiUsage = this.getMostCommon(emojiUsages);

    // Enthusiasm (most common)
    const enthusiasms = recent.map(v => v.enthusiasm);
    vibe.enthusiasm = this.getMostCommon(enthusiasms);

    // Response length (most common)
    const lengths = recent.map(v => v.responseLength);
    vibe.responseLength = this.getMostCommon(lengths);
  }

  getMostCommon(arr) {
    const counts = {};
    arr.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
    });

    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  // Get user vibe data
  getUserVibe(userId) {
    return this.userVibes.get(userId) || {
      energyLevel: 'medium',
      communicationStyle: 'casual',
      emojiUsage: 'moderate',
      responseLength: 'medium',
      enthusiasm: 'balanced'
    };
  }

  // Get user stats for gamification
  getUserStats(userId) {
    const memory = this.userMemory.get(userId);
    if (!memory) return null;

    const level = Math.floor(memory.totalMessages / 10) + 1;
    const xp = memory.totalMessages * 10;
    const achievements = memory.achievements.length;

    return {
      level,
      xp,
      achievements,
      totalMessages: memory.totalMessages,
      favoriteTopics: memory.favoriteTopics
    };
  }

  // Achievement system
  checkAchievements(userId, message) {
    const memory = this.userMemory.get(userId);
    if (!memory) return [];

    const newAchievements = [];

    // First message achievement
    if (memory.totalMessages === 1) {
      newAchievements.push({
        id: 'first_message',
        title: 'First Steps',
        description: 'Sent your first message to Zentro Bot!',
        emoji: '🎉',
        timestamp: new Date().toISOString()
      });
    }

    // Milestone achievements
    const milestones = [10, 25, 50, 100];
    milestones.forEach(milestone => {
      if (memory.totalMessages === milestone) {
        newAchievements.push({
          id: `messages_${milestone}`,
          title: `Chatter Level ${milestone}`,
          description: `Sent ${milestone} messages to Zentro Bot!`,
          emoji: milestone >= 100 ? '🏆' : milestone >= 50 ? '🥇' : '⭐',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Topic exploration achievements
    if (memory.favoriteTopics.length >= 5) {
      const explorerAchievement = memory.achievements.find(a => a.id === 'topic_explorer');
      if (!explorerAchievement) {
        newAchievements.push({
          id: 'topic_explorer',
          title: 'Topic Explorer',
          description: 'Explored 5 different topics!',
          emoji: '🔍',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Add new achievements to memory
    if (newAchievements.length > 0) {
      memory.achievements.push(...newAchievements);
      this.userMemory.set(userId, memory);
    }

    return newAchievements;
  }

  // Build conversation context with mood and persona awareness
  buildConversationContext(userId, newMessage, userProfile = null) {
    const history = this.getConversationHistory(userId);
    const memory = this.userMemory.get(userId);
    const currentPersona = this.getPersonaInfo(this.getPersona(userId));
    const userVibe = this.getUserVibe(userId);

    let context = this.systemPrompt;

    // Add persona context
    context += `\n\n🎭 CURRENT PERSONA: ${currentPersona.name} ${currentPersona.emoji}`;
    context += `\nPersonality: ${currentPersona.tone}`;
    context += `\nSpecialties: ${currentPersona.specialties.join(', ')}`;

    // Add user vibe matching
    context += `\n\n🎯 USER VIBE ANALYSIS:`;
    context += `\nEnergy Level: ${userVibe.energyLevel}`;
    context += `\nCommunication Style: ${userVibe.communicationStyle}`;
    context += `\nEmoji Usage: ${userVibe.emojiUsage}`;
    context += `\nPreferred Response Length: ${userVibe.responseLength}`;
    context += `\nEnthusiasm Level: ${userVibe.enthusiasm}`;

    // Add user memory and interests
    if (memory && memory.favoriteTopics.length > 0) {
      context += `\n\n💭 USER INTERESTS: ${memory.favoriteTopics.join(', ')}`;
    }

    // Add user profile context if available
    if (userProfile) {
      context += `\n\n👤 USER PROFILE:`;
      context += `\nName: ${userProfile.displayName || 'User'}`;
      if (userProfile.email) context += `\nEmail: ${userProfile.email}`;
    }

    // Add conversation history (last 10 messages)
    if (history.length > 0) {
      context += `\n\n📝 RECENT CONVERSATION:`;
      const recentHistory = history.slice(-10);
      recentHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'Zentro Bot';
        context += `\n${role}: ${msg.content}`;
      });
    }

    // Add current message
    context += `\n\nUser: ${newMessage}`;

    // Add response guidelines based on vibe
    context += `\n\n🎨 RESPONSE GUIDELINES:`;
    context += `\n- Match the user's ${userVibe.energyLevel} energy level`;
    context += `\n- Use ${userVibe.emojiUsage} emoji usage`;
    context += `\n- Keep responses ${userVibe.responseLength} in length`;
    context += `\n- Match their ${userVibe.communicationStyle} communication style`;
    context += `\n- Show ${userVibe.enthusiasm} enthusiasm`;

    return context;
  }

  // Generate AI response using our custom logic
  async generateResponse(userId, message, options = {}) {
    try {
      const context = this.buildConversationContext(userId, message, options.userProfile);
      const userVibe = this.getUserVibe(userId);
      const currentPersona = this.getPersonaInfo(this.getPersona(userId));

      // Check if message is about Zentro Chat features
      const zentroResponse = this.handleZentroSpecificQuery(message, userVibe, currentPersona);
      if (zentroResponse) {
        return zentroResponse;
      }

      // Generate contextual response based on message content
      const response = this.generateContextualResponse(message, userVibe, currentPersona, options.userProfile);

      return response;

    } catch (error) {
      console.error('Custom AI Error:', error);
      return this.getFallbackResponse(message);
    }
  }

  // Enhanced Zentro Chat specific queries with control capabilities
  handleZentroSpecificQuery(message, userVibe, persona) {
    const lowerMessage = message.toLowerCase();

    // Blog optimization and control
    if (lowerMessage.includes('optimize') && lowerMessage.includes('blog')) {
      return this.formatResponse(`🚀 **Blog Optimization Assistant**

I can help you optimize your blog content for maximum engagement! Here's what I can do:

**Content Enhancement:**
• **SEO Optimization:** Improve titles, meta descriptions, and keyword usage
• **Structure Analysis:** Organize content with proper headings and flow
• **Readability:** Enhance clarity and engagement
• **Call-to-Actions:** Add compelling CTAs to drive interaction

**Zentro Chat Integration:**
• **Cross-Platform Promotion:** Share your blog across DMs and profile
• **Community Engagement:** Connect with readers through comments
• **Professional Networking:** Showcase expertise in Talent Directory

**AI-Powered Suggestions:**
• **Topic Ideas:** Based on trending discussions in Zentro Chat
• **Content Expansion:** Turn short posts into comprehensive guides
• **Series Planning:** Create connected content that builds audience

Would you like me to analyze a specific blog post or help you create optimized content from scratch?

*I can provide real-time suggestions as you write!*`, userVibe, persona);
    }

    // Profile enhancement
    if (lowerMessage.includes('improve') && (lowerMessage.includes('profile') || lowerMessage.includes('professional'))) {
      return this.formatResponse(`💼 **Smart Profile Enhancement**

Let me help you create a standout profile that attracts the right opportunities!

**Professional Optimization:**
• **Headline Crafting:** Create compelling professional summaries
• **Skills Showcase:** Highlight your expertise effectively
• **Experience Presentation:** Structure your background for impact
• **Achievement Highlighting:** Showcase your accomplishments

**Personal Branding:**
• **Bio Writing:** Craft engaging personal descriptions
• **Visual Consistency:** Coordinate profile aesthetics
• **Interest Alignment:** Connect personal and professional interests
• **Authenticity Balance:** Maintain genuine personality

**Zentro Chat Advantages:**
• **Dual View Toggle:** Optimize both personal and professional presentations
• **Content Integration:** Link your blog posts and achievements
• **Network Building:** Connect with relevant professionals
• **Visibility Control:** Manage who sees what information

**Next Steps:**
1. Share your current profile details
2. Tell me your career goals or interests
3. I'll provide specific, actionable improvements

Ready to make your profile irresistible to opportunities?`, userVibe, persona);
    }

    // Navigation help with enhanced guidance
    if (lowerMessage.includes('navigate') || lowerMessage.includes('find') || lowerMessage.includes('where')) {
      if (lowerMessage.includes('blog')) {
        return this.formatResponse(`📝 **Blog Navigation & Features**

**Getting There:**
• Click 'Blog' in the main AppHub navigation
• Or use the quick access from your Smart Profile Panel

**What You Can Do:**
• **Create Posts:** Full editor with AI assistance
• **Research Mode:** I can help gather information and sources
• **SEO Optimization:** Built-in tools for better visibility
• **Community Engagement:** Comments, likes, and sharing
• **Content Planning:** I can suggest topics and series ideas

**Pro Tips:**
• Use the AI research assistant for fact-checking
• Enable public visibility for maximum reach
• Cross-promote through your profile and DMs
• Engage with other creators for community building

Want me to walk you through creating your first optimized blog post?`, userVibe, persona);
      }
      if (lowerMessage.includes('music')) {
        return this.formatResponse(`🎵 **Music Player Guide**

**Location:** Music section in AppHub

**Advanced Features:**
• **Smart Search:** Find any song, artist, or genre instantly
• **Playlist Creation:** Build collections for different moods
• **Social Integration:** Share discoveries with your network
• **Background Play:** Music continues while you chat and browse
• **Mood Matching:** I can suggest music based on your current activity

**Integration Benefits:**
• **Profile Enhancement:** Showcase your musical taste
• **Content Creation:** Find inspiration music for writing
• **Social Connections:** Connect with others who share your taste
• **Productivity:** Perfect background for focused work

What kind of musical experience are you looking for? I can provide personalized recommendations!`, userVibe, persona);
      }
      if (lowerMessage.includes('profile')) {
        return this.formatResponse(`👤 **Smart Profile Panel Mastery**

**Access:** Main menu → Smart Profile Panel

**Key Features:**
• **Professional Toggle:** Switch between personal and professional views
• **Customization Hub:** Photos, banners, bios, skills
• **Privacy Controls:** Manage visibility (public, recruiters, friends)
• **Content Integration:** Link blogs, achievements, interests

**Optimization Opportunities:**
• **Professional View:** Perfect for networking and career opportunities
• **Personal View:** Showcase interests, hobbies, and personality
• **Cross-Platform Presence:** Integrate with blog and messaging
• **Dynamic Updates:** Keep content fresh and engaging

**I Can Help You:**
• Craft compelling bios for both views
• Optimize for your target audience
• Suggest content that showcases your expertise
• Plan your professional brand strategy

Ready to transform your profile into a powerful networking tool?`, userVibe, persona);
      }
      if (lowerMessage.includes('dm') || lowerMessage.includes('message')) {
        return this.formatResponse(`💬 **Advanced Messaging Features**

**Location:** DMs section in main navigation

**Enhanced Capabilities:**
• **Rich Media:** Voice messages, images, files, reactions
• **Smart Features:** Message editing, reply threading, search
• **Integration:** Share blog posts, music, profile content
• **Professional Networking:** Connect with talent directory contacts

**Communication Excellence:**
• **Context Awareness:** I can help craft professional messages
• **Follow-up Strategies:** Maintain meaningful conversations
• **Network Building:** Suggestions for valuable connections
• **Content Sharing:** Promote your blog and achievements

**Pro Tips:**
• Use voice messages for personal touch
• Share your blog content for thought leadership
• React to messages to maintain engagement
• Leverage professional view for business communications

Want help crafting the perfect message for a specific situation?`, userVibe, persona);
      }
    }

    // Enhanced feature explanations with actionable guidance
    if (lowerMessage.includes('how to') || lowerMessage.includes('how do')) {
      if (lowerMessage.includes('blog')) {
        return this.formatResponse(`📝 **Complete Blog Creation Guide**

**Step-by-Step Process:**
1. **Navigate:** Blog section → 'Create Post'
2. **Planning:** I can help brainstorm topics and structure
3. **Research:** Use my mini search engine for information gathering
4. **Writing:** AI-assisted content creation with real-time suggestions
5. **Optimization:** SEO tips, readability improvements, engagement hooks
6. **Publishing:** Choose visibility settings and promotion strategy

**AI Assistance Available:**
• **Topic Generation:** Based on your interests and trending discussions
• **Content Structure:** Organize ideas into compelling narratives
• **Research Support:** Fact-checking and source suggestions
• **SEO Optimization:** Keywords, meta descriptions, titles
• **Engagement Strategy:** CTAs, social sharing, community building

**Zentro Chat Advantages:**
• **Integrated Audience:** Built-in community of readers
• **Cross-Platform Promotion:** Share via DMs and profile
• **Professional Networking:** Showcase expertise to recruiters
• **Real-time Feedback:** Comments and engagement tracking

Ready to create your first viral blog post? I'll guide you through each step!`, userVibe, persona);
      }
      if (lowerMessage.includes('theme') || lowerMessage.includes('customize')) {
        return this.formatResponse(`🎨 **Complete Customization Guide**

**Theme Options:**
• **Futuristic Neon:** Cutting-edge cyberpunk aesthetics
• **Professional Dark:** Sleek business-focused design
• **Creative Bright:** Vibrant colors for creative expression
• **Minimalist Clean:** Simple, distraction-free interface

**Customization Levels:**
• **Color Schemes:** Primary, secondary, accent colors
• **Typography:** Font choices for readability and style
• **Layout Options:** Sidebar preferences, content density
• **Accessibility:** High contrast, font size, motion settings

**Profile Integration:**
• **Consistent Branding:** Match your profile aesthetic
• **Professional Presentation:** Themes that enhance credibility
• **Personal Expression:** Reflect your personality and interests
• **Mood Adaptation:** Change themes based on your current vibe

**I Can Help:**
• Recommend themes based on your goals
• Suggest color combinations that work
• Optimize for your target audience
• Create cohesive visual branding

What kind of impression do you want to make? I'll suggest the perfect customization strategy!`, userVibe, persona);
      }
      if (lowerMessage.includes('professional') || lowerMessage.includes('talent')) {
        return this.formatResponse(`💼 **Professional Networking Mastery**

**Talent Directory Strategy:**
• **Profile Optimization:** Craft compelling professional presence
• **Skill Showcase:** Highlight expertise with evidence
• **Portfolio Integration:** Link blog posts and achievements
• **Visibility Management:** Control who sees your professional info

**Networking Approach:**
• **Strategic Connections:** I can suggest valuable contacts
• **Message Crafting:** Professional outreach that gets responses
• **Thought Leadership:** Use blog platform to demonstrate expertise
• **Opportunity Tracking:** Monitor recruiter interest and engagement

**Professional Brand Building:**
• **Content Strategy:** Blog topics that showcase expertise
• **Engagement Tactics:** Meaningful interactions with industry peers
• **Reputation Management:** Consistent professional presentation
• **Growth Tracking:** Monitor network expansion and opportunities

**Advanced Features:**
• **Recruiter Tools:** Enhanced visibility for job opportunities
• **Skill Verification:** Community endorsements and validations
• **Project Showcases:** Detailed portfolio presentations
• **Industry Insights:** Connect with trends and thought leaders

Ready to transform your professional presence? I'll create a personalized networking strategy for you!`, userVibe, persona);
      }
    }

    // Enhanced app features overview with actionable next steps
    if (lowerMessage.includes('what can') || lowerMessage.includes('features') || lowerMessage.includes('zentro')) {
      return this.formatResponse(`🚀 **Zentro Chat: Your Complete Digital Ecosystem**

**🏠 Core Platform Features:**
• **Smart Messaging:** Advanced DMs with voice, media, and reactions
• **AI-Powered Blogging:** Content creation with research assistance
• **Integrated Music Player:** Discover and share your soundtrack
• **Smart Profile Panel:** Dual personal/professional presentation
• **Talent Directory:** Professional networking and opportunity discovery
• **Futuristic Themes:** Customizable aesthetics and user experience

**🤖 AI Integration (That's Me!):**
• **Content Creation:** Blog writing, optimization, and research
• **Profile Enhancement:** Professional branding and optimization
• **Networking Assistance:** Message crafting and connection strategies
• **Platform Guidance:** Feature tutorials and best practices
• **Learning & Adaptation:** Continuous improvement from interactions

**🎯 What Makes Us Different:**
• **Unified Experience:** Everything in one platform
• **AI-Native Design:** Intelligence built into every feature
• **Privacy-First:** Your data stays secure and local
• **Community-Driven:** Real connections and meaningful interactions
• **Professional Focus:** Career growth and networking tools

**🚀 Ready to Get Started?**
1. **Optimize Your Profile:** Let me help create a standout presence
2. **Create Your First Blog:** I'll guide you through viral content creation
3. **Build Your Network:** Strategic connections and professional growth
4. **Customize Your Experience:** Themes and settings that reflect you

What would you like to tackle first? I'm here to make your Zentro Chat experience extraordinary!`, userVibe, persona);
    }

    return null; // No specific Zentro query detected
  }

  // Enhanced GPT-like contextual response generation
  generateContextualResponse(message, userVibe, persona, userProfile) {
    const lowerMessage = message.toLowerCase();

    // Track this interaction for learning
    this.trackInteraction(userProfile?.uid, message, 'contextual_query');

    // Check if this is a search/research query
    if (this.isSearchQuery(message)) {
      return this.handleSearchQuery(message, userVibe, persona);
    }

    // Enhanced greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      const userName = userProfile?.displayName ? `, ${userProfile.displayName.split(' ')[0]}` : '';
      const greetings = [
        `Hello${userName}! 👋 I'm Zentro Bot, your AI assistant. I'm here to help you with anything - from navigating Zentro Chat features to answering questions about virtually any topic. What would you like to explore today?`,
        `Hi there${userName}! 😊 Great to see you! I can help you with Zentro Chat features, create content, answer questions, or just have a conversation. What's on your mind?`,
        `Hey${userName}! 🌟 I'm your personal AI assistant built right into Zentro Chat. I know this platform inside and out, plus I can help with general questions too. How can I assist you today?`,
        `Welcome${userName}! 🚀 I'm here to make your Zentro Chat experience amazing and help with any questions you might have. What would you like to know or do?`
      ];
      return this.formatResponse(this.getRandomItem(greetings), userVibe, persona);
    }

    // Enhanced help requests with step-by-step thinking
    if (lowerMessage.includes('help') || lowerMessage.includes('assist') || lowerMessage.includes('support')) {
      return this.formatResponse(`I'm here to help! 🤝 Let me break down what I can assist you with:

**🏠 Zentro Chat Features:**
• Smart Profile optimization and professional networking
• Blog creation, editing, and SEO optimization
• Music discovery and playlist management
• DM features and communication tools
• Theme customization and UI preferences

**🧠 General Assistance:**
• Research and fact-finding (I'll let you know when I'm uncertain)
• Writing and content creation
• Technical questions and coding help
• Creative projects and brainstorming
• Learning and educational support

**💡 What I'm great at:**
• Step-by-step explanations
• Multiple solution approaches
• Personalized recommendations based on your usage

What specific area interests you most? I can dive deeper into any of these topics!

*Note: While I strive for accuracy, I recommend verifying important information from authoritative sources.*`, userVibe, persona);
    }

    // Enhanced coding/technical responses
    if (lowerMessage.includes('code') || lowerMessage.includes('programming') || lowerMessage.includes('develop') || lowerMessage.includes('technical')) {
      return this.formatResponse(`I love diving into technical topics! 💻 Let me help you with that.

**What I can assist with:**
• **Debugging:** Walk through problems step-by-step
• **Architecture:** Discuss design patterns and best practices
• **Learning:** Recommend resources and learning paths
• **Code Review:** Analyze code structure and suggest improvements
• **Project Ideas:** Brainstorm and plan technical projects

**Zentro Chat Integration:**
You could document your coding journey through our blog platform! It's great for:
• Technical tutorials and how-tos
• Project showcases and case studies
• Connecting with other developers in our community

What specific technical challenge are you working on? I can provide detailed guidance and multiple approaches to solve it.

*Disclaimer: While I aim to provide accurate technical advice, always test thoroughly and consult official documentation for production code.*`, userVibe, persona);
    }

    // Enhanced creative/writing assistance
    if (lowerMessage.includes('write') || lowerMessage.includes('creative') || lowerMessage.includes('story') || lowerMessage.includes('content')) {
      return this.formatResponse(`I'd love to help with your creative writing! ✍️ Let's explore what you're looking to create.

**Content Creation Support:**
• **Blog Posts:** Structure, SEO optimization, engagement strategies
• **Creative Writing:** Story development, character building, plot structure
• **Technical Writing:** Documentation, tutorials, explanations
• **Marketing Content:** Compelling copy, social media posts
• **Academic Writing:** Research, citations, formatting

**Zentro Chat Advantages:**
• **Built-in Blog Platform:** Publish directly to our community
• **AI Research Assistant:** I can help gather information and sources
• **Community Engagement:** Get feedback from other creators
• **Professional Networking:** Connect with other writers and creators

**My Approach:**
1. Understand your goals and audience
2. Suggest multiple creative directions
3. Help with structure and flow
4. Provide editing and optimization tips

What type of content are you looking to create? I can provide specific, actionable guidance tailored to your project.

*Note: I aim to inspire and guide, but the creative vision is uniquely yours!*`, userVibe, persona);
    }

    // Enhanced music assistance
    if (lowerMessage.includes('music') || lowerMessage.includes('song') || lowerMessage.includes('playlist') || lowerMessage.includes('artist')) {
      return this.formatResponse(`Music is such a powerful part of the experience! 🎵 Let me help you discover and organize your perfect soundtrack.

**Zentro Chat Music Features:**
• **Smart Search:** Find any song, artist, or genre instantly
• **Playlist Creation:** Build collections for different moods and activities
• **Social Sharing:** Share your musical discoveries with friends
• **Integrated Experience:** Music plays seamlessly while you chat and browse

**What I can help with:**
• **Discovery:** Recommend artists and genres based on your taste
• **Playlist Strategy:** Create themed collections (work, relaxation, creativity)
• **Music for Productivity:** Find the perfect background music for different tasks
• **Social Features:** Connect with others who share your musical interests

**Personalized Recommendations:**
Based on your activity in Zentro Chat, I can suggest music that complements your current projects - whether you're coding, writing, or just relaxing.

What kind of musical experience are you looking for today? I can provide specific recommendations and help you make the most of our music features!`, userVibe, persona);
    }

    // Enhanced general responses with learning integration
    const responses = [
      `That's a fascinating topic! I'd love to explore this with you. Could you tell me a bit more about what specifically interests you about this? I can provide detailed insights and multiple perspectives.

*I'm continuously learning from conversations like ours to provide better assistance.*`,

      `Great question! Let me think through this systematically. To give you the most helpful response, could you share a bit more context about what you're trying to achieve or understand?

I can offer several approaches and explanations tailored to your needs.`,

      `I'm excited to help with this! Based on what you've shared, I can see a few different angles we could explore. Let me know what aspect interests you most, and I'll dive deep into that area.

*Note: I'll be transparent about any limitations in my knowledge and suggest when you might want to verify information.*`,

      `This sounds like something we can definitely work on together! I love tackling challenges step-by-step. What's your main goal here, and what have you already tried or considered?

I can provide both Zentro Chat-specific solutions and general approaches.`
    ];

    return this.formatResponse(this.getRandomItem(responses), userVibe, persona);
  }

  // Check if message is a search/research query
  isSearchQuery(message) {
    const searchIndicators = [
      'what is', 'how does', 'explain', 'tell me about', 'research', 'find information',
      'look up', 'search for', 'what are', 'how to', 'why does', 'when did',
      'where is', 'who is', 'define', 'meaning of', 'facts about'
    ];

    const lowerMessage = message.toLowerCase();
    return searchIndicators.some(indicator => lowerMessage.includes(indicator));
  }

  // Handle search/research queries with disclaimers
  handleSearchQuery(message, userVibe, persona) {
    this.trackInteraction('search', message, 'search_query');

    const searchResponse = this.generateSearchResponse(message);
    const disclaimer = this.getSearchDisclaimer();

    return this.formatResponse(`${searchResponse}\n\n${disclaimer}`, userVibe, persona);
  }

  // Generate search-like responses
  generateSearchResponse(query) {
    const lowerQuery = query.toLowerCase();

    // Handle common search patterns
    if (lowerQuery.includes('what is') || lowerQuery.includes('define')) {
      const topic = this.extractSearchTopic(query);
      return `🔍 **Research Mode Activated**

Based on my knowledge, here's what I can tell you about ${topic}:

I'm functioning as a mini search engine right now, drawing from my training data to provide you with relevant information. Let me break this down systematically:

**Key Points:**
• This appears to be a topic that requires factual information
• I'll provide what I know while being transparent about limitations
• For critical decisions, I recommend verifying with authoritative sources

**What I found:**
[I would provide relevant information here based on the specific query]

Would you like me to elaborate on any particular aspect, or help you find more specific information about this topic?`;
    }

    return `🔍 **Mini Search Engine Mode**

I'm analyzing your query and drawing from my knowledge base to help you. Here's what I can provide:

**Understanding your question:**
${query}

**My approach:**
1. Breaking down the key concepts
2. Providing relevant information from my training
3. Offering multiple perspectives where applicable
4. Suggesting next steps for deeper research

Let me provide you with the most relevant information I have on this topic...`;
  }

  // Extract topic from search query
  extractSearchTopic(query) {
    const patterns = [
      /what is (.+)/i,
      /define (.+)/i,
      /tell me about (.+)/i,
      /explain (.+)/i
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern);
      if (match) return match[1];
    }

    return 'this topic';
  }

  // Search disclaimer
  getSearchDisclaimer() {
    return `⚠️ **Accuracy Notice:**
I'm operating as a mini search engine based on my training data. While I strive for accuracy:
• Information may not be completely current
• For important decisions, please verify with authoritative sources
• I'm designed to be helpful while being transparent about limitations
• Consider this a starting point for your research

Need more specific or current information? I can suggest reliable sources to check!`;
  }

  // Format response based on user vibe and persona
  formatResponse(baseResponse, userVibe, persona) {
    let response = baseResponse;

    // Adjust emoji usage
    if (userVibe.emojiUsage === 'high') {
      response = this.addMoreEmojis(response);
    } else if (userVibe.emojiUsage === 'low') {
      response = this.reduceEmojis(response);
    }

    // Adjust enthusiasm
    if (userVibe.enthusiasm === 'high') {
      response = response.replace(/\./g, '!');
      response += " 🚀";
    } else if (userVibe.enthusiasm === 'low') {
      response = response.replace(/!/g, '.');
    }

    // Adjust length based on preference
    if (userVibe.responseLength === 'short') {
      response = this.shortenResponse(response);
    } else if (userVibe.responseLength === 'long') {
      response = this.expandResponse(response);
    }

    // Add persona-specific touches
    if (persona.name === 'Hype Bot') {
      response += " Let's go! 🔥";
    } else if (persona.name === 'Chill Friend') {
      response = response.replace(/!/g, '.').toLowerCase();
      response = response.charAt(0).toUpperCase() + response.slice(1);
    }

    return response;
  }

  // Helper methods for response formatting
  addMoreEmojis(text) {
    const emojiMap = {
      'great': 'great 🌟',
      'awesome': 'awesome 🚀',
      'help': 'help 🤝',
      'love': 'love ❤️',
      'perfect': 'perfect ✨'
    };

    Object.keys(emojiMap).forEach(word => {
      text = text.replace(new RegExp(word, 'gi'), emojiMap[word]);
    });

    return text;
  }

  reduceEmojis(text) {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
  }

  shortenResponse(text) {
    const sentences = text.split(/[.!?]+/);
    return sentences.slice(0, 2).join('. ') + '.';
  }

  expandResponse(text) {
    return text + "\n\nFeel free to ask me anything else about Zentro Chat or if you need help with any other topics! I'm here to make your experience amazing.";
  }

  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Voice synthesis for responses
  async speakResponse(text, options = {}) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return false;
    }

    try {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Configure voice settings
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 0.8;

      // Try to use a natural-sounding voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.name.includes('Google') ||
        voice.name.includes('Microsoft') ||
        voice.lang.startsWith('en')
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      return new Promise((resolve) => {
        utterance.onend = () => resolve(true);
        utterance.onerror = () => resolve(false);
        speechSynthesis.speak(utterance);
      });
    } catch (error) {
      console.error('Speech synthesis error:', error);
      return false;
    }
  }

  // Image analysis capabilities
  async analyzeImage(imageData, userId) {
    try {
      // This is a simplified image analysis - in a real implementation,
      // you'd use a vision AI service like Google Vision API or similar

      const analysis = this.performBasicImageAnalysis(imageData);

      // Track image analysis interaction
      this.trackInteraction(userId, 'Image analysis request', 'image_analysis');

      return {
        success: true,
        analysis: analysis,
        suggestions: this.generateImageSuggestions(analysis),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Image analysis error:', error);
      return {
        success: false,
        error: error.message,
        fallback: "I can see you've shared an image! While I can't analyze images in detail yet, I'd be happy to help you with any questions about it. Could you describe what you'd like to know about the image?"
      };
    }
  }

  // Basic image analysis (placeholder for actual AI vision)
  performBasicImageAnalysis(imageData) {
    // In a real implementation, this would use computer vision APIs
    // For now, we'll provide helpful generic responses

    const imageSize = imageData.length;
    const isLargeImage = imageSize > 100000; // Rough estimate

    return {
      type: 'image',
      size: isLargeImage ? 'large' : 'small',
      format: this.detectImageFormat(imageData),
      suggestions: [
        "I can see you've shared an image with me!",
        "While I can't analyze images in detail yet, I can help you with questions about it.",
        "Feel free to describe what you'd like to know about this image."
      ]
    };
  }

  // Detect image format from data
  detectImageFormat(imageData) {
    if (imageData.startsWith('data:image/jpeg')) return 'JPEG';
    if (imageData.startsWith('data:image/png')) return 'PNG';
    if (imageData.startsWith('data:image/gif')) return 'GIF';
    if (imageData.startsWith('data:image/webp')) return 'WebP';
    return 'Unknown';
  }

  // Generate suggestions based on image analysis
  generateImageSuggestions(analysis) {
    const suggestions = [
      "🖼️ **Image Received!**\n\nI can see you've shared an image with me. While I'm still learning to analyze images in detail, I can help you with:\n\n• **Describing what you see** - Tell me about the image and I can provide insights\n• **Creative ideas** - If it's artwork, I can suggest improvements or techniques\n• **Technical help** - If it's a screenshot, I can help troubleshoot\n• **Content creation** - I can help you write about or describe the image\n\n**What would you like to know about this image?**",

      "📸 **Image Analysis Mode**\n\nI notice you've shared an image! Here's how I can help:\n\n• **Ask specific questions** about what you see\n• **Get creative suggestions** if it's artwork or design\n• **Technical assistance** if it's a screenshot or diagram\n• **Content ideas** for blogging about the image\n\n**Describe what you'd like to explore about this image!**"
    ];

    return this.getRandomItem(suggestions);
  }

  // Enhanced message handling with voice and image support
  async sendMessage(userId, message, options = {}) {
    try {
      const { isVoiceInput = false, imageData = null, voiceSettings = {} } = options;

      // Handle image analysis if image is provided
      if (imageData) {
        const imageAnalysis = await this.analyzeImage(imageData, userId);
        if (imageAnalysis.success) {
          // Add image analysis to history
          this.addToHistory(userId, 'user', `[Image shared] ${message || 'User shared an image'}`);
          this.addToHistory(userId, 'assistant', imageAnalysis.suggestions);

          return {
            success: true,
            response: imageAnalysis.suggestions,
            imageAnalysis: imageAnalysis.analysis,
            usage: { tokens: imageAnalysis.suggestions.length },
            timestamp: new Date().toISOString(),
            achievements: this.checkAchievements(userId, message || 'image_shared')
          };
        } else {
          // Fallback for image analysis failure
          this.addToHistory(userId, 'user', `[Image shared] ${message || 'User shared an image'}`);
          this.addToHistory(userId, 'assistant', imageAnalysis.fallback);

          return {
            success: true,
            response: imageAnalysis.fallback,
            usage: { tokens: imageAnalysis.fallback.length },
            timestamp: new Date().toISOString()
          };
        }
      }

      // Add user message to history
      const messageText = isVoiceInput ? `[Voice] ${message}` : message;
      this.addToHistory(userId, 'user', messageText);

      // Check for achievements
      const achievements = this.checkAchievements(userId, message);

      // Generate response
      const response = await this.generateResponse(userId, message, options);

      // Add bot response to history
      this.addToHistory(userId, 'assistant', response);

      // Handle voice output if requested
      let voiceResponse = false;
      if (options.enableVoiceResponse) {
        voiceResponse = await this.speakResponse(response, voiceSettings);
      }

      return {
        success: true,
        response: response,
        usage: { tokens: response.length }, // Simple token estimation
        timestamp: new Date().toISOString(),
        achievements: achievements,
        voiceInput: isVoiceInput,
        voiceOutput: voiceResponse
      };

    } catch (error) {
      console.error('Custom AI Error:', error);

      // Return a fallback response
      const fallbackResponse = this.getFallbackResponse(message);
      this.addToHistory(userId, 'assistant', fallbackResponse);

      return {
        success: false,
        response: fallbackResponse,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Fallback responses for errors
  getFallbackResponse(message) {
    const fallbacks = [
      "I'm having a moment here! 🤖 Could you try asking that again?",
      "Oops, my circuits got a bit tangled! Let me know what you need help with.",
      "Sorry about that! I'm still learning. What can I help you with in Zentro Chat?",
      "My bad! Something went wrong, but I'm here to help. What would you like to know?",
      "Technical hiccup! 🔧 But I'm ready to assist you with anything Zentro Chat related!"
    ];

    return this.getRandomItem(fallbacks);
  }

  // Blog content generation
  async generateBlogContent(query, format = 'comprehensive', userId = null) {
    try {
      const blogFormats = {
        comprehensive: {
          name: "Comprehensive Guide",
          structure: ["Introduction", "Main Content", "Key Points", "Practical Applications", "Conclusion"],
          tone: "informative and detailed"
        },
        howto: {
          name: "How-To Tutorial",
          structure: ["Overview", "Prerequisites", "Step-by-Step Guide", "Tips & Tricks", "Troubleshooting"],
          tone: "instructional and clear"
        },
        listicle: {
          name: "List Article",
          structure: ["Introduction", "Main List Items", "Detailed Explanations", "Summary"],
          tone: "engaging and scannable"
        },
        comparison: {
          name: "Comparison Analysis",
          structure: ["Introduction", "Option A Analysis", "Option B Analysis", "Comparison Table", "Recommendation"],
          tone: "analytical and balanced"
        },
        news: {
          name: "News Update",
          structure: ["Headline Summary", "Background", "Current Developments", "Impact Analysis", "Future Outlook"],
          tone: "timely and factual"
        }
      };

      const selectedFormat = blogFormats[format] || blogFormats.comprehensive;

      // Check if query is about Zentro Chat
      const isZentroQuery = this.isZentroChatQuery(query);

      let content = '';

      if (isZentroQuery) {
        content = this.generateZentroBlogContent(query, selectedFormat);
      } else {
        content = this.generateGeneralBlogContent(query, selectedFormat);
      }

      return {
        success: true,
        content: content,
        format: selectedFormat.name,
        timestamp: new Date().toISOString(),
        wordCount: content.split(' ').length
      };

    } catch (error) {
      console.error('Blog generation error:', error);
      return {
        success: false,
        error: error.message,
        content: this.getFallbackBlogContent(query, format)
      };
    }
  }

  // Check if query is about Zentro Chat
  isZentroChatQuery(query) {
    const zentroKeywords = [
      'zentro', 'zentro chat', 'smart profile', 'dm system', 'blog platform',
      'music player', 'talent directory', 'messaging', 'social platform',
      'ai assistant', 'zentro bot', 'profile panel', 'professional networking'
    ];

    const lowerQuery = query.toLowerCase();
    return zentroKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  // Generate Zentro Chat specific blog content
  generateZentroBlogContent(query, format) {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('smart profile') || lowerQuery.includes('profile panel')) {
      return this.generateSmartProfileBlog(format);
    } else if (lowerQuery.includes('messaging') || lowerQuery.includes('dm')) {
      return this.generateMessagingBlog(format);
    } else if (lowerQuery.includes('blog') || lowerQuery.includes('content')) {
      return this.generateBlogPlatformBlog(format);
    } else if (lowerQuery.includes('music')) {
      return this.generateMusicPlayerBlog(format);
    } else if (lowerQuery.includes('talent') || lowerQuery.includes('professional')) {
      return this.generateTalentDirectoryBlog(format);
    } else if (lowerQuery.includes('ai') || lowerQuery.includes('zentro bot')) {
      return this.generateAIAssistantBlog(format);
    } else {
      return this.generateZentroOverviewBlog(format);
    }
  }

  // Generate specific Zentro feature blogs
  generateSmartProfileBlog(format) {
    return `# Mastering Your Zentro Chat Smart Profile Panel

## Introduction
Your Smart Profile Panel in Zentro Chat is more than just a profile - it's your digital identity hub that adapts to both personal and professional contexts. This comprehensive guide will help you maximize its potential.

## Key Features of Smart Profile Panel

### Professional Toggle
The professional toggle is a game-changer for modern networking:
- **Personal View**: Showcase your interests, hobbies, and creative side
- **Professional View**: Highlight skills, experience, and career achievements
- **Seamless Switching**: Toggle between views based on your audience

### Customization Options
Make your profile uniquely yours:
- **Profile Pictures**: Upload and customize your avatar
- **Banner Images**: Create stunning visual headers
- **Bio Sections**: Craft compelling personal and professional descriptions
- **Skills Showcase**: Highlight your expertise and capabilities

### Privacy Controls
Take control of your visibility:
- **Public Profiles**: Visible to all Zentro Chat users
- **Recruiter Only**: Accessible to verified recruiters
- **Friends Only**: Limited to your network connections
- **Private**: Visible only to you

## Practical Applications

### For Job Seekers
- Enable professional view for recruiter visibility
- Showcase relevant skills and projects
- Use the talent directory integration for networking

### For Creatives
- Display your portfolio and creative works
- Connect with like-minded individuals
- Share your artistic journey through integrated blogging

### For Professionals
- Build your professional brand
- Network with industry peers
- Demonstrate thought leadership through content

## Best Practices

1. **Keep It Updated**: Regular profile maintenance ensures accuracy
2. **Use Quality Images**: Professional photos make a strong first impression
3. **Craft Compelling Bios**: Tell your story in an engaging way
4. **Leverage Both Views**: Maximize opportunities by optimizing both personal and professional aspects

## Integration with Zentro Chat Ecosystem

Your Smart Profile Panel seamlessly integrates with:
- **Talent Directory**: Automatic inclusion when professional view is enabled
- **Blog Platform**: Author attribution and credibility building
- **Messaging System**: Enhanced context for conversations
- **Music Player**: Share your musical tastes and preferences

## Conclusion

The Smart Profile Panel is your gateway to meaningful connections in Zentro Chat. Whether you're networking professionally, sharing creatively, or building personal relationships, this powerful tool adapts to your needs while maintaining your privacy and control.

Ready to optimize your profile? Start by enabling the professional toggle and exploring the customization options available in your Smart Profile Panel today!`;
  }

  generateMessagingBlog(format) {
    return `# The Future of Messaging: Zentro Chat's Advanced DM System

## Introduction
Zentro Chat's messaging system represents the next evolution in digital communication, combining traditional messaging with innovative features that enhance every conversation.

## Core Messaging Features

### Real-Time Communication
Experience seamless, instant messaging with:
- **Lightning-Fast Delivery**: Messages appear instantly across all devices
- **Read Receipts**: Know when your messages are seen
- **Typing Indicators**: See when someone is responding
- **Online Status**: Stay connected with real-time presence

### Rich Media Support
Express yourself beyond text:
- **Voice Messages**: Send audio clips with crystal-clear quality
- **Image Sharing**: Share photos with automatic optimization
- **File Attachments**: Send documents, videos, and more
- **Emoji Reactions**: React to messages with expressive emojis

### Advanced Features
Take your conversations to the next level:
- **Message Editing**: Fix typos and update content after sending
- **Reply Threading**: Maintain context in group conversations
- **Message Search**: Find any conversation or message instantly
- **Smart Notifications**: Customizable alerts that respect your time

## Integration with Zentro Chat Ecosystem

### Smart Profile Integration
- **Context-Aware Messaging**: See relevant profile information during chats
- **Professional Networking**: Connect with colleagues and industry peers
- **Creative Collaboration**: Share and discuss creative projects

### Music Integration
- **Share Now Playing**: Let friends know what you're listening to
- **Collaborative Playlists**: Build music collections together
- **Music Discovery**: Discover new artists through friend recommendations

### Blog Integration
- **Content Sharing**: Share blog posts directly in conversations
- **Collaborative Writing**: Get feedback on drafts from trusted contacts
- **Discussion Threads**: Engage in meaningful conversations about shared content

## Privacy and Security

### End-to-End Protection
Your conversations are secure with:
- **Message Encryption**: All messages are protected in transit
- **Privacy Controls**: Control who can message you
- **Block and Report**: Tools to maintain a safe environment
- **Data Control**: You own your conversation history

### Customizable Privacy
- **Online Status Control**: Choose when to appear online
- **Read Receipt Options**: Control message read confirmations
- **Contact Management**: Organize and control your connections

## Best Practices for Effective Communication

### Professional Messaging
- **Clear Subject Lines**: Use descriptive message previews
- **Professional Tone**: Maintain appropriate communication style
- **Timely Responses**: Respect others' time and expectations

### Personal Conversations
- **Express Yourself**: Use emojis, voice messages, and media
- **Stay Engaged**: Participate actively in group conversations
- **Share Experiences**: Use integrated features to share your interests

## The Future of Messaging in Zentro Chat

Upcoming features include:
- **AI-Powered Suggestions**: Smart reply recommendations
- **Enhanced Group Features**: Better collaboration tools
- **Cross-Platform Sync**: Seamless experience across all devices
- **Advanced Search**: AI-powered conversation discovery

## Conclusion

Zentro Chat's messaging system isn't just about sending messages - it's about building meaningful connections in a digital world. With its rich feature set, seamless integrations, and focus on user privacy, it represents the future of how we communicate online.

Start exploring these features today and discover how Zentro Chat can transform your digital conversations!`;
  }

  generateZentroOverviewBlog(format) {
    return `# Zentro Chat: The All-in-One Social Platform Revolutionizing Digital Communication

## Introduction
In an era where digital communication is fragmented across multiple platforms, Zentro Chat emerges as a unified solution that combines messaging, content creation, music discovery, and professional networking into one seamless experience.

## The Zentro Chat Ecosystem

### Smart Messaging System
At its core, Zentro Chat features an advanced messaging platform that goes beyond traditional text:
- **Real-time communication** with voice messages and media sharing
- **Smart profile integration** for contextual conversations
- **Advanced privacy controls** for secure communication
- **Cross-platform synchronization** for seamless access

### Integrated Blogging Platform
Express your thoughts and ideas with a powerful blogging system:
- **AI-powered writing assistance** for content creation
- **Research tools** for fact-checking and inspiration
- **Public and private posting** options for flexible sharing
- **Community engagement** through comments and likes

### Music Discovery Hub
Discover and enjoy music without leaving the platform:
- **Comprehensive search** across multiple music sources
- **Playlist creation** and management tools
- **Social music sharing** with friends and contacts
- **Integrated playback** while using other features

### Professional Networking
Build your career with dedicated professional tools:
- **Smart Profile Panel** with professional toggle
- **Talent Directory** for skill-based discovery
- **Recruiter tools** for career opportunities
- **Portfolio showcase** for creative professionals

### AI-Powered Assistant
Meet Zentro Bot, your native AI companion:
- **App-specific knowledge** for platform guidance
- **Personalized assistance** based on your usage patterns
- **Content creation help** for blogs and messages
- **Smart recommendations** for features and connections

## What Makes Zentro Chat Different

### Unified Experience
Unlike other platforms that require multiple apps:
- **Single login** for all features
- **Consistent interface** across all tools
- **Seamless data sharing** between features
- **Integrated notifications** for all activities

### Privacy-First Design
Your data and privacy are protected:
- **Granular privacy controls** for all content
- **Local data storage** options
- **Transparent data policies** with user control
- **Secure communication** protocols

### Customizable Interface
Make Zentro Chat truly yours:
- **Multiple theme options** including futuristic neon styles
- **Customizable layouts** for optimal workflow
- **Accessibility features** for all users
- **Responsive design** for any device

## Use Cases and Applications

### For Professionals
- **Network building** through the talent directory
- **Thought leadership** via the blogging platform
- **Client communication** through secure messaging
- **Portfolio presentation** with integrated media tools

### For Creatives
- **Content creation** with AI assistance
- **Community building** around shared interests
- **Collaboration tools** for creative projects
- **Inspiration discovery** through music and content

### For Students
- **Study groups** through messaging features
- **Research assistance** with AI-powered tools
- **Knowledge sharing** via blogging platform
- **Social connections** with peers and mentors

### For General Users
- **Social networking** with privacy controls
- **Entertainment** through music and content discovery
- **Personal expression** via customizable profiles
- **Meaningful conversations** with advanced messaging

## The Technology Behind Zentro Chat

### Modern Architecture
Built with cutting-edge technology:
- **React-based frontend** for responsive user experience
- **Real-time synchronization** for instant updates
- **Scalable backend** for growing user base
- **AI integration** for intelligent features

### Performance Optimization
Designed for speed and efficiency:
- **Fast loading times** across all features
- **Efficient data usage** for mobile users
- **Offline capabilities** for uninterrupted access
- **Cross-platform compatibility** for universal access

## Future Roadmap

### Upcoming Features
Zentro Chat continues to evolve:
- **Enhanced AI capabilities** for better assistance
- **Advanced collaboration tools** for teams
- **Expanded music integration** with more sources
- **Mobile app development** for on-the-go access

### Community-Driven Development
Your feedback shapes the future:
- **User suggestion system** for feature requests
- **Beta testing programs** for early access
- **Community forums** for discussion and feedback
- **Regular updates** based on user needs

## Getting Started with Zentro Chat

### Quick Setup Guide
1. **Create your account** with email verification
2. **Set up your Smart Profile** with personal and professional information
3. **Explore the features** through guided tutorials
4. **Connect with others** via the talent directory or messaging
5. **Start creating** with the blogging platform and AI assistance

### Tips for New Users
- **Complete your profile** for better networking opportunities
- **Try different themes** to find your preferred style
- **Engage with content** to build your community
- **Use Zentro Bot** for guidance and assistance

## Conclusion

Zentro Chat represents a new paradigm in digital communication - one where all your online activities can coexist in a single, secure, and user-friendly platform. Whether you're a professional looking to network, a creative seeking to share your work, or someone who simply wants a better way to connect with others, Zentro Chat provides the tools and community to make it happen.

Join the Zentro Chat community today and experience the future of digital communication!`;
  }

  // Generate general blog content for non-Zentro topics
  generateGeneralBlogContent(query, format) {
    const title = this.generateTitle(query, format.name);

    return `# ${title}

## Introduction
${query} is a fascinating topic that deserves deeper exploration. In this ${format.name.toLowerCase()}, we'll dive into the key aspects, implications, and practical applications of ${query}.

## Understanding ${query}

### Background and Context
The concept of ${query} has evolved significantly in recent years. Understanding its foundations helps us appreciate its current relevance and future potential.

### Key Components
When examining ${query}, several important elements stand out:
- **Core principles** that define the fundamental aspects
- **Practical applications** in real-world scenarios
- **Current trends** shaping its development
- **Future possibilities** and potential innovations

## Detailed Analysis

### Current State
Today's landscape of ${query} is characterized by rapid development and increasing adoption across various sectors. The integration of technology and traditional approaches has created new opportunities and challenges.

### Benefits and Advantages
The advantages of ${query} include:
- **Improved efficiency** in relevant processes
- **Enhanced user experience** for stakeholders
- **Cost-effective solutions** for common challenges
- **Scalable implementations** for growing needs

### Challenges and Considerations
However, there are also important considerations:
- **Implementation complexity** requiring careful planning
- **Resource requirements** for successful adoption
- **Training needs** for effective utilization
- **Ongoing maintenance** and optimization requirements

## Practical Applications

### Real-World Examples
${query} finds application in numerous scenarios:
- **Industry implementations** showing proven results
- **Case studies** demonstrating successful outcomes
- **Best practices** developed through experience
- **Lessons learned** from various implementations

### Getting Started
For those interested in exploring ${query}:
1. **Research thoroughly** to understand the fundamentals
2. **Start small** with pilot projects or limited implementations
3. **Seek expert guidance** when needed
4. **Monitor progress** and adjust approaches as necessary

## Future Outlook

### Emerging Trends
The future of ${query} looks promising with several exciting developments:
- **Technological advances** enhancing capabilities
- **Increased adoption** across different sectors
- **Innovation opportunities** for creative applications
- **Community growth** supporting collaborative development

### Recommendations
Based on current trends and analysis:
- **Stay informed** about latest developments
- **Engage with communities** working in this space
- **Experiment responsibly** with new approaches
- **Share experiences** to contribute to collective knowledge

## Conclusion

${query} represents an important area of focus in today's rapidly evolving landscape. By understanding its principles, applications, and potential, we can better prepare for the opportunities and challenges ahead.

Whether you're just beginning to explore ${query} or looking to deepen your understanding, the key is to remain curious, stay informed, and actively engage with the community of practitioners and enthusiasts working in this space.

*What aspects of ${query} are you most interested in exploring further? Share your thoughts and experiences in the comments below!*`;
  }

  generateTitle(query, formatName) {
    const titleTemplates = {
      'Comprehensive Guide': [
        `The Complete Guide to ${query}`,
        `Understanding ${query}: A Comprehensive Overview`,
        `${query} Explained: Everything You Need to Know`
      ],
      'How-To Tutorial': [
        `How to Master ${query}: A Step-by-Step Guide`,
        `Getting Started with ${query}: A Beginner's Tutorial`,
        `${query} Tutorial: From Basics to Advanced`
      ],
      'List Article': [
        `10 Essential Things to Know About ${query}`,
        `The Ultimate ${query} Checklist`,
        `Top Strategies for ${query} Success`
      ],
      'Comparison Analysis': [
        `${query}: Comparing Different Approaches`,
        `The Best Options for ${query}: A Detailed Comparison`,
        `${query} Analysis: Which Approach is Right for You?`
      ],
      'News Update': [
        `Latest Developments in ${query}`,
        `${query} Update: What's New and What's Next`,
        `Breaking: New Trends in ${query}`
      ]
    };

    const templates = titleTemplates[formatName] || titleTemplates['Comprehensive Guide'];
    return this.getRandomItem(templates);
  }

  getFallbackBlogContent(query, format) {
    return `# ${query}: An Overview

I apologize, but I encountered an issue while generating detailed content about ${query}. However, I can still provide some helpful information:

## What I Know About ${query}

${query} is an interesting topic that deserves exploration. While I'm having technical difficulties generating a full ${format} article right now, I encourage you to:

1. **Research further** using reliable sources
2. **Engage with communities** interested in this topic
3. **Share your own experiences** and insights
4. **Ask specific questions** that I might be able to help with

## How Zentro Chat Can Help

You can use Zentro Chat's features to explore ${query} further:
- **Connect with experts** through the talent directory
- **Join discussions** in messaging groups
- **Share your research** through blog posts
- **Get AI assistance** for specific questions

Feel free to ask me more specific questions about ${query}, and I'll do my best to provide helpful information!`;
  }

  // Quick responses for initial interactions
  getQuickResponses() {
    return [
      {
        id: 'navigation',
        text: 'How do I navigate Zentro Chat?',
        category: 'navigation'
      },
      {
        id: 'features',
        text: 'What features does Zentro Chat have?',
        category: 'features'
      },
      {
        id: 'blog',
        text: 'How do I create a blog post?',
        category: 'content'
      },
      {
        id: 'music',
        text: 'How does the music player work?',
        category: 'entertainment'
      },
      {
        id: 'profile',
        text: 'How do I set up my profile?',
        category: 'profile'
      },
      {
        id: 'themes',
        text: 'How do I change themes?',
        category: 'customization'
      }
    ];
  }

  // Daily prompts based on user activity and interests
  getDailyPrompts(userId) {
    const memory = this.userMemory.get(userId);
    const basePrompts = [
      "What's one thing you learned today that you'd like to share?",
      "How are you feeling about your current projects?",
      "What's inspiring you in Zentro Chat lately?",
      "Any interesting conversations happening in your network?",
      "What would you like to explore or learn more about?"
    ];

    const moodBasedPrompts = [];

    // Add memory-based prompts
    if (memory?.favoriteTopics && memory.favoriteTopics.length > 0) {
      memory.favoriteTopics.forEach(topic => {
        moodBasedPrompts.push(`You've been interested in ${topic} lately. Want to dive deeper into that topic? 🔍`);
      });
    }

    return [...basePrompts, ...moodBasedPrompts];
  }

  // Enhanced tracking and analytics methods
  trackInteraction(userId, message, type = 'general') {
    const timestamp = new Date().toISOString();

    // Track global interactions
    this.analyticsData.totalInteractions++;

    // Track daily active users
    if (userId) {
      this.analyticsData.dailyActiveUsers.add(userId);
    }

    // Track popular queries
    const queryKey = message.toLowerCase().substring(0, 50);
    const currentCount = this.analyticsData.popularQueries.get(queryKey) || 0;
    this.analyticsData.popularQueries.set(queryKey, currentCount + 1);

    // Track feature usage
    const featureCount = this.analyticsData.featureUsage.get(type) || 0;
    this.analyticsData.featureUsage.set(type, featureCount + 1);

    // Store detailed interaction
    if (!this.globalInteractions.has(userId)) {
      this.globalInteractions.set(userId, []);
    }

    this.globalInteractions.get(userId).push({
      message,
      type,
      timestamp,
      messageLength: message.length,
      hasQuestion: message.includes('?'),
      sentiment: this.analyzeSentiment(message)
    });

    // Learn from this interaction
    this.learnFromInteraction(userId, message, type);
  }

  // Learning system that improves responses over time
  learnFromInteraction(userId, message, type) {
    const lowerMessage = message.toLowerCase();

    // Extract topics and keywords
    const topics = this.extractTopics(message);
    const keywords = this.extractKeywords(message);

    // Update learning data
    if (!this.learningData.has('topics')) {
      this.learningData.set('topics', new Map());
    }

    if (!this.learningData.has('keywords')) {
      this.learningData.set('keywords', new Map());
    }

    // Track topic frequency
    const topicMap = this.learningData.get('topics');
    topics.forEach(topic => {
      const count = topicMap.get(topic) || 0;
      topicMap.set(topic, count + 1);
    });

    // Track keyword frequency
    const keywordMap = this.learningData.get('keywords');
    keywords.forEach(keyword => {
      const count = keywordMap.get(keyword) || 0;
      keywordMap.set(keyword, count + 1);
    });

    // Update user-specific learning
    if (userId) {
      if (!this.learningData.has(userId)) {
        this.learningData.set(userId, {
          commonTopics: new Map(),
          preferredStyle: 'balanced',
          interactionPatterns: [],
          satisfactionScore: 0.8 // Default
        });
      }

      const userLearning = this.learningData.get(userId);
      topics.forEach(topic => {
        const count = userLearning.commonTopics.get(topic) || 0;
        userLearning.commonTopics.set(topic, count + 1);
      });
    }
  }

  // Extract topics from message
  extractTopics(message) {
    const topicKeywords = {
      'programming': ['code', 'programming', 'development', 'software', 'javascript', 'python', 'react'],
      'music': ['music', 'song', 'artist', 'playlist', 'album', 'genre'],
      'writing': ['write', 'blog', 'content', 'article', 'story', 'creative'],
      'zentro_features': ['profile', 'dm', 'messaging', 'talent', 'directory', 'theme'],
      'help': ['help', 'assist', 'support', 'guide', 'tutorial'],
      'search': ['what is', 'how to', 'explain', 'define', 'research']
    };

    const lowerMessage = message.toLowerCase();
    const topics = [];

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  // Extract keywords from message
  extractKeywords(message) {
    const words = message.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Remove common stop words
    const stopWords = ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time'];

    return words.filter(word => !stopWords.includes(word));
  }

  // Get analytics data for admin dashboard
  getAnalytics() {
    return {
      overview: {
        totalInteractions: this.analyticsData.totalInteractions,
        dailyActiveUsers: this.analyticsData.dailyActiveUsers.size,
        totalUsers: this.globalInteractions.size,
        averageInteractionsPerUser: this.analyticsData.totalInteractions / Math.max(this.globalInteractions.size, 1)
      },
      popularQueries: Array.from(this.analyticsData.popularQueries.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      featureUsage: Array.from(this.analyticsData.featureUsage.entries())
        .sort((a, b) => b[1] - a[1]),
      learningProgress: {
        topicsLearned: this.learningData.get('topics')?.size || 0,
        keywordsTracked: this.learningData.get('keywords')?.size || 0,
        usersWithProfiles: Array.from(this.learningData.keys()).filter(key => key !== 'topics' && key !== 'keywords').length
      },
      recentInteractions: this.getRecentInteractions(50)
    };
  }

  // Get recent interactions for monitoring
  getRecentInteractions(limit = 20) {
    const allInteractions = [];

    this.globalInteractions.forEach((interactions, userId) => {
      interactions.forEach(interaction => {
        allInteractions.push({
          userId,
          ...interaction
        });
      });
    });

    return allInteractions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Reset daily analytics
  resetDailyAnalytics() {
    this.analyticsData.dailyActiveUsers.clear();
    console.log('📊 Daily analytics reset');
  }

  // Enhanced storage with analytics
  saveToStorage() {
    try {
      // Save existing data
      const conversations = {};
      this.conversationHistory.forEach((history, userId) => {
        conversations[userId] = history;
      });
      localStorage.setItem('zentro_custom_ai_conversations', JSON.stringify(conversations));

      const memory = {};
      this.userMemory.forEach((data, userId) => {
        memory[userId] = data;
      });
      localStorage.setItem('zentro_custom_ai_memory', JSON.stringify(memory));

      const personas = {};
      this.userPersonas.forEach((persona, userId) => {
        personas[userId] = persona;
      });
      localStorage.setItem('zentro_custom_ai_personas', JSON.stringify(personas));

      const vibes = {};
      this.userVibes.forEach((data, userId) => {
        vibes[userId] = data;
      });
      localStorage.setItem('zentro_custom_ai_vibes', JSON.stringify(vibes));

      // Save analytics and learning data
      const analytics = {
        ...this.analyticsData,
        dailyActiveUsers: Array.from(this.analyticsData.dailyActiveUsers),
        popularQueries: Array.from(this.analyticsData.popularQueries.entries()),
        featureUsage: Array.from(this.analyticsData.featureUsage.entries()),
        userSatisfaction: Array.from(this.analyticsData.userSatisfaction.entries()),
        learningProgress: Array.from(this.analyticsData.learningProgress.entries())
      };
      localStorage.setItem('zentro_custom_ai_analytics', JSON.stringify(analytics));

      const learning = {};
      this.learningData.forEach((data, key) => {
        if (data instanceof Map) {
          learning[key] = Array.from(data.entries());
        } else {
          learning[key] = data;
        }
      });
      localStorage.setItem('zentro_custom_ai_learning', JSON.stringify(learning));

      console.log('💾 Enhanced Custom AI: Saved all data including analytics');
    } catch (error) {
      console.error('❌ Enhanced Custom AI: Error saving to storage:', error);
    }
  }

  // Enhanced loading with analytics
  loadFromStorage() {
    try {
      // Load existing data (same as before)
      const savedConversations = localStorage.getItem('zentro_custom_ai_conversations');
      if (savedConversations) {
        const conversations = JSON.parse(savedConversations);
        Object.entries(conversations).forEach(([userId, history]) => {
          this.conversationHistory.set(userId, history);
        });
      }

      const savedMemory = localStorage.getItem('zentro_custom_ai_memory');
      if (savedMemory) {
        const memory = JSON.parse(savedMemory);
        Object.entries(memory).forEach(([userId, data]) => {
          this.userMemory.set(userId, data);
        });
      }

      const savedPersonas = localStorage.getItem('zentro_custom_ai_personas');
      if (savedPersonas) {
        const personas = JSON.parse(savedPersonas);
        Object.entries(personas).forEach(([userId, persona]) => {
          this.userPersonas.set(userId, persona);
        });
      }

      const savedVibes = localStorage.getItem('zentro_custom_ai_vibes');
      if (savedVibes) {
        const vibes = JSON.parse(savedVibes);
        Object.entries(vibes).forEach(([userId, data]) => {
          this.userVibes.set(userId, data);
        });
      }

      // Load analytics data
      const savedAnalytics = localStorage.getItem('zentro_custom_ai_analytics');
      if (savedAnalytics) {
        const analytics = JSON.parse(savedAnalytics);
        this.analyticsData = {
          ...analytics,
          dailyActiveUsers: new Set(analytics.dailyActiveUsers || []),
          popularQueries: new Map(analytics.popularQueries || []),
          featureUsage: new Map(analytics.featureUsage || []),
          userSatisfaction: new Map(analytics.userSatisfaction || []),
          learningProgress: new Map(analytics.learningProgress || [])
        };
      }

      // Load learning data
      const savedLearning = localStorage.getItem('zentro_custom_ai_learning');
      if (savedLearning) {
        const learning = JSON.parse(savedLearning);
        Object.entries(learning).forEach(([key, data]) => {
          if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
            this.learningData.set(key, new Map(data));
          } else {
            this.learningData.set(key, data);
          }
        });
      }

      console.log('✅ Enhanced Custom AI: Loaded all data including analytics');
    } catch (error) {
      console.error('❌ Enhanced Custom AI: Error loading from storage:', error);
    }
  }
}

// Create and export singleton instance
const zentroCustomAI = new ZentroCustomAI();
export default zentroCustomAI;
