// Mission Engine Control Service - Admin module for mission management

class MissionEngineControlService {
  constructor() {
    this.activeMissions = new Map();
    this.missionTemplates = new Map();
    this.secretRoles = new Map();
    this.arenaInstances = new Map();
    this.hiddenMissions = new Set();
    
    this.initializeMissionTemplates();
    this.initializeActiveMissions();
  }

  initializeMissionTemplates() {
    const templates = [
      {
        id: 'stealth_infiltration',
        name: 'Stealth Infiltration',
        type: 'covert',
        difficulty: 'extreme',
        duration: 3600000, // 1 hour
        maxParticipants: 4,
        description: 'Infiltrate enemy systems without detection',
        objectives: [
          'Bypass security protocols',
          'Extract classified data',
          'Leave no traces'
        ],
        rewards: {
          xp: 500,
          reputation: 100,
          specialItems: ['Stealth Cloak', 'Data Extractor']
        }
      },
      {
        id: 'cipher_storm',
        name: 'Cipher Storm',
        type: 'puzzle',
        difficulty: 'hard',
        duration: 1800000, // 30 minutes
        maxParticipants: 8,
        description: 'Solve a series of interconnected ciphers',
        objectives: [
          'Decode primary cipher',
          'Find hidden message',
          'Unlock final vault'
        ],
        rewards: {
          xp: 300,
          reputation: 75,
          specialItems: ['Cipher Key', 'Decoder Ring']
        }
      },
      {
        id: 'shadow_duel',
        name: 'Shadow Duel',
        type: 'combat',
        difficulty: 'medium',
        duration: 900000, // 15 minutes
        maxParticipants: 2,
        description: 'One-on-one skill battle',
        objectives: [
          'Defeat opponent',
          'Maintain honor',
          'Prove superiority'
        ],
        rewards: {
          xp: 200,
          reputation: 50,
          specialItems: ['Victory Badge', 'Skill Token']
        }
      }
    ];

    templates.forEach(template => {
      this.missionTemplates.set(template.id, template);
    });
  }

  initializeActiveMissions() {
    // Create some active missions
    const activeMissions = [
      {
        id: 'mission_001',
        templateId: 'stealth_infiltration',
        name: 'Operation Ghost Protocol',
        status: 'active',
        participants: ['PHANTOM_BLADE_777', 'VOID_HUNTER_123'],
        startTime: Date.now() - 1800000, // Started 30 minutes ago
        endTime: Date.now() + 1800000, // Ends in 30 minutes
        progress: 65,
        currentObjective: 'Extract classified data',
        isHidden: false,
        createdBy: 'ARCHITECT'
      },
      {
        id: 'mission_002',
        templateId: 'cipher_storm',
        name: 'The Enigma Challenge',
        status: 'recruiting',
        participants: ['CIPHER_MASTER_X'],
        startTime: Date.now() + 600000, // Starts in 10 minutes
        endTime: Date.now() + 2400000, // Ends in 40 minutes
        progress: 0,
        currentObjective: 'Waiting for participants',
        isHidden: false,
        createdBy: 'SYSTEM'
      }
    ];

    activeMissions.forEach(mission => {
      this.activeMissions.set(mission.id, mission);
    });
  }

  // Get all active missions
  async getActiveMissions() {
    return Array.from(this.activeMissions.values())
      .filter(mission => !this.hiddenMissions.has(mission.id))
      .sort((a, b) => b.startTime - a.startTime);
  }

  // Inject a new mission into the system
  async injectMission(type, details) {
    const missionId = `injected_${Date.now()}`;
    const template = Array.from(this.missionTemplates.values())
      .find(t => t.type === type) || this.missionTemplates.get('stealth_infiltration');

    const mission = {
      id: missionId,
      templateId: template.id,
      name: details.name || `Injected ${template.name}`,
      type: 'injected',
      status: 'active',
      participants: details.participants || [],
      startTime: Date.now(),
      endTime: Date.now() + (details.duration || template.duration),
      progress: 0,
      currentObjective: details.objective || template.objectives[0],
      isHidden: details.hidden || false,
      priority: details.priority || 'high',
      createdBy: 'ARCHITECT',
      injectionReason: details.reason || 'Administrative injection',
      customRewards: details.rewards || template.rewards
    };

    this.activeMissions.set(missionId, mission);
    
    console.log(`💉 MISSION INJECTED: ${mission.name} (${missionId})`);
    
    return mission;
  }

  // Assign secret roles to users
  async assignSecretRoles(userIds, role) {
    const roleData = {
      role,
      assignedAt: Date.now(),
      assignedBy: 'ARCHITECT',
      users: userIds,
      isSecret: true,
      permissions: this.getRolePermissions(role)
    };

    userIds.forEach(userId => {
      this.secretRoles.set(userId, roleData);
    });

    console.log(`🎭 SECRET ROLES ASSIGNED: ${role} to ${userIds.length} users`);
    
    return {
      role,
      assignedUsers: userIds.length,
      permissions: roleData.permissions
    };
  }

  // Launch masked arena instance
  async launchMaskedArena(mode) {
    const arenaId = `arena_${Date.now()}`;
    const arena = {
      id: arenaId,
      mode,
      status: 'active',
      participants: [],
      maxParticipants: this.getArenaMaxParticipants(mode),
      startTime: Date.now(),
      rules: this.getArenaRules(mode),
      rewards: this.getArenaRewards(mode),
      isRanked: mode !== 'casual',
      createdBy: 'ARCHITECT'
    };

    this.arenaInstances.set(arenaId, arena);
    
    console.log(`⚔️ ARENA LAUNCHED: ${mode} (${arenaId})`);
    
    return arena;
  }

  // Hide mission from public view
  async hideMissionFromPublic(missionId) {
    const mission = this.activeMissions.get(missionId);
    if (!mission) {
      throw new Error('Mission not found');
    }

    this.hiddenMissions.add(missionId);
    mission.isHidden = true;
    mission.hiddenAt = Date.now();
    mission.hiddenBy = 'ARCHITECT';

    console.log(`🙈 MISSION HIDDEN: ${mission.name} (${missionId})`);
    
    return {
      missionId,
      name: mission.name,
      hiddenAt: mission.hiddenAt,
      status: 'hidden'
    };
  }

  // Monitor live quests and activities
  async monitorLiveQuests() {
    const missions = Array.from(this.activeMissions.values());
    const arenas = Array.from(this.arenaInstances.values());
    
    return {
      activeMissions: missions.filter(m => m.status === 'active').length,
      recruitingMissions: missions.filter(m => m.status === 'recruiting').length,
      completedMissions: missions.filter(m => m.status === 'completed').length,
      activeArenas: arenas.filter(a => a.status === 'active').length,
      totalParticipants: missions.reduce((sum, m) => sum + m.participants.length, 0),
      hiddenMissions: this.hiddenMissions.size,
      secretRoles: this.secretRoles.size
    };
  }

  // Create emergency mission
  async createEmergencyMission(details) {
    const missionId = `emergency_${Date.now()}`;
    const mission = {
      id: missionId,
      name: details.name || 'Emergency Protocol',
      type: 'emergency',
      status: 'active',
      priority: 'critical',
      participants: details.targetUsers || [],
      startTime: Date.now(),
      endTime: Date.now() + (details.duration || 1800000), // 30 minutes default
      progress: 0,
      currentObjective: details.objective || 'Respond to emergency',
      isHidden: false,
      isEmergency: true,
      createdBy: 'ARCHITECT',
      emergencyLevel: details.level || 'high',
      autoAssign: details.autoAssign || false
    };

    this.activeMissions.set(missionId, mission);
    
    console.log(`🚨 EMERGENCY MISSION CREATED: ${mission.name}`);
    
    return mission;
  }

  // Terminate mission
  async terminateMission(missionId, reason) {
    const mission = this.activeMissions.get(missionId);
    if (!mission) {
      throw new Error('Mission not found');
    }

    mission.status = 'terminated';
    mission.terminatedAt = Date.now();
    mission.terminatedBy = 'ARCHITECT';
    mission.terminationReason = reason;

    console.log(`🛑 MISSION TERMINATED: ${mission.name} - ${reason}`);
    
    return {
      missionId,
      name: mission.name,
      terminatedAt: mission.terminatedAt,
      reason
    };
  }

  // Get mission statistics
  async getMissionStats() {
    const missions = Array.from(this.activeMissions.values());
    const templates = Array.from(this.missionTemplates.values());
    
    return {
      totalMissions: missions.length,
      activeMissions: missions.filter(m => m.status === 'active').length,
      completedMissions: missions.filter(m => m.status === 'completed').length,
      injectedMissions: missions.filter(m => m.type === 'injected').length,
      emergencyMissions: missions.filter(m => m.isEmergency).length,
      hiddenMissions: this.hiddenMissions.size,
      availableTemplates: templates.length,
      averageParticipants: missions.reduce((sum, m) => sum + m.participants.length, 0) / missions.length,
      successRate: this.calculateSuccessRate(missions)
    };
  }

  // Helper methods
  getRolePermissions(role) {
    const permissions = {
      'shadow_admin': ['all_access', 'user_control', 'mission_control'],
      'mission_leader': ['mission_control', 'team_management'],
      'elite_operative': ['advanced_missions', 'special_access'],
      'infiltrator': ['stealth_missions', 'covert_ops'],
      'cipher_expert': ['puzzle_missions', 'code_breaking']
    };
    
    return permissions[role] || ['basic_access'];
  }

  getArenaMaxParticipants(mode) {
    const limits = {
      'duel': 2,
      'squad': 8,
      'battle_royale': 16,
      'tournament': 32,
      'casual': 4
    };
    
    return limits[mode] || 8;
  }

  getArenaRules(mode) {
    const rules = {
      'duel': ['1v1 combat', 'Best of 3 rounds', 'No external help'],
      'squad': ['Team vs Team', '4v4 format', 'Coordination required'],
      'battle_royale': ['Last shadow standing', 'Shrinking play area', 'Solo survival'],
      'tournament': ['Bracket elimination', 'Ranked matches', 'Prize pool'],
      'casual': ['Relaxed rules', 'Practice mode', 'No ranking impact']
    };
    
    return rules[mode] || ['Standard rules apply'];
  }

  getArenaRewards(mode) {
    const rewards = {
      'duel': { xp: 100, reputation: 25 },
      'squad': { xp: 150, reputation: 40 },
      'battle_royale': { xp: 300, reputation: 75 },
      'tournament': { xp: 500, reputation: 150 },
      'casual': { xp: 50, reputation: 10 }
    };
    
    return rewards[mode] || { xp: 100, reputation: 25 };
  }

  calculateSuccessRate(missions) {
    const completed = missions.filter(m => m.status === 'completed');
    const failed = missions.filter(m => m.status === 'failed');
    const total = completed.length + failed.length;
    
    return total > 0 ? (completed.length / total) * 100 : 0;
  }
}

// Create singleton instance
const missionEngineControl = new MissionEngineControlService();

export default missionEngineControl;
