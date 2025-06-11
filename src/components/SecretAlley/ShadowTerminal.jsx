import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaTerminal } from 'react-icons/fa';
import shadowTerminalBot from '../../services/shadowTerminalBot';
import ZentroMasterControl from './Admin/ZentroMasterControl';

// Enhanced CSS for perfect terminal input
const terminalStyles = `
  .shadow-terminal-input {
    caret-color: #4ade80 !important;
    background: transparent !important;
    border: none !important;
    outline: none !important;
    color: #4ade80 !important;
    font-family: 'Courier New', monospace !important;
    font-size: 14px !important;
    line-height: 1.2 !important;
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .shadow-terminal-input:focus {
    caret-color: #4ade80 !important;
    outline: none !important;
    background: rgba(74, 222, 128, 0.05) !important;
    box-shadow: none !important;
  }
  .shadow-terminal-input::selection {
    background-color: #4ade80 !important;
    color: #000000 !important;
  }
  .shadow-terminal-input::-webkit-input-placeholder {
    color: rgba(74, 222, 128, 0.5) !important;
  }
  .shadow-terminal-input::-moz-placeholder {
    color: rgba(74, 222, 128, 0.5) !important;
  }
`;

const ShadowTerminal = ({ shadowProfile, onCommand, isActive, onToggle, embedded = false, className = '', userSecretId, showAdminControl, setShowAdminControl }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const [adminAttempts, setAdminAttempts] = useState(0);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  // USER-FRIENDLY COMMANDS WITH SHORTCUTS
  const commands = {
    help: 'Show all available commands',
    h: 'Show help (shortcut)',
    zones: 'List all available zones',
    z: 'List zones (shortcut)',
    connect: 'Connect to a zone (usage: connect <zone>)',
    c: 'Connect shortcut (usage: c <zone>)',
    go: 'Go to zone (usage: go <zone>)',
    enter: 'Enter zone (usage: enter <zone>)',
    status: 'Show your shadow profile',
    s: 'Show status (shortcut)',
    profile: 'Show your profile',
    me: 'Show your info',
    id: 'Show your Secret ID',
    clear: 'Clear terminal history',
    cls: 'Clear screen (shortcut)',
    exit: 'Exit Secret Alley',
    quit: 'Quit Secret Alley',
    q: 'Quick exit',
    echo: 'Echo a message',
    scan: 'Scan for active shadows',
    ghost: 'Toggle ghost mode',
    bot: 'AI assistant (usage: bot help)',
    ai: 'AI assistant (shortcut)',
    admin: '[CLASSIFIED] - Root access required',
    list: 'List available zones',
    ls: 'List zones (unix style)',
    who: 'Show active users',
    where: 'Show current location',
    time: 'Show current time',
    date: 'Show current date',
    info: 'Show system information'
  };

  // SIMPLE ZONE MAPPINGS THAT ACTUALLY WORK
  const zones = {
    infiltration: 'INFILTRATION',
    arena: 'ARENA', 
    cipher: 'CIPHER',
    whispers: 'WHISPERS',
    forge: 'FORGE',
    network: 'NETWORK',
    void: 'VOID'
  };

  // Comprehensive zone aliases for easier typing
  const zoneAliases = {
    // Infiltration aliases
    'inf': 'infiltration',
    'infiltrate': 'infiltration',
    'deception': 'infiltration',
    'social': 'infiltration',
    '1': 'infiltration',

    // Arena aliases
    'pvp': 'arena',
    'battle': 'arena',
    'fight': 'arena',
    'combat': 'arena',
    'duel': 'arena',
    '2': 'arena',

    // Cipher aliases
    'cry': 'cipher',
    'crypto': 'cipher',
    'puzzle': 'cipher',
    'code': 'cipher',
    'decrypt': 'cipher',
    '3': 'cipher',

    // Whispers aliases
    'msg': 'whispers',
    'chat': 'whispers',
    'message': 'whispers',
    'talk': 'whispers',
    'comm': 'whispers',
    '4': 'whispers',

    // Forge aliases
    'squad': 'forge',
    'team': 'forge',
    'group': 'forge',
    'build': 'forge',
    '5': 'forge',

    // Network aliases
    'net': 'network',
    'map': 'network',
    'nodes': 'network',
    'connections': 'network',
    '6': 'network',

    // Void aliases
    'v': 'void',
    'elite': 'void',
    'advanced': 'void',
    '7': 'void',

    // Mission aliases
    'missions': 'missions',
    'mission': 'missions',
    'skill': 'missions',
    'training': 'missions',
    'train': 'missions',
    '8': 'missions',

    // Faction aliases
    'factions': 'factions',
    'faction': 'factions',
    'war': 'factions',
    'wars': 'factions',
    '9': 'factions',

    // Project aliases
    'projects': 'projects',
    'project': 'projects',
    'dev': 'projects',
    'develop': 'projects',
    '10': 'projects'
  };

  useEffect(() => {
    // Inject custom styles for better cursor visibility
    if (!document.getElementById('shadow-terminal-styles')) {
      const style = document.createElement('style');
      style.id = 'shadow-terminal-styles';
      style.textContent = terminalStyles;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if ((isActive || embedded) && inputRef.current) {
      // Force focus with multiple attempts
      const focusInput = () => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(input.length, input.length);
        }
      };

      // Immediate focus
      focusInput();

      // Delayed focus attempts
      setTimeout(focusInput, 50);
      setTimeout(focusInput, 100);
      setTimeout(focusInput, 200);
    }
  }, [isActive, embedded]);

  // Auto-focus on input change
  useEffect(() => {
    if ((isActive || embedded) && inputRef.current) {
      inputRef.current.setSelectionRange(input.length, input.length);
    }
  }, [input, isActive, embedded]);

  // Welcome message when terminal first loads
  useEffect(() => {
    if ((isActive || embedded) && history.length === 0) {
      setTimeout(() => {
        typeResponse(`🕳️ SHADOW TERMINAL INITIALIZED
═══════════════════════════════════════
Welcome to the Secret Alley command interface.

💡 QUICK START:
• Type 'h' for help
• Type 'z' for zones
• Type '1' to go to Infiltration
• Click anywhere to focus cursor

🎯 Ready for commands...`, 'success');
      }, 500);
    }
  }, [isActive, embedded]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Initialize with welcome message
  useEffect(() => {
    if (embedded && history.length === 0) {
      const welcomeMessage = `SHADOW TERMINAL v4.0.0 - READY
═══════════════════════════════════════
Welcome to Secret Alley, ${userSecretId || 'Anonymous'}

🔥 QUICK START:
• Type 'help' to see all commands
• Type 'zones' to see available zones  
• Type 'connect <zone>' to enter a zone
• Type 'exit' to leave Secret Alley

💡 EXAMPLES:
• connect infiltration
• connect arena
• connect cipher
═══════════════════════════════════════`;

      setTimeout(() => {
        addToHistory('', welcomeMessage, 'success');
      }, 500);
    }
  }, [embedded, history.length, userSecretId]);

  const addToHistory = (command, response, type = 'success') => {
    const timestamp = new Date().toLocaleTimeString();
    setHistory(prev => [...prev, {
      id: Date.now(),
      timestamp,
      command,
      response,
      type
    }]);
  };

  const typeResponse = async (text, delay = 20) => {
    setIsTyping(true);
    const chars = text.split('');
    let response = '';
    
    for (let i = 0; i < chars.length; i++) {
      response += chars[i];
      await new Promise(resolve => setTimeout(resolve, delay));
      setHistory(prev => {
        const newHistory = [...prev];
        if (newHistory.length > 0) {
          newHistory[newHistory.length - 1].response = response;
        }
        return newHistory;
      });
    }
    setIsTyping(false);
  };

  const executeCommand = async (cmd) => {
    const [command, ...args] = cmd.toLowerCase().trim().split(' ');
    
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    addToHistory(`> ${cmd}`, '', 'command');

    switch (command) {
      case 'help':
      case 'h':
        const helpText = `SHADOW TERMINAL - COMMAND REFERENCE
═══════════════════════════════════════
🎯 NAVIGATION COMMANDS:
zones, z, list, ls    - Show all zones
connect <zone>        - Enter a zone
c, go, enter <zone>   - Zone shortcuts
1-10                  - Quick zone access

👤 PROFILE COMMANDS:
status, s, profile    - Your shadow info
id, me                - Your Secret ID
scan, who             - Active users

🛠️ UTILITY COMMANDS:
clear, cls            - Clear screen
exit, quit, q         - Leave Secret Alley
echo <message>        - Echo text
time, date            - Current time/date
info                  - System info

🤖 AI COMMANDS:
bot <question>        - AI assistant
ai <question>         - AI shortcut

🔒 SPECIAL COMMANDS:
ghost                 - Toggle invisibility
admin                 - [CLASSIFIED]
═══════════════════════════════════════
💡 TIPS:
• Use numbers 1-10 for quick zone access
• Type partial zone names (e.g., 'inf' for infiltration)
• Use arrow keys for command history
• Most commands have shortcuts (h = help, s = status)`;
        await typeResponse(helpText);
        break;

      case 'zones':
      case 'z':
      case 'list':
      case 'ls':
        const zoneText = `AVAILABLE ZONES - QUICK ACCESS
═══════════════════════════════════════
1️⃣  INFILTRATION  - Deception Protocol (LVL 1+)
   Aliases: inf, infiltrate, deception, social, 1

2️⃣  ARENA        - PvP Battles (LVL 1+)
   Aliases: pvp, battle, fight, combat, duel, 2

3️⃣  CIPHER       - Crypto Challenges (LVL 2+)
   Aliases: cry, crypto, puzzle, code, decrypt, 3

4️⃣  WHISPERS     - Encrypted Chat (LVL 1+)
   Aliases: msg, chat, message, talk, comm, 4

5️⃣  FORGE        - Squad Building (LVL 2+)
   Aliases: squad, team, group, build, 5

6️⃣  NETWORK      - Shadow Map (LVL 3+)
   Aliases: net, map, nodes, connections, 6

7️⃣  VOID         - [CLASSIFIED] (LVL 5+)
   Aliases: v, elite, advanced, 7

8️⃣  MISSIONS     - Skill Training (LVL 1+)
   Aliases: mission, skill, training, train, 8

9️⃣  FACTIONS     - Territory Wars (LVL 2+)
   Aliases: faction, war, wars, 9

🔟 PROJECTS     - Real Development (LVL 4+)
   Aliases: project, dev, develop, 10
═══════════════════════════════════════
🚀 QUICK ACCESS:
• Type: connect 1 (for Infiltration)
• Type: c arena (shortcut)
• Type: go pvp (alias)
• Type: enter 3 (for Cipher)

💡 TIP: Most zones have multiple aliases for easy access!`;
        await typeResponse(zoneText);
        break;

      case 'connect':
      case 'c':
      case 'go':
      case 'enter':
        if (args.length === 0) {
          await typeResponse(`❌ ERROR: Zone name required

🎯 USAGE EXAMPLES:
• connect infiltration
• c arena
• go 1 (for infiltration)
• enter pvp

📋 QUICK REFERENCE:
Type "zones" to see all available zones and their shortcuts!`, 'error');
        } else {
          const inputZone = args[0].toLowerCase();
          const targetZone = zoneAliases[inputZone] || inputZone;

          if (zones[targetZone]) {
            await typeResponse(`🔗 Connecting to ${zones[targetZone]}...
📡 Establishing secure connection...
🔐 Authenticating shadow credentials...
✅ Connection established!

🚀 Transferring to zone...`);
            setTimeout(() => {
              onCommand('navigate', targetZone);
            }, 2000);
          } else {
            await typeResponse(`❌ ERROR: Zone '${inputZone}' not found

🎯 DID YOU MEAN?
• infiltration → inf, infiltrate, deception, 1
• arena → pvp, battle, fight, 2
• cipher → cry, crypto, puzzle, 3
• whispers → msg, chat, talk, 4
• forge → squad, team, build, 5
• network → net, map, nodes, 6
• void → v, elite, 7

💡 TIP: Type "zones" for the complete list!`, 'error');
          }
        }
        break;

      case 'status':
      case 's':
      case 'profile':
      case 'me':
        const statusText = `👤 SHADOW PROFILE STATUS
═══════════════════════════════════════
🆔 Shadow ID: ${userSecretId || 'NOT GENERATED'}
👻 Alias: ${shadowProfile?.alias || 'UNKNOWN'}
🎭 Mask Level: ${shadowProfile?.maskLevel || 1}
⚡ Shadow XP: ${shadowProfile?.shadowXP || 0}
🏆 Reputation: ${shadowProfile?.reputation || 0}
⚔️ Battles Won: ${shadowProfile?.battlesWon || 0}
🧩 Ciphers Solved: ${shadowProfile?.ciphersSolved || 0}
🕐 Last Active: ${new Date().toLocaleString()}
🌐 Location: Secret Alley Dashboard
🔒 Security Level: ENCRYPTED
═══════════════════════════════════════
💡 TIP: Use 'scan' to see other active shadows`;
        await typeResponse(statusText);
        break;

      case 'id':
        if (userSecretId) {
          await typeResponse(`🆔 YOUR SECRET ID: ${userSecretId}\n\n✅ Status: AUTHENTICATED\n🔒 Security: ENCRYPTED\n📍 Access Level: BASIC`);
        } else {
          await typeResponse(`❌ NO SECRET ID FOUND\n\n⚠️  You need to generate a Secret ID first!\nClose this terminal and click the "GENERATE ID" button.`, 'error');
        }
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'exit':
        await typeResponse('🚪 Exiting Secret Alley...\n👋 See you in the shadows!');
        setTimeout(() => {
          onCommand('exit');
        }, 2000);
        break;

      case 'echo':
        const message = args.join(' ');
        if (message) {
          await typeResponse(`📢 ECHO: ${message}`);
        } else {
          await typeResponse('❌ ERROR: Message required\nUsage: echo <message>\nExample: echo Hello Shadow!', 'error');
        }
        break;

      case 'scan':
        await typeResponse('🔍 Scanning for active shadows...\n\n👤 SHADOW_HUNTER_42 - Arena\n👤 CIPHER_MASTER_X - Cipher Board\n👤 VOID_WALKER_99 - Network\n👤 GHOST_PROTOCOL_7 - Whispers\n\n✅ Scan complete. 4 shadows detected.');
        break;

      case 'ghost':
        await typeResponse('👻 GHOST MODE ACTIVATED\n\n🔒 Your presence is now hidden from scans\n⏱️  Duration: 10 minutes\n🛡️  Status: INVISIBLE');
        break;

      case 'bot':
        const botResponse = shadowTerminalBot.processInput(cmd, shadowProfile);
        await typeResponse(botResponse, 'success');
        break;

      case 'admin':
        await handleAdminAccess(args);
        break;

      default:
        // Try bot processing for unrecognized commands
        const fallbackResponse = shadowTerminalBot.processInput(cmd, shadowProfile);
        await typeResponse(fallbackResponse, 'error');
    }
  };

  const handleAdminAccess = async (args) => {
    const command = args.join(' ').toLowerCase();

    // Secret admin command: "admin enterAdmin --level=0x0"
    if (command === 'enteradmin --level=0x0') {
      await typeResponse('🔐 ULTIMATE ADMIN ACCESS REQUESTED\n\n⚠️  WARNING: GOD-TIER ACCESS ATTEMPT DETECTED\n\n🔍 Initiating quantum biometric verification...\n👻 AUTO-ENABLING GHOST MODE...');

      setTimeout(async () => {
        await typeResponse('\n👁️  Scanning neural patterns...\n🖐️  Analyzing quantum fingerprint...\n🧬 Verifying architect DNA signature...\n⚡ Checking god-tier clearance...\n\n✅ QUANTUM BIOMETRIC MATCH CONFIRMED\n👑 SUPREME ARCHITECT DETECTED\n\n🚨 GOD MODE ACCESS GRANTED\n👻 GHOST MODE: PERMANENTLY ACTIVE\n⚡ UNLIMITED POWER: ENABLED\n🌌 REALITY CONTROL: UNLOCKED\n\n🕳️  Breaching into ULTIMATE ADMIN CONTROL...\n💀 All traces automatically erased...');

        setTimeout(() => {
          if (setShowAdminControl) {
            setShowAdminControl(true);
          }
        }, 3000);
      }, 2000);

    } else if (command.startsWith('enteradmin')) {
      setAdminAttempts(prev => prev + 1);

      if (adminAttempts >= 2) {
        await typeResponse('🚨 SECURITY BREACH DETECTED\n\n⚠️  Multiple failed god-tier access attempts\n🔒 Terminal locked for security\n📡 Incident reported to Shadow Guard\n💀 Quantum security engaged\n\n💀 Access denied permanently', 'error');

        // Lock terminal for 30 seconds
        setTimeout(() => {
          setAdminAttempts(0);
        }, 30000);
      } else {
        await typeResponse(`❌ ACCESS DENIED\n\n🔐 Invalid god-tier credentials\n⚠️  Attempt ${adminAttempts + 1}/3 logged\n\n💡 Hint: Only the supreme architect has this level\n🔐 Format: admin enterAdmin --level=0x0`, 'error');
      }

    } else {
      await typeResponse('❌ INVALID ADMIN COMMAND\n\nUsage: admin <command>\n\n⚠️  This is a god-tier restricted command\n🔒 Unauthorized access attempts are quantum-monitored\n💡 Hint: admin enterAdmin --level=0x0', 'error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim()) {
        executeCommand(input);
        setInput('');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  // Enhanced click-to-focus functionality
  const handleTerminalClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (inputRef.current) {
      inputRef.current.focus();
      // Set cursor to end of input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(input.length, input.length);
        }
      }, 0);
    }
  };

  if (!isActive && !embedded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <button
          onClick={onToggle}
          className="bg-black/90 border border-green-400 rounded-lg p-3 text-green-400 hover:bg-green-400/10 transition-all shadow-lg shadow-green-400/20"
        >
          <FaTerminal className="text-xl" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: embedded ? 0 : 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: embedded ? 0 : 50 }}
      onClick={handleTerminalClick}
      className={embedded
        ? `${className} bg-black/95 border-0 rounded-none font-mono text-sm text-green-400 h-full flex flex-col cursor-text`
        : "fixed bottom-4 right-4 w-96 h-80 bg-black/95 border border-green-400 rounded-lg font-mono text-sm text-green-400 shadow-2xl shadow-green-400/20 z-50 cursor-text"
      }
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-2 border-b border-green-400/30 bg-green-400/5 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <FaTerminal className="text-green-400" />
          <span className="text-xs font-bold">SHADOW TERMINAL</span>
        </div>
        {!embedded && (
          <button
            onClick={onToggle}
            className="text-green-400 hover:text-red-400 transition-colors"
          >
            ×
          </button>
        )}
        {embedded && (
          <div className="text-xs text-green-400 opacity-70">
            READY
          </div>
        )}
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className={embedded
          ? "p-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-green-400/30"
          : "p-2 h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-green-400/30"
        }
      >
        {history.map((entry) => (
          <div key={entry.id} className="mb-1">
            <div className="text-gray-500 text-xs">[{entry.timestamp}]</div>
            <div className={`${entry.type === 'command' ? 'text-cyan-400' : entry.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {entry.command && <div>{entry.command}</div>}
              {entry.response && <pre className="whitespace-pre-wrap text-xs">{entry.response}</pre>}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-green-400 animate-pulse">
            <span className="animate-ping">▋</span>
          </div>
        )}
      </div>

      {/* Terminal Input */}
      <div className="p-2 border-t border-green-400/30 bg-green-400/5 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-green-400">shadow@alley:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (inputRef.current) {
                inputRef.current.focus();
                setTimeout(() => {
                  inputRef.current?.setSelectionRange(input.length, input.length);
                }, 0);
              }
            }}
            onFocus={(e) => {
              setTimeout(() => {
                if (inputRef.current) {
                  inputRef.current.setSelectionRange(input.length, input.length);
                }
              }, 0);
            }}
            onBlur={(e) => {
              // Prevent blur in embedded mode
              if (embedded) {
                setTimeout(() => {
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }, 10);
              }
            }}
            className="shadow-terminal-input"
            placeholder="Type 'help' for commands..."
            autoComplete="off"
            spellCheck="false"
            autoFocus={isActive || embedded}
          />
          <div className="w-2 h-4 bg-green-400 animate-pulse opacity-70"></div>
        </div>
      </div>
    </motion.div>
  );
};

// Ultimate Admin Portal
const ShadowTerminalWithAdmin = (props) => {
  const [showAdminControl, setShowAdminControl] = useState(false);

  if (showAdminControl) {
    return (
      <ZentroMasterControl
        onExit={() => setShowAdminControl(false)}
      />
    );
  }

  return (
    <ShadowTerminal
      {...props}
      showAdminControl={showAdminControl}
      setShowAdminControl={setShowAdminControl}
    />
  );
};

export default ShadowTerminalWithAdmin;
