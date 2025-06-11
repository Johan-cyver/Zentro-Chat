// Skill Matrix Editor Service - Admin module for skill management

class SkillMatrixEditorService {
  constructor() {
    this.userSkillGraphs = new Map();
    this.xpGainRules = new Map();
    this.targetedTests = new Map();
    this.mentorAssignments = new Map();
    this.bannedMethods = new Set();
    
    this.initializeXPRules();
    this.initializeSkillGraphs();
  }

  initializeXPRules() {
    const defaultRules = [
      {
        id: 'mission_completion',
        name: 'Mission Completion',
        baseXP: 50,
        multipliers: {
          difficulty: { easy: 1.0, medium: 1.5, hard: 2.0, extreme: 3.0 },
          speed: { slow: 1.0, normal: 1.2, fast: 1.5, lightning: 2.0 },
          teamwork: { solo: 1.0, duo: 1.1, squad: 1.3, army: 1.5 }
        },
        bonuses: {
          firstTime: 25,
          perfectScore: 50,
          noHints: 30,
          underTime: 40
        }
      },
      {
        id: 'cipher_solving',
        name: 'Cipher Solving',
        baseXP: 30,
        multipliers: {
          complexity: { basic: 1.0, intermediate: 1.5, advanced: 2.0, expert: 2.5 },
          time: { overtime: 0.8, ontime: 1.0, fast: 1.3, instant: 1.8 }
        },
        bonuses: {
          uniqueSolution: 40,
          elegantSolution: 35,
          helpedOthers: 20
        }
      },
      {
        id: 'battle_victory',
        name: 'Battle Victory',
        baseXP: 75,
        multipliers: {
          opponent: { rookie: 1.0, veteran: 1.3, elite: 1.6, legendary: 2.0 },
          style: { standard: 1.0, creative: 1.2, dominant: 1.4, flawless: 1.8 }
        },
        bonuses: {
          comeback: 60,
          perfectRound: 45,
          stylePoints: 30
        }
      },
      {
        id: 'project_contribution',
        name: 'Project Contribution',
        baseXP: 100,
        multipliers: {
          role: { contributor: 1.0, specialist: 1.3, lead: 1.6, architect: 2.0 },
          impact: { minor: 1.0, moderate: 1.4, major: 1.8, critical: 2.2 }
        },
        bonuses: {
          innovation: 80,
          mentoring: 60,
          documentation: 40,
          testing: 35
        }
      }
    ];

    defaultRules.forEach(rule => {
      this.xpGainRules.set(rule.id, rule);
    });
  }

  initializeSkillGraphs() {
    // Initialize with mock user skill data
    const mockUsers = [
      {
        shadowId: 'PHANTOM_BLADE_777',
        skills: {
          technical: { current: 85, potential: 95, growth: 0.8 },
          problemSolving: { current: 78, potential: 88, growth: 0.6 },
          collaboration: { current: 82, potential: 90, growth: 0.7 },
          leadership: { current: 65, potential: 85, growth: 0.9 },
          communication: { current: 75, potential: 85, growth: 0.5 },
          creativity: { current: 88, potential: 95, growth: 0.4 },
          adaptability: { current: 80, potential: 90, growth: 0.6 }
        },
        specializations: ['Frontend Development', 'UI/UX Design', 'Creative Problem Solving'],
        weaknesses: ['Leadership', 'Public Speaking'],
        learningStyle: 'visual',
        preferredChallenges: ['design', 'frontend', 'creative']
      },
      {
        shadowId: 'VOID_HUNTER_123',
        skills: {
          technical: { current: 92, potential: 98, growth: 0.3 },
          problemSolving: { current: 95, potential: 98, growth: 0.2 },
          collaboration: { current: 70, potential: 80, growth: 0.8 },
          leadership: { current: 68, potential: 85, growth: 0.9 },
          communication: { current: 72, potential: 82, growth: 0.7 },
          creativity: { current: 75, potential: 85, growth: 0.6 },
          adaptability: { current: 85, potential: 92, growth: 0.4 }
        },
        specializations: ['Security Engineering', 'Penetration Testing', 'System Architecture'],
        weaknesses: ['Team Collaboration', 'Mentoring'],
        learningStyle: 'hands-on',
        preferredChallenges: ['security', 'systems', 'complex-problems']
      }
    ];

    mockUsers.forEach(user => {
      this.userSkillGraphs.set(user.shadowId, user);
    });
  }

  // View user skill graph
  async viewUserSkillGraph(shadowId) {
    const skillGraph = this.userSkillGraphs.get(shadowId);
    if (!skillGraph) {
      throw new Error('User skill graph not found');
    }

    // Calculate additional metrics
    const skills = skillGraph.skills;
    const averageSkill = Object.values(skills).reduce((sum, skill) => sum + skill.current, 0) / Object.keys(skills).length;
    const growthPotential = Object.values(skills).reduce((sum, skill) => sum + skill.growth, 0) / Object.keys(skills).length;
    const skillGaps = Object.entries(skills)
      .filter(([_, skill]) => skill.potential - skill.current > 15)
      .map(([name, skill]) => ({ name, gap: skill.potential - skill.current }));

    return {
      ...skillGraph,
      analytics: {
        averageSkill: Math.round(averageSkill),
        growthPotential: Math.round(growthPotential * 100),
        skillGaps,
        recommendedFocus: this.getRecommendedFocus(skillGraph),
        nextMilestone: this.getNextMilestone(skillGraph)
      }
    };
  }

  // Adjust XP gain rules
  async adjustXPGainRules(ruleId, adjustments) {
    const rule = this.xpGainRules.get(ruleId);
    if (!rule) {
      throw new Error('XP rule not found');
    }

    // Apply adjustments
    if (adjustments.baseXP) {
      rule.baseXP = adjustments.baseXP;
    }

    if (adjustments.multipliers) {
      Object.assign(rule.multipliers, adjustments.multipliers);
    }

    if (adjustments.bonuses) {
      Object.assign(rule.bonuses, adjustments.bonuses);
    }

    rule.lastModified = Date.now();
    rule.modifiedBy = 'ARCHITECT';

    console.log(`⚙️ XP RULE ADJUSTED: ${rule.name}`);
    
    return rule;
  }

  // Push targeted test to specific user
  async pushTargetedTest(shadowId, skillType) {
    const skillGraph = this.userSkillGraphs.get(shadowId);
    if (!skillGraph) {
      throw new Error('User not found');
    }

    const test = {
      id: `test_${Date.now()}`,
      shadowId,
      skillType,
      difficulty: this.calculateTestDifficulty(skillGraph.skills[skillType]),
      createdAt: Date.now(),
      createdBy: 'ARCHITECT',
      status: 'pending',
      timeLimit: this.getTestTimeLimit(skillType),
      questions: this.generateTestQuestions(skillType),
      targetImprovement: this.calculateTargetImprovement(skillGraph.skills[skillType])
    };

    this.targetedTests.set(test.id, test);

    console.log(`🎯 TARGETED TEST PUSHED: ${skillType} test for ${shadowId}`);
    
    return test;
  }

  // Assign mentor to trainee
  async assignMentor(mentorId, traineeId) {
    const mentorSkills = this.userSkillGraphs.get(mentorId);
    const traineeSkills = this.userSkillGraphs.get(traineeId);
    
    if (!mentorSkills || !traineeSkills) {
      throw new Error('Mentor or trainee not found');
    }

    const assignment = {
      id: `mentor_${Date.now()}`,
      mentorId,
      traineeId,
      assignedAt: Date.now(),
      assignedBy: 'ARCHITECT',
      status: 'active',
      focusAreas: this.identifyMentoringAreas(mentorSkills, traineeSkills),
      goals: this.setMentoringGoals(traineeSkills),
      duration: 30 * 24 * 60 * 60 * 1000, // 30 days
      progress: {
        sessionsCompleted: 0,
        goalsAchieved: 0,
        skillImprovement: {}
      }
    };

    this.mentorAssignments.set(assignment.id, assignment);

    console.log(`👨‍🏫 MENTOR ASSIGNED: ${mentorId} -> ${traineeId}`);
    
    return assignment;
  }

  // Ban XP farming methods
  async banXPFarmingMethods(methods) {
    methods.forEach(method => {
      this.bannedMethods.add(method);
    });

    console.log(`🚫 XP FARMING METHODS BANNED: ${methods.join(', ')}`);
    
    return {
      bannedMethods: Array.from(this.bannedMethods),
      newlyBanned: methods,
      bannedAt: Date.now()
    };
  }

  // Update user skill based on activity
  async updateUserSkill(shadowId, skillType, improvement, activity) {
    const skillGraph = this.userSkillGraphs.get(shadowId);
    if (!skillGraph) {
      throw new Error('User not found');
    }

    const skill = skillGraph.skills[skillType];
    if (!skill) {
      throw new Error('Skill type not found');
    }

    // Apply improvement with diminishing returns
    const currentLevel = skill.current;
    const diminishingFactor = Math.max(0.1, 1 - (currentLevel / 100));
    const actualImprovement = improvement * diminishingFactor * skill.growth;
    
    skill.current = Math.min(skill.potential, skill.current + actualImprovement);

    // Log the improvement
    console.log(`📈 SKILL UPDATED: ${shadowId} ${skillType} +${actualImprovement.toFixed(1)} (${activity})`);
    
    return {
      shadowId,
      skillType,
      oldLevel: currentLevel,
      newLevel: skill.current,
      improvement: actualImprovement,
      activity
    };
  }

  // Get skill matrix statistics
  async getSkillMatrixStats() {
    const users = Array.from(this.userSkillGraphs.values());
    const tests = Array.from(this.targetedTests.values());
    const mentorships = Array.from(this.mentorAssignments.values());

    const skillAverages = {};
    const skillTypes = Object.keys(users[0]?.skills || {});
    
    skillTypes.forEach(skillType => {
      const average = users.reduce((sum, user) => sum + user.skills[skillType].current, 0) / users.length;
      skillAverages[skillType] = Math.round(average);
    });

    return {
      totalUsers: users.length,
      skillAverages,
      activeTests: tests.filter(t => t.status === 'pending').length,
      completedTests: tests.filter(t => t.status === 'completed').length,
      activeMentorships: mentorships.filter(m => m.status === 'active').length,
      bannedMethods: this.bannedMethods.size,
      xpRules: this.xpGainRules.size,
      topPerformers: users.filter(u => 
        Object.values(u.skills).reduce((sum, s) => sum + s.current, 0) / skillTypes.length > 85
      ).length
    };
  }

  // Helper methods
  getRecommendedFocus(skillGraph) {
    const skills = skillGraph.skills;
    const lowestSkills = Object.entries(skills)
      .sort((a, b) => a[1].current - b[1].current)
      .slice(0, 2)
      .map(([name, _]) => name);
    
    return lowestSkills;
  }

  getNextMilestone(skillGraph) {
    const skills = skillGraph.skills;
    const nextMilestones = Object.entries(skills)
      .map(([name, skill]) => ({
        skill: name,
        current: skill.current,
        target: Math.ceil(skill.current / 10) * 10,
        progress: skill.current % 10
      }))
      .filter(m => m.progress > 0)
      .sort((a, b) => (a.target - a.current) - (b.target - b.current));
    
    return nextMilestones[0] || null;
  }

  calculateTestDifficulty(skill) {
    if (skill.current < 30) return 'beginner';
    if (skill.current < 60) return 'intermediate';
    if (skill.current < 85) return 'advanced';
    return 'expert';
  }

  getTestTimeLimit(skillType) {
    const timeLimits = {
      technical: 3600000, // 1 hour
      problemSolving: 2700000, // 45 minutes
      collaboration: 1800000, // 30 minutes
      leadership: 2400000, // 40 minutes
      communication: 1800000, // 30 minutes
      creativity: 3600000, // 1 hour
      adaptability: 2700000 // 45 minutes
    };
    
    return timeLimits[skillType] || 3600000;
  }

  generateTestQuestions(skillType) {
    const questionSets = {
      technical: [
        'Debug this API endpoint that returns 500 errors',
        'Optimize this database query for better performance',
        'Implement a secure authentication system'
      ],
      problemSolving: [
        'Design an algorithm to solve the traveling salesman problem',
        'Find the optimal solution for resource allocation',
        'Resolve this complex system architecture challenge'
      ],
      collaboration: [
        'How would you handle a disagreement in your team?',
        'Describe your approach to code reviews',
        'Plan a collaborative project with remote team members'
      ],
      leadership: [
        'Lead a team through a critical project deadline',
        'Mentor a junior developer struggling with concepts',
        'Make a difficult technical decision under pressure'
      ]
    };
    
    return questionSets[skillType] || questionSets.technical;
  }

  calculateTargetImprovement(skill) {
    const gap = skill.potential - skill.current;
    return Math.min(gap * 0.3, 15); // Target 30% of gap, max 15 points
  }

  identifyMentoringAreas(mentorSkills, traineeSkills) {
    const areas = [];
    
    Object.entries(mentorSkills.skills).forEach(([skillType, mentorSkill]) => {
      const traineeSkill = traineeSkills.skills[skillType];
      if (mentorSkill.current > traineeSkill.current + 20) {
        areas.push({
          skill: skillType,
          mentorLevel: mentorSkill.current,
          traineeLevel: traineeSkill.current,
          improvementPotential: Math.min(mentorSkill.current - traineeSkill.current, traineeSkill.potential - traineeSkill.current)
        });
      }
    });
    
    return areas.sort((a, b) => b.improvementPotential - a.improvementPotential).slice(0, 3);
  }

  setMentoringGoals(traineeSkills) {
    return Object.entries(traineeSkills.skills)
      .filter(([_, skill]) => skill.potential - skill.current > 10)
      .map(([skillType, skill]) => ({
        skill: skillType,
        currentLevel: skill.current,
        targetLevel: Math.min(skill.current + 15, skill.potential),
        timeframe: '30 days'
      }))
      .slice(0, 3);
  }
}

// Create singleton instance
const skillMatrixEditor = new SkillMatrixEditorService();

export default skillMatrixEditor;
