// Shadow AI Engine - Advanced talent assessment and matching system

class ShadowAIEngine {
  constructor() {
    this.assessmentData = new Map();
    this.skillProfiles = new Map();
    this.teamCompatibility = new Map();
    this.learningPatterns = new Map();
    this.performanceMetrics = new Map();
    
    // AI model configurations
    this.models = {
      skillAssessment: {
        weights: {
          codeQuality: 0.3,
          problemSolving: 0.25,
          speed: 0.2,
          collaboration: 0.15,
          innovation: 0.1
        }
      },
      teamMatching: {
        factors: {
          skillComplementarity: 0.4,
          communicationStyle: 0.3,
          workingStyle: 0.2,
          personalityFit: 0.1
        }
      },
      talentPrediction: {
        indicators: {
          learningVelocity: 0.35,
          adaptability: 0.25,
          consistency: 0.2,
          leadership: 0.2
        }
      }
    };
  }

  // Analyze user performance across all activities
  analyzeUserPerformance(shadowId, activityData) {
    const analysis = {
      shadowId,
      timestamp: Date.now(),
      overallScore: 0,
      skillBreakdown: {},
      strengths: [],
      weaknesses: [],
      recommendations: [],
      careerPath: null,
      marketValue: 0
    };

    // Analyze different activity types
    const activities = {
      missions: activityData.missions || [],
      ciphers: activityData.ciphers || [],
      battles: activityData.battles || [],
      projects: activityData.projects || [],
      deceptionGames: activityData.deceptionGames || [],
      factionActivities: activityData.factionActivities || []
    };

    // Calculate skill scores
    analysis.skillBreakdown = {
      technical: this.calculateTechnicalSkill(activities),
      problemSolving: this.calculateProblemSolvingSkill(activities),
      collaboration: this.calculateCollaborationSkill(activities),
      leadership: this.calculateLeadershipSkill(activities),
      communication: this.calculateCommunicationSkill(activities),
      creativity: this.calculateCreativitySkill(activities),
      adaptability: this.calculateAdaptabilitySkill(activities)
    };

    // Calculate overall score
    analysis.overallScore = this.calculateOverallScore(analysis.skillBreakdown);

    // Identify strengths and weaknesses
    analysis.strengths = this.identifyStrengths(analysis.skillBreakdown);
    analysis.weaknesses = this.identifyWeaknesses(analysis.skillBreakdown);

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    // Predict career path
    analysis.careerPath = this.predictCareerPath(analysis.skillBreakdown);

    // Calculate market value
    analysis.marketValue = this.calculateMarketValue(analysis);

    // Store analysis
    this.assessmentData.set(shadowId, analysis);

    return analysis;
  }

  // Calculate technical skill based on mission performance
  calculateTechnicalSkill(activities) {
    let score = 0;
    let weight = 0;

    // Code missions
    if (activities.missions.length > 0) {
      const codeMissions = activities.missions.filter(m => m.category === 'code_ops');
      if (codeMissions.length > 0) {
        const avgScore = codeMissions.reduce((sum, m) => sum + (m.score || 0), 0) / codeMissions.length;
        const speedBonus = codeMissions.reduce((sum, m) => sum + (m.speedBonus || 0), 0) / codeMissions.length;
        score += (avgScore + speedBonus * 0.3) * 0.4;
        weight += 0.4;
      }
    }

    // Cipher solving
    if (activities.ciphers.length > 0) {
      const avgDifficulty = activities.ciphers.reduce((sum, c) => sum + this.getDifficultyScore(c.difficulty), 0) / activities.ciphers.length;
      const successRate = activities.ciphers.filter(c => c.solved).length / activities.ciphers.length;
      score += (avgDifficulty * successRate) * 0.3;
      weight += 0.3;
    }

    // Project contributions
    if (activities.projects.length > 0) {
      const projectScore = activities.projects.reduce((sum, p) => sum + (p.technicalContribution || 0), 0) / activities.projects.length;
      score += projectScore * 0.3;
      weight += 0.3;
    }

    return weight > 0 ? Math.min(100, (score / weight) * 100) : 0;
  }

  // Calculate problem-solving skill
  calculateProblemSolvingSkill(activities) {
    let score = 0;
    let weight = 0;

    // Mission problem-solving approach
    const problemSolvingMissions = activities.missions.filter(m => 
      m.category === 'security_protocols' || m.category === 'database_ops'
    );
    
    if (problemSolvingMissions.length > 0) {
      const avgScore = problemSolvingMissions.reduce((sum, m) => sum + (m.score || 0), 0) / problemSolvingMissions.length;
      const innovationScore = problemSolvingMissions.reduce((sum, m) => sum + (m.innovationPoints || 0), 0) / problemSolvingMissions.length;
      score += (avgScore + innovationScore * 0.5) * 0.5;
      weight += 0.5;
    }

    // Cipher complexity handling
    if (activities.ciphers.length > 0) {
      const hardCiphers = activities.ciphers.filter(c => c.difficulty === 'hard' || c.difficulty === 'extreme');
      if (hardCiphers.length > 0) {
        const successRate = hardCiphers.filter(c => c.solved).length / hardCiphers.length;
        score += successRate * 100 * 0.3;
        weight += 0.3;
      }
    }

    // Deception game strategy
    if (activities.deceptionGames.length > 0) {
      const winRate = activities.deceptionGames.filter(g => g.won).length / activities.deceptionGames.length;
      const strategyScore = activities.deceptionGames.reduce((sum, g) => sum + (g.strategyRating || 0), 0) / activities.deceptionGames.length;
      score += (winRate * 100 + strategyScore) * 0.2;
      weight += 0.2;
    }

    return weight > 0 ? Math.min(100, (score / weight)) : 0;
  }

  // Calculate collaboration skill
  calculateCollaborationSkill(activities) {
    let score = 0;
    let weight = 0;

    // Squad activities
    const squadActivities = activities.battles.filter(b => b.type === 'squad');
    if (squadActivities.length > 0) {
      const teamworkScore = squadActivities.reduce((sum, b) => sum + (b.teamworkRating || 0), 0) / squadActivities.length;
      score += teamworkScore * 0.4;
      weight += 0.4;
    }

    // Project collaboration
    if (activities.projects.length > 0) {
      const collabScore = activities.projects.reduce((sum, p) => sum + (p.collaborationRating || 0), 0) / activities.projects.length;
      score += collabScore * 0.4;
      weight += 0.4;
    }

    // Deception game teamwork
    if (activities.deceptionGames.length > 0) {
      const teamGames = activities.deceptionGames.filter(g => g.role !== 'GHOST');
      if (teamGames.length > 0) {
        const teamworkScore = teamGames.reduce((sum, g) => sum + (g.teamworkRating || 0), 0) / teamGames.length;
        score += teamworkScore * 0.2;
        weight += 0.2;
      }
    }

    return weight > 0 ? Math.min(100, score / weight) : 0;
  }

  // Calculate leadership skill
  calculateLeadershipSkill(activities) {
    let score = 0;
    let weight = 0;

    // Squad leadership
    const leadershipRoles = activities.battles.filter(b => b.role === 'leader');
    if (leadershipRoles.length > 0) {
      const leadershipScore = leadershipRoles.reduce((sum, b) => sum + (b.leadershipRating || 0), 0) / leadershipRoles.length;
      score += leadershipScore * 0.4;
      weight += 0.4;
    }

    // Project leadership
    const projectLeadership = activities.projects.filter(p => p.role === 'ARCHITECT');
    if (projectLeadership.length > 0) {
      const leadScore = projectLeadership.reduce((sum, p) => sum + (p.leadershipRating || 0), 0) / projectLeadership.length;
      score += leadScore * 0.4;
      weight += 0.4;
    }

    // Faction leadership activities
    if (activities.factionActivities.length > 0) {
      const leadershipActivities = activities.factionActivities.filter(f => f.type === 'leadership');
      if (leadershipActivities.length > 0) {
        const factionLeadScore = leadershipActivities.reduce((sum, f) => sum + (f.rating || 0), 0) / leadershipActivities.length;
        score += factionLeadScore * 0.2;
        weight += 0.2;
      }
    }

    return weight > 0 ? Math.min(100, score / weight) : 0;
  }

  // Calculate communication skill
  calculateCommunicationSkill(activities) {
    let score = 0;
    let weight = 0;

    // Deception game communication
    if (activities.deceptionGames.length > 0) {
      const commScore = activities.deceptionGames.reduce((sum, g) => sum + (g.communicationRating || 0), 0) / activities.deceptionGames.length;
      score += commScore * 0.5;
      weight += 0.5;
    }

    // Project communication
    if (activities.projects.length > 0) {
      const projCommScore = activities.projects.reduce((sum, p) => sum + (p.communicationRating || 0), 0) / activities.projects.length;
      score += projCommScore * 0.3;
      weight += 0.3;
    }

    // Faction activities communication
    if (activities.factionActivities.length > 0) {
      const factionCommScore = activities.factionActivities.reduce((sum, f) => sum + (f.communicationRating || 0), 0) / activities.factionActivities.length;
      score += factionCommScore * 0.2;
      weight += 0.2;
    }

    return weight > 0 ? Math.min(100, score / weight) : 0;
  }

  // Calculate creativity skill
  calculateCreativitySkill(activities) {
    let score = 0;
    let weight = 0;

    // Design missions
    const designMissions = activities.missions.filter(m => m.category === 'design_dives');
    if (designMissions.length > 0) {
      const creativityScore = designMissions.reduce((sum, m) => sum + (m.creativityRating || 0), 0) / designMissions.length;
      score += creativityScore * 0.4;
      weight += 0.4;
    }

    // Project innovation
    if (activities.projects.length > 0) {
      const innovationScore = activities.projects.reduce((sum, p) => sum + (p.innovationRating || 0), 0) / activities.projects.length;
      score += innovationScore * 0.4;
      weight += 0.4;
    }

    // Unique cipher solutions
    const uniqueSolutions = activities.ciphers.filter(c => c.uniqueSolution);
    if (activities.ciphers.length > 0) {
      const uniquenessScore = (uniqueSolutions.length / activities.ciphers.length) * 100;
      score += uniquenessScore * 0.2;
      weight += 0.2;
    }

    return weight > 0 ? Math.min(100, score / weight) : 0;
  }

  // Calculate adaptability skill
  calculateAdaptabilitySkill(activities) {
    let score = 0;
    let weight = 0;

    // Cross-category performance
    const categories = ['code_ops', 'design_dives', 'security_protocols', 'database_ops'];
    const performedCategories = categories.filter(cat => 
      activities.missions.some(m => m.category === cat)
    );
    
    if (performedCategories.length > 0) {
      const adaptabilityScore = (performedCategories.length / categories.length) * 100;
      score += adaptabilityScore * 0.4;
      weight += 0.4;
    }

    // Role flexibility in projects
    if (activities.projects.length > 0) {
      const uniqueRoles = [...new Set(activities.projects.map(p => p.role))];
      const roleFlexibility = (uniqueRoles.length / 5) * 100; // 5 possible roles
      score += Math.min(100, roleFlexibility) * 0.3;
      weight += 0.3;
    }

    // Faction activity diversity
    if (activities.factionActivities.length > 0) {
      const activityTypes = [...new Set(activities.factionActivities.map(f => f.type))];
      const diversityScore = (activityTypes.length / 6) * 100; // 6 possible activity types
      score += Math.min(100, diversityScore) * 0.3;
      weight += 0.3;
    }

    return weight > 0 ? Math.min(100, score / weight) : 0;
  }

  // Calculate overall score
  calculateOverallScore(skillBreakdown) {
    const weights = this.models.skillAssessment.weights;
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(skillBreakdown).forEach(([skill, score]) => {
      const weight = weights[skill] || 0.1;
      totalScore += score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  // Identify strengths
  identifyStrengths(skillBreakdown) {
    const strengths = [];
    const avgScore = Object.values(skillBreakdown).reduce((sum, score) => sum + score, 0) / Object.values(skillBreakdown).length;
    
    Object.entries(skillBreakdown).forEach(([skill, score]) => {
      if (score > avgScore + 15) {
        strengths.push({
          skill,
          score,
          level: score > 90 ? 'exceptional' : score > 75 ? 'strong' : 'above_average'
        });
      }
    });

    return strengths.sort((a, b) => b.score - a.score);
  }

  // Identify weaknesses
  identifyWeaknesses(skillBreakdown) {
    const weaknesses = [];
    const avgScore = Object.values(skillBreakdown).reduce((sum, score) => sum + score, 0) / Object.values(skillBreakdown).length;
    
    Object.entries(skillBreakdown).forEach(([skill, score]) => {
      if (score < avgScore - 15) {
        weaknesses.push({
          skill,
          score,
          level: score < 30 ? 'critical' : score < 50 ? 'needs_improvement' : 'below_average'
        });
      }
    });

    return weaknesses.sort((a, b) => a.score - b.score);
  }

  // Generate personalized recommendations
  generateRecommendations(analysis) {
    const recommendations = [];

    // Skill-based recommendations
    analysis.weaknesses.forEach(weakness => {
      switch (weakness.skill) {
        case 'technical':
          recommendations.push({
            type: 'skill_improvement',
            priority: 'high',
            action: 'Focus on code missions and technical challenges',
            expectedImprovement: '15-25 points in 2 weeks'
          });
          break;
        case 'collaboration':
          recommendations.push({
            type: 'skill_improvement',
            priority: 'medium',
            action: 'Join more squad activities and team projects',
            expectedImprovement: '10-20 points in 3 weeks'
          });
          break;
        case 'leadership':
          recommendations.push({
            type: 'skill_improvement',
            priority: 'medium',
            action: 'Take leadership roles in faction wars and projects',
            expectedImprovement: '12-18 points in 4 weeks'
          });
          break;
      }
    });

    // Career path recommendations
    if (analysis.careerPath) {
      recommendations.push({
        type: 'career_development',
        priority: 'high',
        action: `Focus on ${analysis.careerPath.name} track activities`,
        expectedImprovement: `${analysis.careerPath.growthPotential}% career advancement`
      });
    }

    return recommendations;
  }

  // Predict career path
  predictCareerPath(skillBreakdown) {
    const paths = {
      fullstack_developer: {
        name: 'Full-Stack Developer',
        requirements: { technical: 70, problemSolving: 65, adaptability: 60 },
        growthPotential: 85
      },
      security_specialist: {
        name: 'Security Specialist',
        requirements: { technical: 75, problemSolving: 80, creativity: 60 },
        growthPotential: 90
      },
      tech_lead: {
        name: 'Technical Lead',
        requirements: { technical: 70, leadership: 75, communication: 70 },
        growthPotential: 95
      },
      product_manager: {
        name: 'Product Manager',
        requirements: { collaboration: 80, communication: 85, leadership: 70 },
        growthPotential: 88
      },
      ai_engineer: {
        name: 'AI/ML Engineer',
        requirements: { technical: 85, problemSolving: 80, creativity: 75 },
        growthPotential: 92
      }
    };

    let bestMatch = null;
    let bestScore = 0;

    Object.entries(paths).forEach(([pathId, path]) => {
      let score = 0;
      let requirements = 0;

      Object.entries(path.requirements).forEach(([skill, required]) => {
        const userScore = skillBreakdown[skill] || 0;
        score += Math.min(userScore / required, 1);
        requirements++;
      });

      const matchScore = (score / requirements) * 100;
      if (matchScore > bestScore) {
        bestScore = matchScore;
        bestMatch = { ...path, matchScore, id: pathId };
      }
    });

    return bestMatch;
  }

  // Calculate market value
  calculateMarketValue(analysis) {
    const baseValue = 50000; // Base salary
    const skillMultiplier = analysis.overallScore / 100;
    const experienceMultiplier = Math.min(2, 1 + (analysis.skillBreakdown.technical / 100));
    const leadershipBonus = analysis.skillBreakdown.leadership > 70 ? 1.2 : 1;
    
    return Math.round(baseValue * skillMultiplier * experienceMultiplier * leadershipBonus);
  }

  // Find optimal team matches
  findTeamMatches(shadowId, projectRequirements) {
    const userProfile = this.assessmentData.get(shadowId);
    if (!userProfile) return [];

    const allProfiles = Array.from(this.assessmentData.values());
    const matches = [];

    allProfiles.forEach(profile => {
      if (profile.shadowId === shadowId) return;

      const compatibility = this.calculateTeamCompatibility(userProfile, profile, projectRequirements);
      if (compatibility.score > 70) {
        matches.push({
          shadowId: profile.shadowId,
          compatibility,
          recommendedRole: this.recommendRole(profile, projectRequirements)
        });
      }
    });

    return matches.sort((a, b) => b.compatibility.score - a.compatibility.score);
  }

  // Calculate team compatibility
  calculateTeamCompatibility(profile1, profile2, projectRequirements) {
    const factors = this.models.teamMatching.factors;
    let totalScore = 0;

    // Skill complementarity
    const skillComplement = this.calculateSkillComplementarity(profile1.skillBreakdown, profile2.skillBreakdown);
    totalScore += skillComplement * factors.skillComplementarity;

    // Communication style compatibility
    const commCompat = this.calculateCommunicationCompatibility(profile1, profile2);
    totalScore += commCompat * factors.communicationStyle;

    // Working style compatibility
    const workCompat = this.calculateWorkingStyleCompatibility(profile1, profile2);
    totalScore += workCompat * factors.workingStyle;

    // Personality fit
    const personalityFit = this.calculatePersonalityFit(profile1, profile2);
    totalScore += personalityFit * factors.personalityFit;

    return {
      score: totalScore,
      breakdown: {
        skillComplementarity: skillComplement,
        communicationCompatibility: commCompat,
        workingStyleCompatibility: workCompat,
        personalityFit
      }
    };
  }

  // Helper methods
  getDifficultyScore(difficulty) {
    const scores = { easy: 25, medium: 50, hard: 75, extreme: 100 };
    return scores[difficulty] || 0;
  }

  calculateSkillComplementarity(skills1, skills2) {
    // Calculate how well skills complement each other
    let complementScore = 0;
    const skillKeys = Object.keys(skills1);
    
    skillKeys.forEach(skill => {
      const diff = Math.abs(skills1[skill] - skills2[skill]);
      // Higher complementarity when skills are different but both above threshold
      if (skills1[skill] > 50 && skills2[skill] > 50) {
        complementScore += Math.min(diff, 30); // Reward differences up to 30 points
      }
    });

    return Math.min(100, (complementScore / skillKeys.length));
  }

  calculateCommunicationCompatibility(profile1, profile2) {
    // Simulate communication compatibility based on communication scores
    const comm1 = profile1.skillBreakdown.communication;
    const comm2 = profile2.skillBreakdown.communication;
    
    // Both high communicators work well together
    if (comm1 > 70 && comm2 > 70) return 90;
    
    // One high, one medium works well
    if ((comm1 > 70 && comm2 > 50) || (comm2 > 70 && comm1 > 50)) return 75;
    
    // Both medium is okay
    if (comm1 > 50 && comm2 > 50) return 60;
    
    // Low communication scores are problematic
    return 40;
  }

  calculateWorkingStyleCompatibility(profile1, profile2) {
    // Simulate working style compatibility
    const leadership1 = profile1.skillBreakdown.leadership;
    const leadership2 = profile2.skillBreakdown.leadership;
    
    // One leader, one follower is ideal
    if ((leadership1 > 70 && leadership2 < 60) || (leadership2 > 70 && leadership1 < 60)) return 85;
    
    // Both leaders can clash
    if (leadership1 > 70 && leadership2 > 70) return 50;
    
    // Both followers need external leadership
    if (leadership1 < 50 && leadership2 < 50) return 45;
    
    return 70;
  }

  calculatePersonalityFit(profile1, profile2) {
    // Simulate personality fit based on various factors
    const creativity1 = profile1.skillBreakdown.creativity;
    const creativity2 = profile2.skillBreakdown.creativity;
    const adaptability1 = profile1.skillBreakdown.adaptability;
    const adaptability2 = profile2.skillBreakdown.adaptability;
    
    // Similar creativity levels work well together
    const creativityFit = 100 - Math.abs(creativity1 - creativity2);
    
    // High adaptability is always good
    const adaptabilityBonus = Math.min(adaptability1, adaptability2) * 0.5;
    
    return Math.min(100, (creativityFit + adaptabilityBonus) / 1.5);
  }

  recommendRole(profile, projectRequirements) {
    const skills = profile.skillBreakdown;
    
    if (skills.leadership > 75 && skills.technical > 70) return 'ARCHITECT';
    if (skills.technical > 80) return 'DEVELOPER';
    if (skills.creativity > 75) return 'DESIGNER';
    if (skills.problemSolving > 80 && skills.technical > 70) return 'SECURITY';
    if (skills.technical > 60 && skills.problemSolving > 70) return 'DATA';
    
    return 'DEVELOPER'; // Default role
  }

  // Get comprehensive user insights
  getUserInsights(shadowId) {
    const profile = this.assessmentData.get(shadowId);
    if (!profile) return null;

    return {
      ...profile,
      insights: {
        topStrengths: profile.strengths.slice(0, 3),
        improvementAreas: profile.weaknesses.slice(0, 2),
        careerTrajectory: profile.careerPath,
        marketPosition: this.getMarketPosition(profile.marketValue),
        nextMilestones: this.getNextMilestones(profile)
      }
    };
  }

  getMarketPosition(marketValue) {
    if (marketValue > 120000) return 'Senior/Lead Level';
    if (marketValue > 90000) return 'Mid-Senior Level';
    if (marketValue > 70000) return 'Mid Level';
    if (marketValue > 50000) return 'Junior-Mid Level';
    return 'Entry Level';
  }

  getNextMilestones(profile) {
    const milestones = [];
    
    // Skill-based milestones
    Object.entries(profile.skillBreakdown).forEach(([skill, score]) => {
      if (score < 80) {
        const nextLevel = Math.ceil(score / 20) * 20;
        milestones.push({
          type: 'skill',
          target: `Reach ${nextLevel} in ${skill}`,
          currentProgress: score,
          targetProgress: nextLevel,
          estimatedTime: `${Math.ceil((nextLevel - score) / 5)} weeks`
        });
      }
    });

    // Career milestones
    if (profile.careerPath && profile.careerPath.matchScore < 90) {
      milestones.push({
        type: 'career',
        target: `Qualify for ${profile.careerPath.name} role`,
        currentProgress: profile.careerPath.matchScore,
        targetProgress: 90,
        estimatedTime: `${Math.ceil((90 - profile.careerPath.matchScore) / 3)} weeks`
      });
    }

    return milestones.slice(0, 5); // Top 5 milestones
  }
}

// Create singleton instance
const shadowAIEngine = new ShadowAIEngine();

export default shadowAIEngine;
