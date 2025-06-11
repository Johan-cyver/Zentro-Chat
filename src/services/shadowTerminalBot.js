// Shadow Terminal Bot - AI Assistant for Shadow Network Terminal

class ShadowTerminalBot {
  constructor() {
    this.name = 'SHADOW_BOT';
    this.personality = 'mysterious_hacker';
    this.responses = this.initializeResponses();
    this.context = {
      lastCommand: null,
      userLevel: 1,
      helpRequests: 0,
      sessionStart: Date.now()
    };
  }

  initializeResponses() {
    return {
      greetings: [
        "🤖 SHADOW_BOT online. How may I assist your shadow operations?",
        "🔒 Secure connection established. SHADOW_BOT at your service.",
        "👻 Welcome to the shadows. I am your digital guide.",
        "🛡️ SHADOW_BOT initialized. Ready to assist with terminal operations."
      ],
      
      help: {
        general: `
🤖 SHADOW_BOT ASSISTANCE MENU
═══════════════════════════════

📋 BASIC COMMANDS:
• help - Show this menu
• zones - List all available zones  
• connect <zone> - Navigate to a zone
• status - Show your shadow profile
• id - Display your Secret ID
• scan - Scan for active shadows
• clear - Clear terminal history
• exit - Exit Secret Alley

🎯 ZONE SHORTCUTS:
• inf/infiltration - Infiltration Protocol
• arena/pvp/battle - Masked Arena
• cipher/crypto - Cipher Board  
• whispers/msg - Whisper Network
• forge/squad - Squad Forge
• network/net - Network Map
• void - Void Zone (Advanced)

💡 PRO TIPS:
• Use 'bot help <topic>' for specific guidance
• Type 'bot status' for personalized advice
• Commands are case-insensitive
• Use Tab for auto-completion (coming soon)

🔒 Need help with a specific zone? Ask me!
        `,
        
        infiltration: `
🎮 INFILTRATION PROTOCOL GUIDE
═══════════════════════════════

🎯 OBJECTIVE: Survive and identify the Ghosts

👥 ROLES:
• ECHO - Complete tasks, vote out Ghosts
• GHOST - Sabotage and eliminate Echoes  
• CIPHER - Decrypt logs, detect deception
• AGENT - Special abilities, protect Echoes

🎲 HOW TO PLAY:
1. Join lobby (need 6-12 players)
2. Get assigned a secret role
3. Complete tasks or sabotage
4. Discuss and vote during meetings
5. Win by completing objectives

💡 TIPS:
• Watch for suspicious behavior
• Use emergency meetings wisely
• Trust but verify information
• Communication is key
        `,
        
        cipher: `
🧩 CIPHER BOARD GUIDE
═══════════════════════

🎯 OBJECTIVE: Solve puzzles to earn Shadow XP

🔐 CIPHER TYPES:
• ENCODING - Binary, Base64, ASCII
• CLASSICAL - Caesar, Vigenère, Substitution
• MATHEMATICS - Equations, Sequences
• ALGORITHMS - Programming puzzles

💡 SOLVING TIPS:
• Read hints carefully
• Try common patterns first
• Use online tools if needed
• Case sensitivity matters
• Think outside the box

🏆 REWARDS:
• Easy: 15-30 XP
• Medium: 30-75 XP  
• Hard: 75-150 XP
• Extreme: 150+ XP
        `,
        
        arena: `
⚔️ MASKED ARENA GUIDE
═══════════════════════

🎯 OBJECTIVE: Battle other shadows in various challenges

🥊 BATTLE TYPES:
• CODE_DUEL - Programming challenges
• LOGIC_BATTLE - Puzzle solving races
• SPEED_HACK - Fast completion contests
• MIND_GAMES - Psychological challenges

💪 PREPARATION:
• Practice in training mode
• Study opponent patterns
• Master different battle types
• Build your reputation

🏆 RANKINGS:
• ROOKIE → VETERAN → ELITE → LEGENDARY
• Win battles to climb ranks
• Unlock exclusive rewards
        `,
        
        squads: `
🛡️ SQUAD FORGE GUIDE
═══════════════════════

🎯 OBJECTIVE: Form alliances for team battles

👥 SQUAD FEATURES:
• 3-10 members per squad
• Specialized roles and strategies
• Team battles and wars
• Shared resources and XP

🔧 MANAGEMENT:
• Create or join existing squads
• Set squad specialization
• Recruit skilled members
• Plan coordinated attacks

⚔️ SQUAD WARS:
• Epic team vs team battles
• Territory control modes
• Seasonal tournaments
• Massive XP rewards
        `
      },

      errors: [
        "❌ Command not recognized. Type 'help' for available commands.",
        "🤖 I don't understand that command. Try 'help' for guidance.",
        "⚠️ Invalid syntax. Use 'help' to see proper command format.",
        "🔍 Command not found. Type 'zones' to see available destinations."
      ],

      encouragement: [
        "🎯 You're getting the hang of this! Keep exploring.",
        "💪 Your shadow skills are improving. Well done!",
        "🔥 Excellent work! The shadows welcome your progress.",
        "⭐ Outstanding! You're becoming a true shadow operative."
      ],

      warnings: [
        "⚠️ Be careful in the void zone - it's dangerous for beginners.",
        "🔒 Some areas require higher clearance levels.",
        "👻 Remember: in the shadows, trust no one completely.",
        "🛡️ Always verify before sharing sensitive information."
      ]
    };
  }

  // Process user input and generate appropriate response
  processInput(input, userProfile) {
    const command = input.toLowerCase().trim();
    this.context.lastCommand = command;

    // Bot-specific commands
    if (command.startsWith('bot ')) {
      return this.handleBotCommand(command.substring(4), userProfile);
    }

    // Analyze command and provide contextual help
    if (command === 'help') {
      this.context.helpRequests++;
      return this.getHelpResponse();
    }

    if (command === 'zones') {
      return this.getZonesResponse();
    }

    if (command.startsWith('connect ')) {
      const zone = command.substring(8);
      return this.getConnectionResponse(zone, userProfile);
    }

    if (command === 'status') {
      return this.getStatusResponse(userProfile);
    }

    if (command === 'scan') {
      return this.getScanResponse();
    }

    if (command === 'id') {
      return this.getIdResponse(userProfile);
    }

    // Default response for unrecognized commands
    return this.getRandomResponse('errors');
  }

  // Handle bot-specific commands
  handleBotCommand(command, userProfile) {
    const parts = command.split(' ');
    const action = parts[0];

    switch (action) {
      case 'help':
        const topic = parts[1];
        return this.getBotHelp(topic);
      
      case 'status':
        return this.getBotStatus(userProfile);
      
      case 'tip':
        return this.getRandomTip();
      
      case 'joke':
        return this.getHackerJoke();
      
      default:
        return "🤖 Bot commands: help, status, tip, joke\nExample: 'bot help cipher'";
    }
  }

  // Get help response based on context
  getHelpResponse() {
    if (this.context.helpRequests === 1) {
      return this.responses.help.general + "\n\n💡 Pro tip: Use 'bot help <topic>' for specific guidance!";
    } else if (this.context.helpRequests > 3) {
      return this.responses.help.general + "\n\n🤖 You seem to need extra help. Try 'bot status' for personalized advice!";
    }
    return this.responses.help.general;
  }

  // Get zones response with current status
  getZonesResponse() {
    return `
🗺️ SHADOW NETWORK ZONES
═══════════════════════

🎮 INFILTRATION - Multiplayer deception game
⚔️ ARENA - Battle other shadows  
🧩 CIPHER - Solve cryptographic puzzles
💬 WHISPERS - Encrypted messaging
🛡️ FORGE - Squad management
🌐 NETWORK - Shadow connections map
💀 VOID - Advanced operations (High risk)

💡 Use: connect <zone> to navigate
Example: connect infiltration
    `;
  }

  // Get connection response with zone-specific advice
  getConnectionResponse(zone, userProfile) {
    const zoneAdvice = {
      infiltration: "🎮 Entering Infiltration Protocol. Remember: trust no one, verify everything!",
      arena: "⚔️ Welcome to the Arena. May your code be swift and your logic sharp!",
      cipher: "🧩 Cipher Board accessed. Prepare your mind for cryptographic challenges!",
      whispers: "💬 Whisper Network active. Your messages will be encrypted and ephemeral.",
      forge: "🛡️ Squad Forge online. Time to build your shadow alliance!",
      network: "🌐 Network Map loading. Observe the shadow connections carefully.",
      void: "💀 WARNING: Void Zone detected. Extreme caution advised for your safety!"
    };

    const advice = zoneAdvice[zone] || "🔍 Zone not recognized. Check available zones with 'zones' command.";
    return advice + "\n\n🤖 Need help with this zone? Try 'bot help " + zone + "'";
  }

  // Get status response with personalized advice
  getStatusResponse(userProfile) {
    const level = userProfile?.maskLevel || 1;
    const xp = userProfile?.shadowXP || 0;
    
    let advice = "";
    if (level < 3) {
      advice = "\n\n💡 Recommendation: Focus on cipher solving to gain XP quickly!";
    } else if (level < 5) {
      advice = "\n\n💡 Recommendation: Try infiltration games to improve your skills!";
    } else {
      advice = "\n\n💡 Recommendation: You're ready for void zone operations!";
    }

    return `
🔍 SHADOW PROFILE ANALYSIS
═══════════════════════════

👤 Shadow: ${userProfile?.alias || 'UNKNOWN'}
🎭 Mask Level: ${level}
⚡ Shadow XP: ${xp}
🏆 Reputation: ${userProfile?.reputation || 0}
🕐 Session Time: ${Math.floor((Date.now() - this.context.sessionStart) / 60000)}m

${advice}
    `;
  }

  // Get scan response with mock active shadows
  getScanResponse() {
    const activeShadows = [
      "PHANTOM_BLADE_777 [CIPHER]",
      "VOID_HUNTER_123 [ARENA]", 
      "GHOST_WALKER_456 [WHISPERS]",
      "NEON_STORM_666 [INFILTRATION]",
      "CIPHER_MASTER_X [CIPHER]"
    ];

    return `
📡 SHADOW NETWORK SCAN
═══════════════════════

🔍 Active Shadows Detected: ${activeShadows.length}

${activeShadows.map(shadow => `👻 ${shadow}`).join('\n')}

🤖 Scan complete. Use 'connect <zone>' to join them!
    `;
  }

  // Get ID response
  getIdResponse(userProfile) {
    return `
🆔 SECRET IDENTITY
═══════════════════

🎭 Shadow ID: ${userProfile?.shadowId || 'NOT_GENERATED'}
👤 Alias: ${userProfile?.alias || 'UNKNOWN'}
🔐 Status: ${userProfile?.shadowId ? 'VERIFIED' : 'UNVERIFIED'}

${!userProfile?.shadowId ? "⚠️ Generate your Secret ID first!" : "✅ Identity confirmed. Welcome to the shadows."}
    `;
  }

  // Get bot-specific help
  getBotHelp(topic) {
    if (topic && this.responses.help[topic]) {
      return this.responses.help[topic];
    }
    
    return `
🤖 SHADOW_BOT HELP TOPICS
═══════════════════════════

Available help topics:
• infiltration - Multiplayer game guide
• cipher - Puzzle solving guide  
• arena - Battle system guide
• squads - Team management guide

Usage: bot help <topic>
Example: bot help cipher
    `;
  }

  // Get bot status with personality
  getBotStatus(userProfile) {
    const sessionTime = Math.floor((Date.now() - this.context.sessionStart) / 60000);
    
    return `
🤖 SHADOW_BOT STATUS REPORT
═══════════════════════════════

🔋 System Status: ONLINE
🧠 AI Core: ACTIVE
🔒 Security Level: MAXIMUM
⏱️ Session Time: ${sessionTime}m
📊 Commands Processed: ${this.context.helpRequests + 5}

🎯 Current Assessment:
${this.getPersonalizedAdvice(userProfile)}

💡 Remember: I'm here to help you navigate the shadows safely!
    `;
  }

  // Get personalized advice based on user profile
  getPersonalizedAdvice(userProfile) {
    const level = userProfile?.maskLevel || 1;
    
    if (level < 2) {
      return "You're new to the shadows. Start with cipher puzzles to build your skills.";
    } else if (level < 4) {
      return "You're progressing well. Try infiltration games for advanced training.";
    } else if (level < 6) {
      return "Impressive progress! Consider forming or joining a squad.";
    } else {
      return "You're an elite shadow operative. The void zone awaits your expertise.";
    }
  }

  // Get random tip
  getRandomTip() {
    const tips = [
      "💡 Tip: Use 'clear' to clean your terminal for better focus.",
      "💡 Tip: The void zone has the highest XP rewards but also highest risk.",
      "💡 Tip: Squad battles give bonus XP when you work as a team.",
      "💡 Tip: Whisper messages auto-delete after expiry for security.",
      "💡 Tip: Your mask level determines access to advanced zones.",
      "💡 Tip: Cipher difficulty affects XP rewards - harder = more XP.",
      "💡 Tip: Arena battles improve your shadow combat skills.",
      "💡 Tip: Network map shows real-time shadow activity."
    ];
    
    return tips[Math.floor(Math.random() * tips.length)];
  }

  // Get hacker joke
  getHackerJoke() {
    const jokes = [
      "🤖 Why do hackers prefer dark mode? Because light attracts bugs! 🐛",
      "🤖 How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡",
      "🤖 Why do shadows make the best programmers? They're experts at debugging in the dark! 🌙",
      "🤖 What's a hacker's favorite type of music? Algo-rhythms! 🎵",
      "🤖 Why don't shadows ever get lost? They always follow the right path! 🛤️"
    ];
    
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // Get random response from category
  getRandomResponse(category) {
    const responses = this.responses[category];
    if (!responses || responses.length === 0) return "🤖 System error.";
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Get greeting message
  getGreeting() {
    return this.getRandomResponse('greetings');
  }
}

// Create singleton instance
const shadowTerminalBot = new ShadowTerminalBot();

export default shadowTerminalBot;
