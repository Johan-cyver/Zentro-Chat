import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaSpinner, FaUserFriends, FaLightbulb, FaTrophy, FaSmile, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import MessageBubble from './MessageBubble';

import PersonaSelector from './PersonaSelector';
import DailyPrompts from './DailyPrompts';
import AchievementNotification from './AchievementNotification';
import AchievementsLogModal from './AchievementsLogModal';
import VibeIndicator from './VibeIndicator';
import EmojiPicker from './EmojiPicker';
import zentroGeminiAI from '../../services/geminiAI';
import hiddenCodeAssistant from '../../services/hiddenCodeAssistant';



const ZentroBotChat = ({ theme, onBack }) => {
  const { userProfile } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickResponses, setShowQuickResponses] = useState(true);
  const [quickResponseSet, setQuickResponseSet] = useState([]);



  // Companion feature states
  // const [showPersonaSelector, setShowPersonaSelector] = useState(false); // Commented out
  const [showDailyPrompts, setShowDailyPrompts] = useState(false);
  // const [currentPersona, setCurrentPersona] = useState('chill_friend'); // Commented out for now, AI will adapt automatically
  const [showAchievementsLog, setShowAchievementsLog] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Voice states
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // ADDED BACK: Definition for initializeCompanionFeatures
  const initializeCompanionFeatures = () => {
    if (!userProfile?.uid) {
      console.warn("[ZentroBotChat] Attempted to initialize companion features without userProfile.uid");
      return;
    }
    // Load user stats
    const stats = zentroGeminiAI.getUserStats(userProfile.uid);
    setUserStats(stats);
    console.log("[ZentroBotChat] Companion features initialized (User stats loaded).");

    // Other initializations like loading specific persona or detailed history for the AI's internal use
    // are handled by zentroGeminiAI service or within other relevant functions.
  };

  // Load conversation history when user profile is available
  useEffect(() => {
    if (userProfile?.uid) {
      console.log('User profile loaded, attempting to load chat history and initialize features...');
      loadConversationHistoryAndGreeting();
      // Fetch quick responses once when user profile is available
      const responses = zentroGeminiAI.getQuickResponses();
      setQuickResponseSet(responses);
    }
  }, [userProfile?.uid]);

  const validateStoredMessage = (msg) => {
    if (!msg || typeof msg !== 'object') return false;
    if (!msg.text || typeof msg.text !== 'string') return false;
    if (!msg.sender || typeof msg.sender !== 'object') return false;
    if (!msg.timestamp || !msg.id) return false;
    return true;
  };

  const loadConversationHistoryAndGreeting = async () => {
    let existingMessages = [];
    let greetingMessageToShow = null;

    // Attempt to load existing history first
    try {
      if (!userProfile?.uid) {
        console.log('No user profile available for loading chat history');
        return;
      }
      const chatKey = `zentro_bot_chat_${userProfile.uid}`;
      const savedMessages = localStorage.getItem(chatKey);
      
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          // Filter out invalid messages
          existingMessages = parsedMessages.filter(msg => {
            const isValid = validateStoredMessage(msg);
            if (!isValid) {
              console.warn('Filtered out invalid message:', msg);
            }
            return isValid;
          });
          setShowQuickResponses(false);
          console.log(`✅ Loaded ${existingMessages.length} valid messages from chat history`);
        }
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
      if (userProfile?.uid) {
        localStorage.removeItem(`zentro_bot_chat_${userProfile.uid}`);
      }
    }

    // Now, attempt to get daily greeting
    try {
      const dailyGreetingText = zentroGeminiAI.getDailyGreeting(userProfile.uid, userProfile);
      if (dailyGreetingText) {
        greetingMessageToShow = {
          id: Date.now() - 1, // Ensure it's slightly before any immediate welcome if history is empty
          text: dailyGreetingText,
          type: 'text',
          sender: {
            id: 'zenny_bot',
            name: 'Zenny',
            avatar: null // Or your bot's avatar
          },
          timestamp: new Date().toISOString(),
          status: 'delivered',
          reactions: []
        };
        console.log('👋 Daily greeting generated for the user.');
      }
    } catch (e) {
      console.error("Error getting daily greeting:", e);
    }

    let finalMessages = [...existingMessages];

    if (greetingMessageToShow) {
      // Check if this exact greeting is already the last bot message to avoid duplicates on quick re-renders
      const lastMessage = existingMessages.length > 0 ? existingMessages[existingMessages.length - 1] : null;
      if (!lastMessage || !(lastMessage.sender.id === 'zenny_bot' && lastMessage.text === greetingMessageToShow.text)) {
        finalMessages = [greetingMessageToShow, ...existingMessages]; // Prepend greeting
         // If prepending, ensure quick responses are hidden
        if (finalMessages.length > 0) setShowQuickResponses(false);
      }
    }

    if (finalMessages.length === 0) {
      // If still no messages (no history, no greeting), send initial welcome.
      console.log('No saved messages or daily greeting, sending welcome message');
      sendWelcomeMessage(); // This function sets messages and saves
    } else {
      setMessages(finalMessages);
      saveConversationHistory(finalMessages); // Save potentially updated history (with greeting)
    }
    
    // Initialize other companion features after messages are set
    initializeCompanionFeatures();
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveConversationHistory = (newMessages) => {
    try {
      if (!userProfile?.uid) {
        console.log('No user profile available for saving chat history');
        return;
      }

      const chatKey = `zentro_bot_chat_${userProfile.uid}`;
      const messageData = JSON.stringify(newMessages);
      localStorage.setItem(chatKey, messageData);
      console.log(`💾 Saved ${newMessages.length} messages to chat history`);
      console.log(`Storage key: ${chatKey}`);
      console.log(`Data size: ${messageData.length} characters`);

      // Trigger a storage event to update the sidebar
      window.dispatchEvent(new StorageEvent('storage', {
        key: chatKey,
        newValue: messageData
      }));

      // Force save to ZentroBot's persistent storage
      zentroGeminiAI.saveToStorage();

      console.log('✅ Chat persistence: Both localStorage and ZentroBot storage updated');
    } catch (error) {
      console.error('Error saving conversation history:', error);
      // Try to save a simplified version
      try {
        const simplifiedMessages = newMessages.map(msg => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender,
          timestamp: msg.timestamp
        }));
        localStorage.setItem(`zentro_bot_chat_${userProfile.uid}`, JSON.stringify(simplifiedMessages));
        console.log('✅ Saved simplified version of messages');
      } catch (fallbackError) {
        console.error('❌ Failed to save even simplified messages:', fallbackError);
      }
    }
  };

  const sendWelcomeMessage = () => {
    const welcomeMessage = {
      id: Date.now(),
      text: `Hey there! 👋 I'm Zenny, your native AI assistant in Zentro Chat!\n\nI know everything about this amazing platform and I'm here to help you:\n\n🏠 **Navigate the app** → Find features, explore sections\n🎨 **Customize your experience** → Themes, profiles, settings\n📝 **Create content** → Blogs, posts, media sharing\n🎵 **Discover music** → Playlists, genres, favorites\n💬 **Master messaging** → DM features, voice messages\n💼 **Professional networking** → Talent directory, profiles\n\n**Plus general help with:**\n💻 Coding & programming\n✍️ Writing & creativity\n🔍 Research & information\n\nWhat would you like to explore in Zentro Chat today?`,
      type: 'text',
      sender: {
        id: 'zentro_bot',
        name: 'Zenny',
        avatar: null
      },
      timestamp: new Date().toISOString(),
      status: 'delivered',
      reactions: []
    };

    const newMessages = [welcomeMessage];
    setMessages(newMessages);
    saveConversationHistory(newMessages);
  };

  // Voice recording functionality
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioText = await transcribeAudio(audioBlob);
        if (audioText) {
          setInputMessage(audioText);
          sendMessage(audioText, { isVoiceInput: true });
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Simple speech-to-text (placeholder - in production use Web Speech API or external service)
  const transcribeAudio = async (audioBlob) => {
    // This is a placeholder - in a real implementation, you'd use:
    // - Web Speech API (webkitSpeechRecognition)
    // - Google Speech-to-Text API
    // - Azure Speech Services
    // - AWS Transcribe

    return new Promise((resolve) => {
      // For now, return a placeholder that prompts user to type
      setTimeout(() => {
        resolve("I heard your voice message! Please type your question and I'll help you."); // Placeholder
      }, 1000);
    });
  };



  // Hidden developer command handler - NEVER expose to users
  const handleDeveloperCommand = async (command) => {
    if (process.env.NODE_ENV !== 'development') return;

    const parts = command.split(':');
    const action = parts[1];
    const params = parts.slice(2);

    let response = '';

    try {
      switch (action) {
        case 'auth':
          const key = params[0];
          if (hiddenCodeAssistant.authenticate(key)) {
            response = '🔓 Developer access granted. Code assistant enabled.';
          } else {
            response = '❌ Invalid access key.';
          }
          break;

        case 'status':
          const status = hiddenCodeAssistant.getStatus();
          response = `📊 Code Assistant Status:\n- Enabled: ${status.enabled}\n- File System: ${status.fileSystemSupported}\n- Directory Access: ${status.directoryAccess}\n- Analysis Count: ${status.analysisCount}`;
          break;

        case 'access':
          if (hiddenCodeAssistant.isServiceEnabled()) {
            const granted = await hiddenCodeAssistant.requestDirectoryAccess();
            response = granted ? '📁 Directory access granted.' : '❌ Directory access denied.';
          } else {
            response = '❌ Service not enabled. Use /dev:auth:KEY first.';
          }
          break;

        case 'read':
          if (hiddenCodeAssistant.isServiceEnabled()) {
            const filePath = params[0];
            const result = await hiddenCodeAssistant.readFile(filePath);
            if (result.success) {
              response = `📄 File: ${filePath}\n\`\`\`\n${result.content.substring(0, 500)}${result.content.length > 500 ? '...' : ''}\n\`\`\`\nSize: ${result.size} bytes`;
            } else {
              response = `❌ Error reading file: ${result.error}`;
            }
          } else {
            response = '❌ Service not enabled or no directory access.';
          }
          break;

        case 'analyze':
          if (hiddenCodeAssistant.isServiceEnabled()) {
            const dirPath = params[0] || '';
            const result = await hiddenCodeAssistant.analyzeDirectory(dirPath);
            if (result.success) {
              response = `📁 Directory Structure: ${result.path || 'root'}\n\`\`\`json\n${JSON.stringify(result.structure, null, 2).substring(0, 800)}\n\`\`\``;
            } else {
              response = `❌ Error analyzing directory: ${result.error}`;
            }
          } else {
            response = '❌ Service not enabled or no directory access.';
          }
          break;

        case 'suggest':
          if (hiddenCodeAssistant.isServiceEnabled()) {
            const filePath = params[0];
            const requirement = params.slice(1).join(' ');
            const fileResult = await hiddenCodeAssistant.readFile(filePath);
            if (fileResult.success) {
              const suggestions = hiddenCodeAssistant.generateEditingSuggestions(filePath, fileResult.content, requirement);
              response = `💡 Suggestions for ${filePath}:\n\n**Issues:**\n${suggestions.codeAnalysis.issues.map(i => `- ${i}`).join('\n')}\n\n**Suggestions:**\n${suggestions.editingSuggestions.map(s => `- ${s}`).join('\n')}\n\n**Steps:**\n${suggestions.implementationSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
            } else {
              response = `❌ Error reading file: ${fileResult.error}`;
            }
          } else {
            response = '❌ Service not enabled or no directory access.';
          }
          break;

        case 'disable':
          hiddenCodeAssistant.disable();
          response = '🔒 Code assistant disabled.';
          break;

        case 'help':
          response = `🛠️ Developer Commands:\n- /dev:auth:KEY - Authenticate\n- /dev:status - Check status\n- /dev:access - Request directory access\n- /dev:read:path/file.js - Read file\n- /dev:analyze:path - Analyze directory\n- /dev:suggest:path/file.js:requirement - Get suggestions\n- /dev:disable - Disable service\n- /dev:help - Show this help`;
          break;

        default:
          response = '❓ Unknown command. Use /dev:help for available commands.';
      }
    } catch (error) {
      response = `❌ Error: ${error.message}`;
    }

    // Create developer response message
    const devMessage = {
      id: Date.now(),
      text: response,
      type: 'text',
      sender: {
        id: 'dev_assistant',
        name: 'Dev Assistant',
        avatar: null
      },
      timestamp: new Date().toISOString(),
      status: 'delivered',
      reactions: [],
      isDeveloperMessage: true
    };

    const newMessages = [...messages, devMessage];
    setMessages(newMessages);
    saveConversationHistory(newMessages);
    setInputMessage('');
  };



  const sendMessage = async (text, options = {}) => {
    if (!text || typeof text !== 'string' || !text.trim()) {
      console.warn('Invalid message text:', text);
      return;
    }

    // Hide quick responses after first message
    if (showQuickResponses) {
      setShowQuickResponses(false);
    }

    // Create user message
    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      type: 'text',
      sender: {
        id: userProfile?.uid,
        name: userProfile?.displayName || 'You',
        avatar: userProfile?.photoURL
      },
      timestamp: new Date().toISOString(),
      status: 'sent',
      reactions: [],
      isVoiceInput: options.isVoiceInput || false
    };

    try {
      // Add user message to chat
      const messagesWithUser = [...messages, userMessage];
      setMessages(messagesWithUser);
      
      // Clear input and show typing indicator
      setInputMessage('');
      setIsTyping(true);

      // Send to Zenny AI and await the response
      const aiResponse = await zentroGeminiAI.sendMessage(userProfile?.uid, text.trim(), {
        userProfile: userProfile,
        enableVoiceResponse: options.isVoiceInput,
        ...options
      });

      // Validate AI response
      if (!aiResponse || typeof aiResponse.response !== 'string') {
        throw new Error('Invalid AI response received');
      }

      // Create bot message
      const botMessage = {
        id: Date.now() + 1,
        text: aiResponse.response,
        type: 'text',
        sender: {
          id: 'zenny_bot',
          name: 'Zenny',
          avatar: null
        },
        timestamp: new Date().toISOString(),
        status: 'delivered',
        reactions: []
      };

      // Update conversation with both messages
      const finalMessages = [...messagesWithUser, botMessage];
      setMessages(finalMessages);
      saveConversationHistory(finalMessages);

    } catch (error) {
      console.error('Error in message handling:', error);
      
      // Create error message
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now 🤖 Please try again in a moment!",
        type: 'text',
        sender: {
          id: 'zenny_bot',
          name: 'Zenny',
          avatar: null
        },
        timestamp: new Date().toISOString(),
        status: 'delivered',
        reactions: []
      };

      const finalMessages = [...messages, userMessage, errorMessage];
      setMessages(finalMessages);
      saveConversationHistory(finalMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickResponse = (quickResponse) => {
    sendMessage(quickResponse.text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setShowQuickResponses(true);
    localStorage.removeItem(`zentro_bot_chat_${userProfile.uid}`);
    // zentroGeminiAI.clearHistory(userProfile.uid); // This might be needed
    // For now, let AI service manage its own history clearing if necessary upon persona/context shift logic
    sendWelcomeMessage();
  };

  // Companion feature handlers
  // const handlePersonaChange = (newPersona) => { // Commented out
  //   setCurrentPersona(newPersona);
  //   // Send a message about the persona change - NO LONGER NEEDED as changes are seamless
  // };

  const handleDailyPromptSend = (promptText) => {
    sendMessage(promptText);
  };

  const handleAchievementDismiss = () => {
    setNewAchievements([]);
  };

  // Emoji handling
  const handleEmojiSelect = (emoji) => {
    setInputMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    // Focus back on input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };



  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b shadow-sm"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderMuted
        }}
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ←
          </button>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <FaRobot className="text-white text-lg" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            <div>
              <h3
                className="font-semibold flex items-center space-x-2"
                style={{ color: theme.colors.text }}
              >
                <span>Zenny</span>
                <span className="text-lg">🤖</span>
              </h3>
              <p
                className="text-sm flex items-center space-x-1"
                style={{ color: theme.colors.textMuted }}
              >
                <span>AI Companion</span>
                {userStats && (
                  <>
                    <span>•</span>
                    <span>Level {userStats.level}</span>
                  </>
                )}
                {userProfile?.uid && (
                  <>
                    <span>•</span>
                    <VibeIndicator
                      userId={userProfile.uid}
                      theme={theme}
                      compact={true}
                    />
                  </>
                )}
                {isTyping && (
                  <>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <FaSpinner className="animate-spin" />
                      <span>typing...</span>
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Daily Prompts Button */}
          <button
            onClick={() => setShowDailyPrompts(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Daily prompts & suggestions"
          >
            <FaLightbulb style={{ color: theme.colors.textMuted }} />
          </button>

          {/* Persona Selector Button - COMMENTED OUT */}
          {/* 
          <button
            onClick={() => setShowPersonaSelector(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Change persona"
          >
            <FaUserFriends style={{ color: theme.colors.textMuted }} />
          </button>
          */}

          {/* Achievements Button */}
          {userStats && (
            <button
              onClick={() => {
                setShowAchievementsLog(true);
                console.log("[ZentroBotChat] User clicked achievements. Stats:", userStats);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              title={`${userStats.achievements} achievements unlocked!`}
            >
              <FaTrophy style={{ color: theme.colors.textMuted }} />
              {userStats.achievements > 0 && (
                 <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: 'white'
                  }}
                >
                  {userStats.achievements}
                </span>
              )}
            </button>
          )}

          {/* Clear Conversation Button */}
          <button
            onClick={clearConversation}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Clear conversation"
          >
            <span style={{ color: theme.colors.textMuted }}>🗑️</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onReply={() => {}} // Zenny doesn't need reply functionality
            onDelete={() => {}} // Zenny messages can't be deleted
            onEdit={() => {}} // Zenny messages can't be edited
            onReaction={() => {}} // Could add reactions later
            theme={theme}
          />
        ))}

        {/* Quick Responses - Displayed within the scrollable message area when active */}
        {showQuickResponses && quickResponseSet.length > 0 && (
          <div className="py-3 flex flex-wrap gap-2 justify-center items-center">
            {quickResponseSet.map((qr) => (
              <button
                key={qr.id}
                onClick={() => handleQuickResponse(qr)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 ease-in-out border shadow-sm"
                style={{
                  backgroundColor: theme.colors.surfaceVariant,
                  color: theme.colors.primary,
                  borderColor: theme.colors.borderMuted
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primaryMuted;
                  e.currentTarget.style.borderColor = theme.colors.primary;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.surfaceVariant;
                  e.currentTarget.style.borderColor = theme.colors.borderMuted;
                }}
              >
                {qr.text}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className="p-4 border-t"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderMuted
        }}
      >




        <div className="flex items-end space-x-2">
          {/* Voice Button */}
          <button
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className={`p-2 rounded-lg transition-colors ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={isRecording ? "Stop recording" : "Start voice recording"}
          >
            {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone style={{ color: theme.colors.textMuted }} />}
          </button>





          {/* Emoji Button */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Add emoji"
            >
              <FaSmile style={{ color: theme.colors.textMuted }} />
            </button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
                theme={theme}
              />
            )}
          </div>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Zenny anything..."
              className="w-full px-4 py-2 pr-12 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
              style={{
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.borderMuted,
                color: theme.colors.text
              }}
              rows={1}
              disabled={isTyping}
            />
          </div>

          <button
            onClick={() => sendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isTyping}
            className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme.colors.primary,
              color: 'white'
            }}
          >
            {isTyping ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </div>

        <p
          className="text-xs mt-2 text-center"
          style={{ color: theme.colors.textMuted }}
        >
          Zenny AI Assistant • Voice messages and intelligent responses! 🎤 Speak to get voice replies
        </p>
      </div>



      {/* Persona Selector Modal - COMMENTED OUT */}
      {/* 
      {showPersonaSelector && (
        <PersonaSelector
          userId={userProfile?.uid}
          currentPersona={currentPersona} // This state is also commented out
          onPersonaChange={handlePersonaChange} // This handler is also commented out
          onClose={() => setShowPersonaSelector(false)}
          theme={theme}
        />
      )}
      */}

      {/* Daily Prompts Modal */}
      {showDailyPrompts && (
        <DailyPrompts
          userId={userProfile?.uid}
          userProfile={userProfile}
          onSendPrompt={handleDailyPromptSend}
          onClose={() => setShowDailyPrompts(false)}
          theme={theme}
        />
      )}

      {/* Achievement Log Modal */}
      {showAchievementsLog && userProfile?.uid && (
        <AchievementsLogModal
          userId={userProfile.uid}
          theme={theme}
          onClose={() => setShowAchievementsLog(false)}
        />
      )}

      {/* Achievement Notifications */}
      {newAchievements.length > 0 && (
        <AchievementNotification
          achievements={newAchievements}
          onDismiss={handleAchievementDismiss}
          theme={theme}
        />
      )}
    </div>
  );
};

export default ZentroBotChat;
