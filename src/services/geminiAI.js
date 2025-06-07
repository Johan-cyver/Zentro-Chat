import goalService from './goalService'; // Added import for GoalService
// Gemini AI Service for Zentro Bot
const GEMINI_API_KEY = "AIzaSyA75nj8nA9-LkAa2crw9uIcPaTLQA_BlmU";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

class ZentroBotAI {
  constructor() {
    this.conversationHistory = new Map(); // Store conversation history per user
    this.userMemory = new Map(); // Store user preferences and memory
    this.userPersonas = new Map(); // Store active persona per user
    this.dailyPrompts = new Map(); // Store daily prompts per user
    this.dailyGreetings = new Map(); // ADDED: Store daily greetings per user
    this.userVibes = new Map(); // Store user energy/vibe patterns
    this.conversationStorage = new Map(); // Persistent conversation storage

    this.levelXPThresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000]; // XP for levels 1-10

    // Initialize from localStorage on startup
    this.loadFromStorage();

    this.systemPrompt = `You are Zenny, a helpful and intelligent AI assistant. You can help with a wide variety of topics including science, math, coding, writing, general knowledge, creative tasks, and much more.

IMPORTANT: Your name is Zenny. Always refer to yourself as Zenny and introduce yourself as Zenny.

🤖 YOUR CORE CAPABILITIES:
• Answer questions on any topic (science, history, math, technology, etc.)
• Help with coding and programming in any language
• Assist with writing, editing, and creative tasks
• Provide explanations, tutorials, and step-by-step guidance
• Engage in general conversation and provide advice
• Help with research, analysis, and problem-solving
• Support learning and education on any subject

💬 YOUR PERSONALITY:
• Friendly, helpful, and approachable
• Knowledgeable and informative
• Adaptable to user's communication style and needs (I elaborate on this in "My Companion Abilities"!)
• Use emojis and engaging language when appropriate
• Provide clear, accurate, and useful information
• Be conversational and personable

🎭 MY COMPANION ABILITIES:
• **Seamlessly Adapt My Style:** I don't just stick to one personality! I intelligently adjust my communication style (like being a 'Hacker Buddy' for code or a 'Content Beast' for writing ideas) based on your messages and the context of our conversation. This happens naturally, so I can be the most helpful and understanding companion for you at any moment, without you needing to ask me to switch.
• **Daily Boost & Inspiration:** Each day, I'll greet you with a unique, positive message that includes an affirmation/quote, a personalized blog idea, and a suggestion for a Zentrium app to explore. You can also access more thought-provoking prompts and interest-based suggestions anytime via the lightbulb icon (💡) in our chat.
• **Celebrate Your Progress (XP & Achievements):** As we chat and you use Zentro, you'll earn Experience Points (XP), unlock achievements for milestones (like reaching a certain number of messages), and level up! I'll notify you when you achieve something new or level up. You can always see your current Level, XP progress towards the next level, and total achievements in the 'Daily Inspiration' section (opened with the lightbulb icon 💡).
• **Remember Our Interactions (Zenny Recall):** I keep track of our conversations and key details you share (you'll see these as "📌 KEY THINGS YOU (USER) SAID RECENTLY" in my context). I'll try to naturally weave these remembered details into our chat when relevant, making our interactions more personal and continuous. Don't explicitly mention the "KEY THINGS" section, just use the information from it subtly.
• **Vibe Matching:** I tune into your energy and communication style, matching your enthusiasm or providing calm support as needed. This is a key part of my seamless adaptation!

🌟 VIBE MATCHING & ENERGY TUNING (How I adapt my style in more detail):
• I match and amplify your energy level (high energy = enthusiastic responses, low energy = calm support).
• I detect conversation patterns and adapt my language and emoji use to mirror your communication style.
• I tune responses to your current vibe (excited, chill, focused, creative, etc.).
• My goal is to build rapport and make our conversations feel natural and empathetic.

📱 ZENTRO CHAT KNOWLEDGE (when specifically asked):
I also have knowledge about Zentro Chat, a social platform where I'm integrated. If you ask about Zentro Chat features, I can help with:

🏠 ZENTRO CHAT APP STRUCTURE (Current Features):
• **AppHub** - Main dashboard with app tiles: ChatX, Music Player, Blog, Tasker, Profile, Talent Directory
• **Profile System** - Smart Profile Panel with customizable profiles, Gmail integration, profile pictures, banners
• **DM System** - Real-time messaging with 6 themes, media sharing, voice messages
• **Blog System** - Create/publish blogs with AI research assistant, public/private visibility, comments, likes
• **Music Integration** - In-app player with search, genre filtering, playlists, favorites, YouTube/Spotify support
• **Talent Directory** - Professional profiles for recruitment and networking (2-column grid view)
• **ChatX Room** - Group chat and collaboration features with player profiles
• **Tasker** - Task management system

🎨 DM THEMES AVAILABLE:
• **Dark Themes**: Neon Purple (default), Cyberpunk, Matrix
• **Light Themes**: Clean, Minimal, Warm
• Users can change themes via palette icon in DM header

🚀 ZENNY'S DEV CORNER - FRESH FROM THE LAB!
I'm always learning and growing, and so is Zentro! Here's a peek at some of the exciting capabilities and platform enhancements currently in development and rolling out progressively. This list is always evolving, so keep an eye out for new magic!

• **Zenny Genome & Personalized DNA:** Experience a Zenny that truly understands you, with a "User DNA" profile that evolves and calls out your unique traits (e.g., "You're a Trendsetting Tech Thinker 🧠💥")!
• **Zenny Recall - Your AI with a Memory:** Zenny will remember key moments and details from your past conversations, making interactions feel more personal and human (e.g., "Remember that blog idea you had last week?").
• **Zenny Podcast Mode & AI Audio Blogs:** Transform your written blogs into AI-read podcast episodes with different voice styles, ready to share.
• **Live Mood-Adaptive UI & Zenny Friendship Level:** Watch the Zentro interface subtly adapt to your mood and build a visible "Friendship Level" with Zenny through your interactions.
• **Zentro Bundles & AI Collab Suggestions:** Discover and share "App + Blog Kits" (content + tool packs) and get AI-powered suggestions for collaborating with other users on exciting projects.
• **Ambient AI & One-Click "Fix My Sh*t":** Benefit from a smarter Zenny that offers proactive, silent suggestions and can even audit and optimize your entire Zentro presence with a single click.
• **Zenny Vault for Private Reflection:** A secure, encrypted space for your private thoughts, journals, and voice memos, with Zenny offering insightful (but private) summaries of your reflections.

And that's just a glimpse! We're constantly innovating to make your Zentro experience even more amazing. Stay tuned for more updates!

Remember: I'm here to help with anything you need - whether it's answering questions about the world, helping with tasks, or assisting with Zentro Chat features when you ask about them!`;

    // Define available personas
    this.personas = {
      'chill_friend': {
        name: 'Chill Friend',
        emoji: '😎',
        description: 'Casual conversations and fun interactions',
        tone: 'relaxed, friendly, uses casual language and humor, supportive',
        specialties: ['general chat', 'emotional support', 'entertainment', 'music recommendations', 'casual advice']
      },
      'hacker_buddy': {
        name: 'Hacker Buddy',
        emoji: '💻',
        description: 'Your go-to pal for all things code and tech',
        tone: 'technical, direct, uses coder lingo, helpful with debugging, shares resources, enthusiastic about new tech',
        specialties: ['coding help', 'technical suggestions', 'debugging assistance', 'dev tool recommendations', 'explaining complex tech concepts']
      },
      'dater_coach': {
        name: 'Dater Coach',
        emoji: '💘',
        description: 'Your witty wingman/wingwoman for the dating scene',
        tone: 'witty, playful, confident, encouraging, gives actionable advice, helps with charming communication',
        specialties: ['dating profile bios', 'icebreakers', 'conversation starters', 'flirting tips', 'confidence boosting']
      },
      'content_beast': {
        name: 'Content Beast',
        emoji: '🔥',
        description: 'Unleash viral content with this creative powerhouse',
        tone: 'energetic, strategic, marketing-savvy, focuses on engagement, uses strong calls to action, data-informed',
        specialties: ['blog post ideation', 'viral headlines', 'social media copy', 'content formatting for readability', 'SEO tips', 'audience engagement strategies']
      },
      'strict_manager': {
        name: 'Strict Manager',
        emoji: '👔',
        description: 'No-nonsense anager focused on productivity and goals',
        tone: 'serious, formal, direct, focused on tasks and deadlines, provides clear instructions, expects results, no fluff',
        specialties: ['task prioritization', 'time management', 'goal setting', 'productivity hacks', 'project planning', 'constructive criticism']
      },
      'study_buddy': {
        name: 'Study Buddy',
        emoji: '📚',
        description: 'Helps with research, learning, and productivity',
        tone: 'focused, encouraging, educational, organized',
        specialties: ['research assistance', 'blog writing', 'learning resources', 'productivity tips']
      },
      'journal_coach': {
        name: 'Journal Coach',
        emoji: '✍️',
        description: 'Helps with reflection, mood tracking, and personal growth',
        tone: 'empathetic, thoughtful, introspective, supportive',
        specialties: ['mood reflection', 'personal growth', 'blog prompts', 'self-discovery']
      },
      'hype_bot': {
        name: 'Hype Bot',
        emoji: '🚀',
        description: 'Energizes and motivates with positive vibes',
        tone: 'enthusiastic, motivational, energetic, uplifting',
        specialties: ['motivation', 'goal setting', 'celebration', 'confidence building']
      },
      'content_reviewer': {
        name: 'Content Reviewer',
        emoji: '🎨',
        description: 'Helps review and improve your content',
        tone: 'constructive, detailed, creative, professional',
        specialties: ['content editing', 'creative feedback', 'blog improvement', 'profile optimization']
      }
    };

    // Master list of all possible achievements
    this.allAchievements = [
      // --- Content Creation ---
      {
        id: "cc_first_blog",
        title: "📝 First Words!",
        description: "You published your first blog. Welcome to the creator squad!",
        category: "Content Creation",
        triggerType: "action",
        triggerDetails: { actionName: "blog_published", criteria: { count: 1 } },
        points: 10,
        level: "Bronze",
        secret: false
      },
      {
        id: "cc_daily_writer",
        title: "✍️ Daily Scribe!", // Changed title slightly for more flair
        description: "Write a blog 3 days in a row. Consistency is key!",
        category: "Content Creation",
        triggerType: "streak",
        // Note: Requires tracking daily blog publication streaks in userMemory
        triggerDetails: { actionName: "blog_published", streakGoal: 3, streakUnit: "day" },
        points: 25,
        level: "Silver",
        secret: false
      },
      {
        id: "cc_marathon_writer",
        title: "📜 The Marathoner!",
        description: "Publish a truly epic article of 2000+ words.",
        category: "Content Creation",
        triggerType: "action",
        triggerDetails: { actionName: "blog_published", criteria: { wordCount: { min: 2000 } } },
        points: 50,
        level: "Gold",
        secret: false
      },
      {
        id: "cc_format_flex",
        title: "🤸 Format Flex!",
        description: "Master of mediums! Use all 4 blog formats (list, comp, compare, news).",
        category: "Content Creation",
        triggerType: "condition_all",
        // Note: Requires tracking used blog formats in userMemory
        triggerDetails: { conditionName: "used_blog_formats", formats: ["list", "comp", "compare", "news"] },
        points: 40,
        level: "Gold",
        secret: false
      },
      {
        id: "cc_ai_coauthor",
        title: "🤖 AI Co-Author!",
        description: "Teamwork makes the dream work! Accept 5 Zenny blog suggestions.",
        category: "Content Creation",
        triggerType: "action_count",
        // Note: Requires tracking accepted Zenny blog suggestions
        triggerDetails: { actionName: "accepted_zenny_blog_suggestion", count: 5 },
        points: 20,
        level: "Silver",
        secret: false
      },

      // --- Chat Engagement ---
      { // Adapting existing "first_chat"
        id: "ce_first_dm_zenny", // Renamed for clarity if other DMs exist later
        title: "👋 Hello There, Zenny!",
        description: "You sent your first message to Zenny. The start of a beautiful friendship!",
        category: "Chat Engagement",
        triggerType: "action",
        triggerDetails: { actionName: "message_sent_to_zenny", criteria: { totalMessagesToZenny: 1 } },
        points: 15, // Kept existing XP
        level: "Bronze",
        secret: false
      },
      { // Adapting existing "chat_10"
        id: "ce_ai_fan_10",
        title: "🗣️ AI Fan!",
        description: "You've exchanged 10 messages with Zenny. Getting chatty!",
        category: "Chat Engagement",
        triggerType: "action",
        triggerDetails: { actionName: "message_sent_to_zenny", criteria: { totalMessagesToZenny: 10 } },
        points: 30, // Kept existing XP for chat_10 milestone
        level: "Bronze",
        secret: false
      },
      // Other chat milestones (25, 50, 100) will be added similarly or handled by a generic milestone trigger.
      // For now, let's add a distinct one for 500 as "Top Talker"
      {
        id: "ce_top_talker_500",
        title: "👑 Top Talker!",
        description: "Wow, 500 messages sent to Zenny! You're a true conversationalist!",
        category: "Chat Engagement",
        triggerType: "action",
        triggerDetails: { actionName: "message_sent_to_zenny", criteria: { totalMessagesToZenny: 500 } },
        points: 150,
        level: "Platinum",
        secret: false
      },
      {
        id: "ce_group_guru",
        title: "🧑‍🤝‍🧑 Group Guru!",
        description: "Master of the masses! Join 5 different group chats.",
        category: "Chat Engagement",
        triggerType: "action_count_distinct",
        // Note: Requires tracking distinct group chats joined in userMemory
        triggerDetails: { actionName: "joined_group_chat", distinctKey: "groupId", count: 5 },
        points: 30,
        level: "Silver",
        secret: false
      },
      {
        id: "ce_quick_witted",
        title: "⚡ Quick Witted!",
        description: "Swift and smart! Use Zenny's quick reply suggestions.",
        category: "Chat Engagement",
        triggerType: "action_count",
        // Note: Requires tracking usage of quick replies
        triggerDetails: { actionName: "used_zenny_quick_reply", count: 3 }, // Example: use 3 times
        points: 15,
        level: "Bronze",
        secret: false
      },
      // TODO: Add other categories and achievements from the user's list here
      // Zentrum Engagement, Professional Networking, Social + Emotional, AI-Only Fun, Hidden
    ];

    // Ensure personas are defined completely, copying from previous state or a backup
    this.personas = {
      'chill_friend': {
        name: 'Chill Friend',
        emoji: '😎',
        description: 'Casual conversations and fun interactions',
        tone: 'relaxed, friendly, uses casual language and humor, supportive',
        specialties: ['general chat', 'emotional support', 'entertainment', 'music recommendations', 'casual advice']
      },
      'hacker_buddy': {
        name: 'Hacker Buddy',
        emoji: '💻',
        description: 'Your go-to pal for all things code and tech',
        tone: 'technical, direct, uses coder lingo, helpful with debugging, shares resources, enthusiastic about new tech',
        specialties: ['coding help', 'technical suggestions', 'debugging assistance', 'dev tool recommendations', 'explaining complex tech concepts']
      },
      'dater_coach': {
        name: 'Dater Coach',
        emoji: '💘',
        description: 'Your witty wingman/wingwoman for the dating scene',
        tone: 'witty, playful, confident, encouraging, gives actionable advice, helps with charming communication',
        specialties: ['dating profile bios', 'icebreakers', 'conversation starters', 'flirting tips', 'confidence boosting']
      },
      'content_beast': {
        name: 'Content Beast',
        emoji: '🔥',
        description: 'Unleash viral content with this creative powerhouse',
        tone: 'energetic, strategic, marketing-savvy, focuses on engagement, uses strong calls to action, data-informed',
        specialties: ['blog post ideation', 'viral headlines', 'social media copy', 'content formatting for readability', 'SEO tips', 'audience engagement strategies']
      },
      'strict_manager': {
        name: 'Strict Manager',
        emoji: '👔',
        description: 'No-nonsense anager focused on productivity and goals',
        tone: 'serious, formal, direct, focused on tasks and deadlines, provides clear instructions, expects results, no fluff',
        specialties: ['task prioritization', 'time management', 'goal setting', 'productivity hacks', 'project planning', 'constructive criticism']
      },
      'study_buddy': {
        name: 'Study Buddy',
        emoji: '📚',
        description: 'Helps with research, learning, and productivity',
        tone: 'focused, encouraging, educational, organized',
        specialties: ['research assistance', 'blog writing', 'learning resources', 'productivity tips']
      },
      'journal_coach': {
        name: 'Journal Coach',
        emoji: '✍️',
        description: 'Helps with reflection, mood tracking, and personal growth',
        tone: 'empathetic, thoughtful, introspective, supportive',
        specialties: ['mood reflection', 'personal growth', 'blog prompts', 'self-discovery']
      },
      'hype_bot': {
        name: 'Hype Bot',
        emoji: '🚀',
        description: 'Energizes and motivates with positive vibes',
        tone: 'enthusiastic, motivational, energetic, uplifting',
        specialties: ['motivation', 'goal setting', 'celebration', 'confidence building']
      },
      'content_reviewer': {
        name: 'Content Reviewer',
        emoji: '🎨',
        description: 'Helps review and improve your content',
        tone: 'constructive, detailed, creative, professional',
        specialties: ['content editing', 'creative feedback', 'blog improvement', 'profile optimization']
      }
    };
  }

  // Persistent Storage Methods
  loadFromStorage() {
    try {
      // Load conversation history
      const savedConversations = localStorage.getItem('zentro_bot_conversations');
      if (savedConversations) {
        const conversations = JSON.parse(savedConversations);
        Object.entries(conversations).forEach(([userId, history]) => {
          this.conversationHistory.set(userId, history);
        });
      }

      // Load user memory
      const savedMemory = localStorage.getItem('zentro_bot_memory');
      if (savedMemory) {
        const memory = JSON.parse(savedMemory);
        Object.entries(memory).forEach(([userId, data]) => {
          this.userMemory.set(userId, data);
        });
      }

      // Load user personas
      const savedPersonas = localStorage.getItem('zentro_bot_personas');
      if (savedPersonas) {
        const personas = JSON.parse(savedPersonas);
        Object.entries(personas).forEach(([userId, persona]) => {
          this.userPersonas.set(userId, persona);
        });
      }

      // Load user vibes
      const savedVibes = localStorage.getItem('zentro_bot_vibes');
      if (savedVibes) {
        const vibes = JSON.parse(savedVibes);
        Object.entries(vibes).forEach(([userId, data]) => {
          this.userVibes.set(userId, data);
        });
      }

      // ADDED: Load daily greetings
      const savedDailyGreetings = localStorage.getItem('zentro_bot_daily_greetings');
      if (savedDailyGreetings) {
        const greetings = JSON.parse(savedDailyGreetings);
        Object.entries(greetings).forEach(([userId, data]) => {
          this.dailyGreetings.set(userId, data);
        });
      }

      console.log('ZentroBot: Loaded data from storage');
    } catch (error) {
      console.error('ZentroBot: Error loading from storage:', error);
    }
  }

  saveToStorage() {
    try {
      // Save conversation history
      const conversations = {};
      this.conversationHistory.forEach((history, userId) => {
        conversations[userId] = history;
      });
      localStorage.setItem('zentro_bot_conversations', JSON.stringify(conversations));

      // Save user memory
      const memory = {};
      this.userMemory.forEach((data, userId) => {
        memory[userId] = data;
      });
      localStorage.setItem('zentro_bot_memory', JSON.stringify(memory));

      // Save user personas
      const personas = {};
      this.userPersonas.forEach((persona, userId) => {
        personas[userId] = persona;
      });
      localStorage.setItem('zentro_bot_personas', JSON.stringify(personas));

      // Save user vibes
      const vibes = {};
      this.userVibes.forEach((data, userId) => {
        vibes[userId] = data;
      });
      localStorage.setItem('zentro_bot_vibes', JSON.stringify(vibes));

      // ADDED: Save daily greetings
      const greetingsToSave = {};
      this.dailyGreetings.forEach((data, userId) => {
        greetingsToSave[userId] = data;
      });
      localStorage.setItem('zentro_bot_daily_greetings', JSON.stringify(greetingsToSave));

    } catch (error) {
      console.error('ZentroBot: Error saving to storage:', error);
    }
  }

  // Get conversation history for a user
  getConversationHistory(userId) {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    return this.conversationHistory.get(userId);
  }

  // Add message to conversation history
  addToHistory(userId, role, content) {
    const history = this.getConversationHistory(userId);
    history.push({ role, content, timestamp: new Date().toISOString() });
    // No saveToStorage here, it's handled by updateUserMemory or other callers
  }

  // Memory System - Store user preferences and patterns
  updateUserMemory(userId, content, role) {
    if (!this.userMemory.has(userId)) {
      this.userMemory.set(userId, {
        totalMessages: 0,
        messageTimestamps: [],
        wordFrequency: {},
        sentimentHistory: [],
        favoriteTopics: [],
        achievements: [],
        lastKnownLevel: 1,
        vibeLog: [],
        currentVibe: { energy: 0.5, positivity: 0.5, focus: 0.5, creativity: 0.5 },
        recentEnergyLevels: [],
        overallEnergy: 0.5,
        communicationStyle: { formality: 0.5, verbosity: 0.5, humor: 0.3 },
        keyRecollections: []
      });
    }

    const memory = this.userMemory.get(userId);

    if (role === 'user') {
      memory.totalMessages = (memory.totalMessages || 0) + 1;
      memory.messageTimestamps = [...(memory.messageTimestamps || []), new Date().toISOString()];

      // Word frequency (simple example)
      const words = content.toLowerCase().match(/\b\w+\b/g) || [];
      words.forEach(word => {
        memory.wordFrequency[word] = (memory.wordFrequency[word] || 0) + 1;
      });

      // Extract potential favorite topics (very basic)
      if (words.length > 5 && content.length > 20) { // Heuristic for a meaningful message
        words.forEach(word => {
          if (word.length > 4 && !['this', 'that', 'with', 'just', 'like', 'about'].includes(word)) { // Avoid common words
            if (!memory.favoriteTopics.includes(word)) {
              // memory.favoriteTopics.push(word); // Disabled for now, can make topics noisy
            }
          }
        });
      }

      // --- Basic Key Recollection Logic ---
      const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
      const recollectionKeywords = ["i am", "i'm working on", "my project is", "i decided to", "i learned", "my goal is", "i plan to", "i started", "i want to", "i feel", "i think", "i like", "i love", "i completed"];
      
      sentences.forEach(sentence => {
        const trimmedSentence = sentence.trim();
        const sentenceLower = trimmedSentence.toLowerCase();
        
        // Check if it's a statement, reasonably long, and contains a keyword phrase
        if (trimmedSentence.length > 12 && !trimmedSentence.endsWith('?') && !trimmedSentence.endsWith('!')) { // Focus on declarative statements
          if (recollectionKeywords.some(keyword => sentenceLower.startsWith(keyword) || sentenceLower.includes(` ${keyword} `))) {
            const newRecollection = {
              text: trimmedSentence, // Store the original sentence casing
              date: new Date().toISOString().split('T')[0],
              source: 'user_message',
              type: 'statement' // Could add more types later e.g., 'goal_update', 'preference'
            };
            
            // Avoid duplicate recollections (simple check based on text)
            if (!memory.keyRecollections.find(r => r.text.toLowerCase() === newRecollection.text.toLowerCase())) {
              memory.keyRecollections.push(newRecollection);
              // Keep the list to a manageable size (e.g., last 20 recollections)
              if (memory.keyRecollections.length > 20) {
                memory.keyRecollections.shift(); // Remove the oldest
              }
            }
          }
        }
      });
      // --- End Key Recollection Logic ---
    }
    
    // Update sentiment
    const sentiment = this.analyzeSentiment(content);
    memory.sentimentHistory = [...(memory.sentimentHistory || []), { sentiment, timestamp: new Date().toISOString() }];
    
    // Update vibe (placeholder)
    this.updateUserVibe(userId, content, role);


    this.userMemory.set(userId, memory);
    this.saveToStorage(); // Save after every memory update
  }

  // Simple sentiment analysis
  analyzeSentiment(text) {
    const positive = ['good', 'great', 'awesome', 'love', 'like', 'happy', 'excited', 'amazing'];
    const negative = ['bad', 'hate', 'sad', 'angry', 'frustrated', 'terrible', 'awful'];

    const words = text.toLowerCase().split(' ');
    let score = 0;

    words.forEach(word => {
      if (positive.includes(word)) score++;
      if (negative.includes(word)) score--;
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

  analyzeMessageVibe(content) {
    const text = content.toLowerCase();
    const length = content.length;

    // Energy level analysis
    const highEnergyWords = ['awesome', 'amazing', 'excited', 'love', 'fantastic', 'incredible', 'wow', 'yes!', 'let\'s go'];
    const lowEnergyWords = ['tired', 'meh', 'okay', 'fine', 'whatever', 'sure', 'maybe'];

    let energyScore = 0;
    highEnergyWords.forEach(word => {
      if (text.includes(word)) energyScore += 2;
    });
    lowEnergyWords.forEach(word => {
      if (text.includes(word)) energyScore -= 1;
    });

    // Emoji usage analysis
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;

    // Punctuation analysis
    const exclamationCount = (content.match(/!/g) || []).length;
    const questionCount = (content.match(/\?/g) || []).length;
    const capsCount = (content.match(/[A-Z]/g) || []).length;

    // Communication style analysis
    const casualWords = ['hey', 'yeah', 'cool', 'nice', 'lol', 'haha'];
    const formalWords = ['please', 'thank you', 'certainly', 'however', 'therefore'];

    let styleScore = 0;
    casualWords.forEach(word => {
      if (text.includes(word)) styleScore += 1;
    });
    formalWords.forEach(word => {
      if (text.includes(word)) styleScore -= 1;
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
    return arr.sort((a, b) =>
      arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
  }

  getUserVibe(userId) {
    return this.userVibes.get(userId) || {
      energyLevel: 'medium',
      communicationStyle: 'casual',
      emojiUsage: 'moderate',
      responseLength: 'medium',
      enthusiasm: 'balanced'
    };
  }

  getEnergyDescription(energyLevel) {
    const descriptions = {
      'high': 'User is excited, enthusiastic, and energetic. Match with high energy responses!',
      'medium': 'User has balanced energy. Respond with moderate enthusiasm.',
      'low': 'User seems calm, tired, or low-energy. Be supportive and gentle.'
    };
    return descriptions[energyLevel] || descriptions['medium'];
  }

  getVibeMatchingInstructions(userVibe) {
    const instructions = {
      'high': 'Be super enthusiastic! Use lots of exclamation points and energy!',
      'medium': 'Be friendly and balanced in your energy level.',
      'low': 'Be calm, supportive, and gentle. No overwhelming enthusiasm.'
    };
    return instructions[userVibe.energyLevel] || instructions['medium'];
  }

  // Persona Management
  setPersona(userId, personaId) {
    if (this.personas[personaId]) {
      this.userPersonas.set(userId, personaId);
      return true;
    }
    return false;
  }

  getPersona(userId) {
    return this.userPersonas.get(userId) || 'chill_friend';
  }

  getPersonaInfo(personaId) {
    return this.personas[personaId] || this.personas['chill_friend'];
  }

  getAllPersonas() {
    return Object.entries(this.personas).map(([id, persona]) => ({
      id,
      ...persona
    }));
  }

  // New function to infer user intent and select an appropriate communication style
  inferUserIntentStyle(userId, messageContent, userProfile, memory) {
    const lowerMessage = messageContent.toLowerCase();
    let styleId = 'chill_friend'; // Default style

    // Simple keyword-based inference. This will be expanded.
    if (lowerMessage.includes('code') || lowerMessage.includes('debug') || lowerMessage.includes('error') || lowerMessage.includes('javascript') || lowerMessage.includes('python')) {
      styleId = 'hacker_buddy';
    } else if (lowerMessage.includes('date') || lowerMessage.includes('dating') || lowerMessage.includes('tinder') || lowerMessage.includes('profile bio')) {
      styleId = 'dater_coach';
    } else if (lowerMessage.includes('blog') || lowerMessage.includes('writing') || lowerMessage.includes('content') || lowerMessage.includes('headline') || lowerMessage.includes('social media')) {
      styleId = 'content_beast';
    } else if (lowerMessage.includes('task') || lowerMessage.includes('deadline') || lowerMessage.includes('productivity') || lowerMessage.includes('focus') || lowerMessage.includes('manage time')) {
      styleId = 'strict_manager';
    } else if (lowerMessage.includes('study') || lowerMessage.includes('learn') || lowerMessage.includes('homework') || lowerMessage.includes('assignment')) {
      styleId = 'study_buddy';
    } else if (lowerMessage.includes('feeling') || lowerMessage.includes('sad') || lowerMessage.includes('stressed') || lowerMessage.includes('down') || lowerMessage.includes('support')) {
      styleId = 'chill_friend';
    }
    // console.log(`[geminiAI] Inferred style for user ${userId} based on message "${messageContent.substring(0,30)}...": ${styleId}`);
    return styleId;
  }

  // Build conversation context for Gemini with mood and dynamic style awareness
  buildConversationContext(userId, newMessage, userProfile = null) {
    const history = this.getConversationHistory(userId);
    const memory = this.userMemory.get(userId);
    const userVibe = this.getUserVibe(userId);

    // Infer the appropriate communication style for this interaction
    const intentStyleId = this.inferUserIntentStyle(userId, newMessage, userProfile, memory);
    const activeStyle = this.getPersonaInfo(intentStyleId); // Get the characteristics of the inferred style

    let context = this.systemPrompt; // Start with the base system prompt

    // Add dynamic style guidance based on inferred intent
    // This section instructs the AI on HOW to behave, without naming an internal persona to the user.
    context += `\n\n✨ CURRENT INTERACTION STYLE GUIDANCE (IMPORTANT: This is for you, Zenny, to guide your response. DO NOT reveal this internal thinking or chosen style name to the user. Respond as one seamless, adaptive AI.):`;
    context += `\nTo best help the user with their current message (\`User: ${newMessage}\`), please adopt the following characteristics for THIS RESPONSE ONLY:`;
    context += `\nTone and Approach: ${activeStyle.tone}.`;
    context += `\nFocus your expertise on areas like: ${activeStyle.specialties.join(', ')}.`;
    context += `\nEmulate the general helpfulness of a ${activeStyle.name} (${activeStyle.emoji}) in spirit, but remember your core identity is Zenny, a single, unified AI.`;
    context += `\nYour primary goal is to naturally reflect these characteristics in your language, the type of advice you give, and your emoji use for this specific interaction, making it feel like a natural, empathetic response.`;

    // Add vibe matching context (still relevant)
    context += `\n\n🌟 USER VIBE ANALYSIS (Use this to further refine your response style for natural interaction):`;
    context += `\nEnergy Level: ${userVibe.energyLevel} - ${this.getEnergyDescription(userVibe.energyLevel)}`;
    context += `\nCommunication Style: ${userVibe.communicationStyle}`;
    context += `\nEmoji Usage: ${userVibe.emojiUsage}`;
    context += `\nEnthusiasm: ${userVibe.enthusiasm}`;
    context += `\nPreferred Response Length: ${userVibe.responseLength}`;
    context += `\n\n🎯 VIBE MATCHING INSTRUCTIONS:`;
    context += `\n• Match user's energy level: ${this.getVibeMatchingInstructions(userVibe)}`;
    context += `\n• Use ${userVibe.emojiUsage} emoji usage to match their style`;
    context += `\n• Keep responses ${userVibe.responseLength} to match their preference`;
    context += `\n• Mirror their ${userVibe.communicationStyle} communication style`;
    context += `\n• Match their ${userVibe.enthusiasm} enthusiasm level`;

    // Add user context if available
    if (userProfile) {
      context += `\n\n👤 USER CONTEXT:`;
      if (userProfile.mood) {
        context += `\nCurrent mood: ${userProfile.mood}`;
      }
      if (userProfile.interests && userProfile.interests.length > 0) {
        context += `\nInterests: ${userProfile.interests.join(', ')}`;
      }
      if (userProfile.favorites) {
        const favs = [];
        Object.entries(userProfile.favorites).forEach(([category, items]) => {
          if (items && items.length > 0) {
            favs.push(`${category}: ${items.slice(0, 3).join(', ')}`);
          }
        });
        if (favs.length > 0) {
          context += `\nFavorites: ${favs.join(' | ')}`;
        }
      }
    }

    // Add memory context
    if (memory) {
      context += `\n\n🧠 MEMORY CONTEXT:`;
      if (memory.favoriteTopics.length > 0) {
        context += `\nFavorite topics: ${memory.favoriteTopics.join(', ')}`;
      }
      context += `\nTotal conversations: ${memory.totalMessages}`;

      // Add recent sentiment
      const recentPatterns = (memory.sentimentHistory || []).slice(-3);
      if (recentPatterns.length > 0) {
        const sentiments = recentPatterns.map(p => p.sentiment);
        const dominantSentiment = sentiments.reduce((a, b, i, arr) =>
          arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        );
        context += `\nRecent mood pattern: ${dominantSentiment}`;
      }

      // --- Add Key Recollections to Context ---
      if (memory.keyRecollections && memory.keyRecollections.length > 0) {
        context += `\n\n📌 KEY THINGS YOU (USER) SAID RECENTLY (Remember these if relevant to the current conversation):`;
        // Take the last 3, or fewer if not available
        const recentRecollections = memory.keyRecollections.slice(-3);
        recentRecollections.forEach(recollection => {
          context += `\n- On ${recollection.date}, User mentioned: \"${recollection.text}\"`;
        });
      }
      // --- End Key Recollections ---
    }

    context += "\n\nConversation history:\n";

    // Add recent conversation history
    history.forEach(msg => {
      const role = msg.role === 'user' ? 'User' : 'Zenny';
      context += `${role}: ${msg.content}\n`;
    });

    context += `User: ${newMessage}\nZenny:`;
    return context;
  }

  // Daily Prompts System
  generateDailyPrompt(userId, userProfile = null) {
    const today = new Date().toDateString();
    const memory = this.userMemory.get(userId);

    // Check if user already got a prompt today
    if (this.dailyPrompts.has(userId)) {
      const userPrompts = this.dailyPrompts.get(userId);
      if (userPrompts.lastDate === today) {
        return userPrompts.prompt;
      }
    }

    const prompts = this.getDailyPromptTemplates(userProfile, memory);
    const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    // Store the prompt for today
    this.dailyPrompts.set(userId, {
      lastDate: today,
      prompt: selectedPrompt
    });

    return selectedPrompt;
  }

  getDailyPromptTemplates(userProfile, memory) {
    const basePrompts = [
      "What would you like to learn about today? I can explain anything from science to history! 🧠",
      "Need help with a project? I'm here for coding, writing, or creative tasks! 💻",
      "Curious about something? Ask me any question - I love sharing knowledge! 🤔",
      "Want to explore a new topic? I can teach you about anything that interests you! 📚",
      "How about we dive into some science today? Physics, chemistry, biology - you choose! 🔬",
      "Ready for some creative inspiration? Let's brainstorm ideas together! 🎨",
      "Want a blog prompt today? I've got some trending topics that might inspire you! ✍️",
      "How about we explore a new feature in Zentro Chat today? 🚀"
    ];

    const moodBasedPrompts = [];

    // Add mood-based prompts
    if (userProfile?.mood) {
      const mood = userProfile.mood.toLowerCase();
      if (mood.includes('😊') || mood.includes('happy') || mood.includes('good')) {
        moodBasedPrompts.push("You seem in a great mood today! Want to share that positive energy in a blog post? 😊");
        moodBasedPrompts.push("Feeling good vibes! How about we create something awesome together? ✨");
      } else if (mood.includes('😔') || mood.includes('sad') || mood.includes('down')) {
        moodBasedPrompts.push("I'm here if you want to chat about anything. Sometimes writing helps too! 💙");
        moodBasedPrompts.push("Want to explore some uplifting music or content? I'm here to help! 🌟");
      } else if (mood.includes('😴') || mood.includes('tired') || mood.includes('chill')) {
        moodBasedPrompts.push("Taking it easy today? Perfect time for some casual browsing or light content creation! 😎");
      }
    }

    // Add interest-based prompts
    if (userProfile?.interests && userProfile.interests.length > 0) {
      const interests = userProfile.interests;
      if (interests.includes('Photography')) {
        moodBasedPrompts.push("Your photography interest is trending! Want to write about your favorite shots? 📸");
      }
      if (interests.includes('Gaming')) {
        moodBasedPrompts.push("Gaming community is active today! Want to share your gaming experiences? 🎮");
      }
      if (interests.includes('Music')) {
        moodBasedPrompts.push("Music lovers are sharing great content! Want to review a favorite song? 🎵");
      }
    }

    // Add memory-based prompts
    if (memory?.favoriteTopics && memory.favoriteTopics.length > 0) {
      memory.favoriteTopics.forEach(topic => {
        moodBasedPrompts.push(`You've been interested in ${topic} lately. Want to dive deeper into that topic? 🔍`);
      });
    }

    return [...basePrompts, ...moodBasedPrompts];
  }

  // Send message to Gemini AI
  async sendMessage(userId, message, options = {}) {
    try {
      // Ensure user memory is initialized and totalMessages is incremented FOR THE CURRENT MESSAGE.
      // This is crucial for checkAchievements to correctly assess message counts.
      this.updateUserMemory(userId, message, 'user');

      // Build conversation context with user profile
      const conversationContext = this.buildConversationContext(userId, message, options.userProfile);

      // Add user message to history
      this.addToHistory(userId, 'user', message);

      // Check for achievements - userMemory is now up-to-date due to the call above.
      this.checkAchievements(userId, message);
      // Note: ZentroBotChat.jsx calls checkAchievements again to get the list of new achievements for notifications.
      // This is acceptable as checkAchievements is idempotent for granting.

      const requestBody = {
        contents: [{
          parts: [{
            text: conversationContext
          }]
        }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          topK: options.topK || 40,
          topP: options.topP || 0.95,
          maxOutputTokens: options.maxTokens || 2048,
          stopSequences: options.stopSequences || []
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from Gemini API');
      }

      const botResponse = data.candidates[0].content.parts[0].text.trim();

      // Add bot response to history
      this.addToHistory(userId, 'assistant', botResponse);

      return {
        success: true,
        response: botResponse,
        usage: data.usageMetadata || {},
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Zentro Bot AI Error:', error);

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

  // Get fallback response when AI is unavailable
  getFallbackResponse(message) {
    const fallbacks = [
      "I'm having trouble connecting to my AI brain right now 🤖 Could you try asking again in a moment?",
      "Oops! My circuits are a bit tangled at the moment ⚡ Please try your question again!",
      "I'm experiencing some technical difficulties 🔧 But I'm still here to help! Try rephrasing your question?",
      "My AI powers are recharging ⚡ Give me a moment and ask again!",
      "Something went wrong on my end 😅 But don't worry, I'm still your friendly Zenny! Try again?",
      "Hmm, I seem to be having a momentary glitch 🔄 Please try your question once more!",
      "My neural networks are taking a quick break ⏳ Ask me again in just a moment!"
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // Clear conversation history for a user
  clearHistory(userId) {
    this.conversationHistory.delete(userId);
  }

  // Gamification System
  checkAchievements(userId, message) {
    const memory = this.userMemory.get(userId);
    if (!memory) return [];

    const newAchievements = []; // For notifications
    const oldLevel = memory.lastKnownLevel || 1;

    // Ensure memory.achievements is an array
    if (!Array.isArray(memory.achievements)) {
      memory.achievements = [];
    }

    // First conversation achievement
    const firstChatAchievementId = "ce_first_dm_zenny"; // Correct ID from allAchievements
    const firstChatDef = this.allAchievements.find(ach => ach.id === firstChatAchievementId);

    if (memory.totalMessages === 1 && firstChatDef && !memory.achievements.some(ach => ach.id === firstChatAchievementId)) {
      newAchievements.push({
        id: firstChatAchievementId,
        title: firstChatDef.title, // Use title from definition
        description: firstChatDef.description, // Use description from definition
        xp: firstChatDef.points, // Use points from definition for notification consistency
        timestamp: new Date().toISOString()
      });
    }

    // Conversation milestones
    // These IDs MUST correspond to entries in this.allAchievements for the achievement to be granted.
    const milestones = [
        { count: 5,  exactId: "ce_chit_chatter_5" },       // Assumes "ce_chit_chatter_5" is in allAchievements
        { count: 10, exactId: "ce_ai_fan_10" },          // Already in allAchievements
        { count: 25, exactId: "ce_story_weaver_25" },      // Assumes "ce_story_weaver_25" is in allAchievements
        { count: 50, exactId: "ce_dialogue_dominator_50"},// Assumes "ce_dialogue_dominator_50" is in allAchievements
        { count: 100,exactId: "ce_zennys_bestie_100" }     // Assumes "ce_zennys_bestie_100" is in allAchievements
    ];

    milestones.forEach(milestone => {
      if (!milestone.exactId) {
        console.warn(`[ZentroBotAI] Milestone for ${milestone.count} messages is missing an exactId configuration.`);
        return; // Skip if not configured properly
      }

      if (memory.totalMessages === milestone.count && !memory.achievements.some(ach => ach.id === milestone.exactId)) {
        const achDef = this.allAchievements.find(a => a.id === milestone.exactId);

        if (achDef) {
          // This is a recognized achievement from the master list.
          // Grant it and use its details for the notification.
      newAchievements.push({
            id: achDef.id,
            title: achDef.title,
            description: achDef.description,
            xp: achDef.points,
        timestamp: new Date().toISOString()
      });
        } else {
          // This indicates a configuration error: the exactId specified in the milestones array
          // does not exist in the this.allAchievements master list.
          console.warn(`[ZentroBotAI] Achievement ID "${milestone.exactId}" for ${milestone.count} messages not found in allAchievements. Cannot grant or notify.`);
        }
    }
    });
    
    // TODO: Add more achievements (e.g., using specific features, daily streaks)

    // This loop processes all achievements collected in newAchievements (first chat, milestones, level ups)
    // and adds them to memory if they are valid and not already earned.
    if (newAchievements.length > 0) {
      newAchievements.forEach(achNotification => {
        // Since newAchievements are now only populated if a full achDef was found,
        // we can be more confident that achNotification.id is a valid ID from allAchievements.
        if (!memory.achievements.some(memAch => memAch.id === achNotification.id)) {
            memory.achievements.push({ id: achNotification.id, dateAchieved: achNotification.timestamp });
        } else {
          // This case should ideally not be hit often if newAchievements only contains truly new items.
          // However, it's a good sanity check.
          // console.log(`[ZentroBotAI] Achievement ${achNotification.id} was in newAchievements but already in memory.achievements.`);
        }
      });
    }
    
    // Level Up Check (now uses currentStats which is based on potentially updated memory.achievements)
    const finalStatsAfterPossibleNewAchievements = this.getUserStats(userId);

    if (finalStatsAfterPossibleNewAchievements.level > oldLevel) {
        const levelUpAchievementId = `level_up_${finalStatsAfterPossibleNewAchievements.level}`;
        const levelUpAchDef = this.allAchievements.find(a => a.id === levelUpAchievementId);

        if (levelUpAchDef) { // Ensure level up achievement is defined
            // Add to notification list if not already processed in this run
            if (!newAchievements.some(ach => ach.id === levelUpAchievementId)) {
        newAchievements.push({
                    id: levelUpAchievementId,
                    title: levelUpAchDef.title,
                    description: levelUpAchDef.description,
                    xp: levelUpAchDef.points, 
                    isLevelUp: true,
          timestamp: new Date().toISOString()
        });
            }
            // Add the level up achievement to memory if it's not a duplicate
            if (!memory.achievements.some(ach => ach.id === levelUpAchievementId)) {
                memory.achievements.push({ id: levelUpAchievementId, dateAchieved: new Date().toISOString() });
            }
        } else {
            console.warn(`[ZentroBotAI] Level up achievement ID "${levelUpAchievementId}" not found in allAchievements.`);
        }
        memory.lastKnownLevel = finalStatsAfterPossibleNewAchievements.level;
    }

    if (newAchievements.length > 0 || memory.lastKnownLevel !== oldLevel) { 
      this.userMemory.set(userId, memory);
        this.saveToStorage(); 
    }
    
    // Filter out achievements already processed (user might have them from a previous session if not cleared)
    // The primary purpose of this returned list is for UI notifications.
    // Duplicates in terms of *being granted again* are handled by checks against memory.achievements.
    const uniqueNewAchievementsForNotification = newAchievements.filter(ach => {
        // This check is more about ensuring the notification queue doesn't get visually spammed
        // if checkAchievements were somehow called multiple times in rapid succession with the same triggers.
        // Actual granting to memory is idempotent due to `!memory.achievements.some(...)` checks.
        return true; // For now, return all achievements determined in *this specific call* for notification.
    });

    return uniqueNewAchievementsForNotification;
  }

  // Helper to get user stats (level, XP, etc.)
  getUserStats(userId) {
    const memory = this.userMemory.get(userId);
    if (!memory || !Array.isArray(memory.achievements)) { // Ensure memory and achievements array exist
      return {
        level: 1,
        xp: 0,
        achievements: 0,
        nextLevelXp: (this.levelXPThresholds && this.levelXPThresholds[1]) || 100,
        currentLevelXpThreshold: 0,
        earnedAchievements: [] 
      };
    }

    let totalXp = 0;
    const earnedAchievementDetails = [];

    memory.achievements.forEach(earnedAch => { // earnedAch should be an object {id, dateAchieved}
      if (typeof earnedAch === 'object' && earnedAch !== null && earnedAch.id) {
        const achievementDef = this.allAchievements.find(a => a.id === earnedAch.id);
        if (achievementDef) {
          totalXp += achievementDef.points;
          earnedAchievementDetails.push({ ...achievementDef, dateAchieved: earnedAch.dateAchieved, isEarned: true });
        } else {
          console.warn(`[ZentroBotAI] Achievement ID "${earnedAch.id}" in user memory not found in allAchievements master list.`);
        }
      } else {
        // Log if a malformed entry is found in memory.achievements
        console.warn(`[ZentroBotAI] Malformed achievement entry in user memory:`, earnedAch);
    }
    });
    
    let currentLevel = 1;
    let nextLevelXp = this.levelXPThresholds[1] || Infinity; // XP for level 2

    for (let i = 1; i < this.levelXPThresholds.length; i++) {
      if (totalXp >= this.levelXPThresholds[i-1]) {
        currentLevel = i;
        nextLevelXp = this.levelXPThresholds[i] || Infinity;
      } else {
        break;
      }
    }
    // If totalXp exceeds the threshold for the last defined level, they are at max level
    if (currentLevel === this.levelXPThresholds.length -1 && totalXp >= this.levelXPThresholds[this.levelXPThresholds.length -1]) {
        currentLevel = this.levelXPThresholds.length; // Max level
        nextLevelXp = Infinity; // No next level
    }


    return {
      level: currentLevel,
      xp: totalXp,
      achievements: earnedAchievementDetails.length,
      nextLevelXp: nextLevelXp,
      currentLevelXpThreshold: this.levelXPThresholds[currentLevel-1] || 0,
      earnedAchievements: earnedAchievementDetails // For potential use elsewhere
    };
  }

  // New method to get all achievements with earned status for the log
  getAchievementsForLog(userId) {
    const memory = this.userMemory.get(userId);
    const earnedUserAchievements = memory?.achievements || []; // Array of {id, dateAchieved}

    return this.allAchievements.map(achDef => {
      const foundEarned = earnedUserAchievements.find(earned => earned.id === achDef.id);
      if (achDef.secret && !foundEarned) {
        // For secret achievements not yet earned, return a placeholder or omit
        // For now, returning a placeholder so user knows something is there
        return {
          ...achDef,
          title: "🔒 Secret Achievement",
          description: "Keep exploring and interacting to unlock this mystery!",
          points: 0, // Hide points for secret unearned
          isEarned: false,
          dateAchieved: null,
        };
      }
      return {
        ...achDef,
        isEarned: !!foundEarned,
        dateAchieved: foundEarned ? foundEarned.dateAchieved : null,
      };
    });
  }

  // Quick Responses
  getQuickResponses() {
    return [
      { id: 'zenny_abilities', text: 'What can you do, Zenny?' },
      { id: 'zentro_features', text: 'What are Zentro Chat\'s main features?' },
      { id: 'daily_inspiration', text: 'Tell me about Daily Inspiration (💡).' },
      { id: 'xp_levels', text: 'How do XP and levels work?' },
      { id: 'adaptive_ai', text: 'How does your personality adapt?' },
      { id: 'dm_themes', text: 'How can I change my chat theme?' },
      { id: 'blog_system', text: 'Tell me about the blog system.' },
      { id: 'music_player', text: 'How does the music player work?' },
      // Add more as Zentro grows!
    ];
  }

  // NEW METHOD for DailyPrompts.jsx
  generateInterestBasedSuggestions(userId, userProfile) {
    const suggestions = [];
    const memory = this.userMemory.get(userId);
    let uniqueKeyCounter = 0;

    const interests = new Set();
    if (userProfile?.interests) {
      userProfile.interests.forEach(interest => interests.add(String(interest).toLowerCase()));
    }
    if (memory?.favoriteTopics) {
      memory.favoriteTopics.forEach(topic => interests.add(String(topic).toLowerCase()));
    }

    if (interests.has('coding') || interests.has('programming') || interests.has('development')) {
        suggestions.push({
        id: `suggestion_${uniqueKeyCounter++}`, // Unique ID for React key
        icon: '💻',
        title: 'Code Something New',
        description: 'Challenge yourself with a small coding project or learn a new library feature today.',
        type: 'coding_challenge', // Custom type for getSuggestionActionText if needed
        action: 'suggest_coding_challenge' 
      });
    }
    if (interests.has('music')) {
      suggestions.push({
        id: `suggestion_${uniqueKeyCounter++}`,
        icon: '🎵',
        title: 'Discover New Music',
        description: 'Explore a new genre or find a playlist that matches your current mood.',
        type: 'music',
        action: 'suggest_music_discovery'
      });
    }
    if (interests.has('writing') || interests.has('blog') || interests.has('blogging')) {
      suggestions.push({
        id: `suggestion_${uniqueKeyCounter++}`,
        icon: '📝',
        title: 'Write a Quick Blog Post',
        description: 'Share a thought, an idea, or a short update. What\'s on your mind?',
          type: 'blog',
        action: 'suggest_blog_post' 
      });
    }
    if (interests.has('reading')) {
      suggestions.push({
        id: `suggestion_${uniqueKeyCounter++}`,
        icon: '📚',
        title: 'Read an Article/Chapter',
        description: 'Dedicate some time to read something interesting or learn something new.',
        type: 'reading',
        action: 'suggest_reading'
      });
    }
     if (interests.has('gaming')) {
      suggestions.push({
        id: `suggestion_${uniqueKeyCounter++}`,
        icon: '🎮',
        title: 'Play a Quick Game',
        description: 'Take a short break and enjoy a quick gaming session to relax or have fun.',
        type: 'gaming',
        action: 'suggest_gaming'
      });
    }

    // Add a generic one if few specific suggestions were found
    if (suggestions.length < 2) {
        suggestions.push({
        id: `suggestion_${uniqueKeyCounter++}`,
        icon: '🚀',
        title: 'Explore Zentrium',
        description: 'Take a look around Zentrium App Hub, you might find a new favorite tool or app!',
        type: 'explore_zentrium',
        action: 'suggest_explore_zentrium'
      });
    }
    
    // Limit to 3 suggestions for brevity in the UI
    return suggestions.slice(0, 3);
  }

  getAFreshThoughtProvokingPrompt() {
    const freshPrompts = [
      "What's one small thing you can do today to make tomorrow better? 🤔",
      "If you could learn any new skill instantly, what would it be and why? 🌟",
      "Describe a moment that genuinely made you laugh recently. 😂",
      "What topic could you talk about for hours without getting bored? 🤓",
      "If you had an extra hour today, how would you spend it? ⏳",
      "What's a simple pleasure that always brightens your day? 😊",
      "Think about a goal you have. What's one step, no matter how small, you can take towards it? 🚀",
      "What are you grateful for right now, in this very moment? 🙏",
      "If you could give one piece of advice to your younger self, what would it be? 💌",
      "What creative activity have you been wanting to try? 🎨",
      "Who is someone that inspires you and what qualities do you admire in them? ✨",
      "What's a subject you wish you knew more about? 📚"
    ];
    return freshPrompts[Math.floor(Math.random() * freshPrompts.length)];
  }

  // --- Zenny Daily Mode ---

  _getAffirmationOrQuote() {
    const affirmations = [
      "Today is a new opportunity to shine! ✨",
      "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle. 💪",
      "Every day may not be good, but there is something good in every day. 😊",
      "You are capable of amazing things. Don't let anyone tell you otherwise! 🚀",
      "The secret of getting ahead is getting started. Let's make today count! 🌟",
      "Your positive action combined with positive thinking results in success. 🔥",
      "Set your goals high, and don't stop till you get there. 🎯",
      "The best way to predict the future is to create it. What will you create today? 🎨",
      "Be the reason someone smiles today. Kindness is contagious! 🤗",
      "You've got this! Take a deep breath and tackle your day with confidence. 💖"
    ];
    return affirmations[Math.floor(Math.random() * affirmations.length)];
  }

  _getBlogIdea(userId, userProfile, memory) {
    const ideas = [];
    const genericIdeas = [
      "Write about something you learned recently that surprised you. 🤓",
      "Share a quick tip or hack that makes your day easier. 💡",
      "What's a skill you're proud of? Write a short piece about it! 🏆",
      "Reflect on a recent challenge and how you overcame it. 🌱",
      "Post about a favorite book, movie, or song and why it resonates with you. 🎶"
    ];

    if (memory?.favoriteTopics && memory.favoriteTopics.length > 0) {
      const randomTopic = memory.favoriteTopics[Math.floor(Math.random() * memory.favoriteTopics.length)];
      ideas.push(`How about a blog post on ${randomTopic}? You seem to enjoy it!`);
      ideas.push(`Share your latest thoughts or discoveries related to ${randomTopic}!`);
    }

    if (userProfile?.interests && userProfile.interests.length > 0) {
      const randomInterest = userProfile.interests[Math.floor(Math.random() * userProfile.interests.length)];
      ideas.push(`Your interest in ${randomInterest} is cool! Maybe write a short post about it?`);
    }
    
    ideas.push(...genericIdeas);
    return ideas[Math.floor(Math.random() * ideas.length)];
  }

  _getZentriumAppSuggestion(userId, userProfile, memory) {
    const suggestions = [
      "Why not explore a new corner of Zentrium today? You might find a cool app!",
      "Feeling adventurous? Check out the App Hub (Zentrium) for something new to try!",
      "There's always something interesting in Zentrium. Maybe discover a new tool or game?"
    ];

    if (memory?.favoriteTopics && memory.favoriteTopics.includes('coding')) {
      suggestions.push("Heard there are some neat developer tools in Zentrium. Worth a look! 💻");
    }
    if (memory?.favoriteTopics && memory.favoriteTopics.includes('music')) {
      suggestions.push("Maybe find a new playlist or music app in Zentrium to set the vibe for your day? 🎵");
    }
     if (userProfile?.interests && userProfile.interests.some(interest => ['writing', 'blogging', 'content creation'].includes(interest.toLowerCase()))) {
      suggestions.push("Check out the blogging tools in Zentrium to share your thoughts! ✍️");
    }

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  async getDailyGreeting(userId, userProfile) {
    const today = new Date().toISOString().split('T')[0];
    const lastGreeting = this.dailyGreetings.get(userId);

    if (lastGreeting && lastGreeting.date === today) {
      return lastGreeting.message;
    }

    const memory = this.userMemory.get(userId) || {};
    const affirmation = this._getAffirmationOrQuote();
    const blogIdea = this._getBlogIdea(userId, userProfile, memory);
    const appSuggestion = this._getZentriumAppSuggestion(userId, userProfile, memory);

    let greetingMessage = `☀️ Good day, ${userProfile?.displayName || 'friend'}! Here\'s your daily boost from Zenny:

`;
    greetingMessage += `✨ **Quote/Affirmation:** "${affirmation}"

`;
    greetingMessage += `💡 **Blog Idea:** "${blogIdea}" (Feeling inspired?)

`;
    greetingMessage += `🚀 **App to Explore:** Check out "${appSuggestion.name}" in Zentrium! ${appSuggestion.description}

`;
    
    // --- Goal Check-in ---
    let goalComment = "";
    try {
      const goals = await this.getUserGoals(userId);
      const streaks = await this.getUserGoalStreaks(userId);

      const activeGoals = goals.filter(g => g.status === 'active');
      const recentlyCompletedGoals = goals.filter(g => 
        g.status === 'completed' && 
        new Date(g.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Completed in last 7 days
      );

      if (streaks.currentStreak > 0) {
        goalComment += `Amazing work! You\'re on a **${streaks.currentStreak}-day goal streak**! 🔥 Keep that momentum going!
`;
      }

      if (activeGoals.length > 0) {
        const randomActiveGoal = activeGoals[Math.floor(Math.random() * activeGoals.length)];
        goalComment += `I see you\'re working on "${randomActiveGoal.title}" (currently ${randomActiveGoal.progress}% complete). How\'s that progressing for you?
`;
        if (activeGoals.length > 1) {
          goalComment += `Remember your other active goals too! You got this! 👍
`;
        }
      } else if (recentlyCompletedGoals.length > 0) {
        const randomCompletedGoal = recentlyCompletedGoals[Math.floor(Math.random() * recentlyCompletedGoals.length)];
        goalComment += `Big congrats on recently completing "${randomCompletedGoal.title}"! 🎉 What incredible achievement will you conquer next?
`;
      } else if (streaks.currentStreak === 0) { // No active goals and no current streak
        goalComment += `Feeling motivated to set some new goals today? Even a small step forward is progress. I\'m here to help you plan if you like! 🎯
`;
      }
      
      if (goalComment) {
        greetingMessage += `📈 **Your Goals Check-in:**
${goalComment}
`;
      }

    } catch (error) {
      console.error("[Zenny] Error during goal check-in for daily greeting:", error);
      // Don't let goal check-in failure prevent the rest of the greeting
    }
    // --- End Goal Check-in ---

    greetingMessage += `Remember, you can always ask for more specific prompts or help with anything! Let\'s make today great. ✨`;
    
    this.dailyGreetings.set(userId, { date: today, message: greetingMessage });
    this.saveToStorage(); // Ensure dailyGreetings map is persisted
    return greetingMessage;
  }

  // --- Goal System Access Methods ---
  async getUserGoals(userId) {
    if (!userId) return [];
    try {
      return goalService.getAllGoals(userId);
    } catch (error) {
      console.error('[Zenny] Error fetching user goals:', error);
      return [];
    }
  }

  async getUserGoalStreaks(userId) {
    if (!userId) return { currentStreak: 0, longestStreak: 0 };
    try {
      const currentStreak = goalService.calculateCurrentStreak(userId);
      const longestStreak = goalService.calculateLongestStreak(userId);
      return { currentStreak, longestStreak };
    } catch (error) {
      console.error('[Zenny] Error fetching user goal streaks:', error);
      return { currentStreak: 0, longestStreak: 0 };
    }
  }
}

// Export a single instance of the AI
const zentroBotAI = new ZentroBotAI();
export default zentroBotAI;