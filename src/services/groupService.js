/**
 * Group Service - Manages group chats and group functionality
 */

class GroupService {
  constructor() {
    this.storageKey = 'zentro_groups';
    this.membersKey = 'zentro_group_members';
    this.messagesKey = 'zentro_group_messages';
  }

  // Get all groups
  getAllGroups() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading groups:', error);
      return [];
    }
  }

  // Get groups for a specific user
  getUserGroups(userId) {
    const allGroups = this.getAllGroups();
    return allGroups.filter(group =>
      group.members.includes(userId) || group.admins.includes(userId)
    );
  }

  // Create a new group
  createGroup(groupData, creatorId) {
    try {
      const groups = this.getAllGroups();

      const newGroup = {
        id: Date.now().toString(),
        name: groupData.name,
        description: groupData.description || '',
        avatar: groupData.avatar || null,
        type: groupData.type || 'public', // public, private, secret
        secretCode: groupData.type === 'secret' ? this.generateSecretCode() : null,
        members: [creatorId],
        admins: [creatorId],
        createdBy: creatorId,
        ownerId: creatorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customRoles: [],
        memberRoles: {},
        settings: {
          allowInvites: true,
          allowZentroBot: true,
          maxMembers: 100
        }
      };

      groups.push(newGroup);
      localStorage.setItem(this.storageKey, JSON.stringify(groups));

      console.log('✅ Group created:', newGroup);
      return newGroup;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  // Generate secret code for secret groups
  generateSecretCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Join group by ID or secret code
  joinGroup(groupIdOrCode, userId) {
    try {
      const groups = this.getAllGroups();
      let group = groups.find(g => g.id === groupIdOrCode);

      // If not found by ID, try secret code
      if (!group) {
        group = groups.find(g => g.secretCode === groupIdOrCode);
      }

      if (!group) {
        throw new Error('Group not found');
      }

      if (group.members.includes(userId)) {
        throw new Error('Already a member of this group');
      }

      if (group.members.length >= group.settings.maxMembers) {
        throw new Error('Group is full');
      }

      group.members.push(userId);
      group.updatedAt = new Date().toISOString();

      localStorage.setItem(this.storageKey, JSON.stringify(groups));

      console.log('✅ User joined group:', { userId, groupId: group.id });
      return group;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }

  // Leave group
  leaveGroup(groupId, userId) {
    try {
      const groups = this.getAllGroups();
      const groupIndex = groups.findIndex(g => g.id === groupId);

      if (groupIndex === -1) {
        throw new Error('Group not found');
      }

      const group = groups[groupIndex];

      // Remove from members
      group.members = group.members.filter(id => id !== userId);

      // Remove from admins if admin
      group.admins = group.admins.filter(id => id !== userId);

      // If no members left, delete group
      if (group.members.length === 0) {
        groups.splice(groupIndex, 1);
      } else {
        // If no admins left, make first member admin
        if (group.admins.length === 0 && group.members.length > 0) {
          group.admins.push(group.members[0]);
        }
        group.updatedAt = new Date().toISOString();
      }

      localStorage.setItem(this.storageKey, JSON.stringify(groups));

      console.log('✅ User left group:', { userId, groupId });
      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }

  // Get group messages
  getGroupMessages(groupId) {
    try {
      if (!groupId) {
        console.warn('No groupId provided to getGroupMessages');
        return [];
      }

      const stored = localStorage.getItem(`${this.messagesKey}_${groupId}`);
      const messages = stored ? JSON.parse(stored) : [];

      // Ensure we always return an array
      return Array.isArray(messages) ? messages : [];
    } catch (error) {
      console.error('Error loading group messages:', error);
      return [];
    }
  }

  // Send message to group
  sendGroupMessage(groupId, message) {
    try {
      const messages = this.getGroupMessages(groupId);

      const newMessage = {
        id: Date.now().toString(),
        ...message,
        timestamp: new Date().toISOString(),
        groupId: groupId
      };

      messages.push(newMessage);
      localStorage.setItem(`${this.messagesKey}_${groupId}`, JSON.stringify(messages));

      return newMessage;
    } catch (error) {
      console.error('Error sending group message:', error);
      throw error;
    }
  }

  // Add Zenny to group
  addZennyToGroup(groupId) {
    try {
      const groups = this.getAllGroups();
      const group = groups.find(g => g.id === groupId);

      if (!group) {
        throw new Error('Group not found');
      }

      if (!group.members.includes('zenny_bot')) {
        group.members.push('zenny_bot');
        group.updatedAt = new Date().toISOString();

        localStorage.setItem(this.storageKey, JSON.stringify(groups));

        // Send welcome message from Zenny
        this.sendGroupMessage(groupId, {
          text: "🤖 Hello everyone! I'm Zenny, your AI assistant. I'm here to help with questions, provide information, and make your group chat more engaging! Just mention 'zenny' and ask me anything!",
          sender: {
            id: 'zenny_bot',
            name: 'Zenny',
            avatar: null
          },
          type: 'text'
        });

        console.log('✅ Zenny added to group:', groupId);
        return true;
      }

      return false; // Already in group
    } catch (error) {
      console.error('Error adding Zenny to group:', error);
      throw error;
    }
  }

  // Handle Zenny commands in groups
  handleZennyCommand(groupId, command, userId) {
    const commands = {
      'zenny help': () => "🤖 Zenny Commands:\n• Just mention 'zenny' and ask me anything!\n• I can help with group stats, jokes, facts, and general questions\n• I'm here to make your chat more fun and engaging!",
      'zenny stats': () => {
        const group = this.getAllGroups().find(g => g.id === groupId);
        const messages = this.getGroupMessages(groupId);
        return `📊 Group Stats:\n• Members: ${group?.members.length || 0}\n• Messages: ${messages.length}\n• Created: ${group ? new Date(group.createdAt).toLocaleDateString() : 'Unknown'}`;
      },
      'zenny joke': () => {
        const jokes = [
          "Why don't scientists trust atoms? Because they make up everything! 😄",
          "Why did the developer go broke? Because he used up all his cache! 💸",
          "What do you call a fake noodle? An impasta! 🍝",
          "Why don't eggs tell jokes? They'd crack each other up! 🥚",
          "What's a computer's favorite snack? Microchips! 💻"
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
      },
      'zenny fact': () => {
        const facts = [
          "🌟 Did you know? Honey never spoils! Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
          "🐙 Octopuses have three hearts and blue blood!",
          "🌍 A day on Venus is longer than its year!",
          "🧠 Your brain uses about 20% of your body's total energy.",
          "🦋 Butterflies taste with their feet!"
        ];
        return facts[Math.floor(Math.random() * facts.length)];
      }
    };

    // Check for partial matches (case insensitive) since we're using keyword-based triggering
    const lowerCommand = command.toLowerCase();
    for (const [cmd, handler] of Object.entries(commands)) {
      if (lowerCommand.includes(cmd.toLowerCase())) {
        return handler();
      }
    }

    return null; // No command found
  }

  // Update group settings
  updateGroup(groupId, updates, userId) {
    try {
      const groups = this.getAllGroups();
      const group = groups.find(g => g.id === groupId);

      if (!group) {
        throw new Error('Group not found');
      }

      if (!group.admins.includes(userId)) {
        throw new Error('Only admins can update group settings');
      }

      Object.assign(group, updates);
      group.updatedAt = new Date().toISOString();

      localStorage.setItem(this.storageKey, JSON.stringify(groups));

      console.log('✅ Group updated:', groupId);
      return group;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  // Search public groups
  searchPublicGroups(query) {
    const allGroups = this.getAllGroups();
    const publicGroups = allGroups.filter(g => g.type === 'public');

    if (!query) return publicGroups;

    return publicGroups.filter(group =>
      group.name.toLowerCase().includes(query.toLowerCase()) ||
      group.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Get group by ID
  getGroupById(groupId) {
    const groups = this.getAllGroups();
    return groups.find(g => g.id === groupId);
  }

  // Delete a message from group
  deleteGroupMessage(groupId, messageId) {
    try {
      const messages = this.getGroupMessages(groupId);
      const updatedMessages = messages.filter(msg => msg.id !== messageId);
      localStorage.setItem(`${this.messagesKey}_${groupId}`, JSON.stringify(updatedMessages));
      console.log('✅ Message deleted from group:', groupId, messageId);
      return true;
    } catch (error) {
      console.error('Error deleting group message:', error);
      throw error;
    }
  }

  // Update a message in group (for reactions, etc.)
  updateGroupMessage(groupId, messageId, updatedMessage) {
    try {
      const messages = this.getGroupMessages(groupId);
      const messageIndex = messages.findIndex(msg => msg.id === messageId);

      if (messageIndex !== -1) {
        messages[messageIndex] = { ...messages[messageIndex], ...updatedMessage };
        localStorage.setItem(`${this.messagesKey}_${groupId}`, JSON.stringify(messages));
        console.log('✅ Message updated in group:', groupId, messageId);
        return messages[messageIndex];
      }

      throw new Error('Message not found');
    } catch (error) {
      console.error('Error updating group message:', error);
      throw error;
    }
  }

  // Remove member from group (admin only)
  removeMemberFromGroup(groupId, memberId) {
    try {
      const groups = this.getAllGroups();
      const group = groups.find(g => g.id === groupId);

      if (!group) {
        throw new Error('Group not found');
      }

      // Remove from members
      group.members = group.members.filter(id => id !== memberId);

      // Remove from admins if admin
      group.admins = group.admins.filter(id => id !== memberId);

      group.updatedAt = new Date().toISOString();

      localStorage.setItem(this.storageKey, JSON.stringify(groups));

      console.log('✅ Member removed from group:', groupId, memberId);
      return true;
    } catch (error) {
      console.error('Error removing member from group:', error);
      throw error;
    }
  }

  // Invite member by username
  inviteMemberByUsername(groupId, username) {
    try {
      // Get all users from localStorage to find by username (check both possible keys)
      let allUsers = JSON.parse(localStorage.getItem('zentro_all_users') || '[]');
      if (allUsers.length === 0) {
        allUsers = JSON.parse(localStorage.getItem('zentro_registered_users') || '[]');
      }
      const targetUser = allUsers.find(user =>
        user.username?.toLowerCase() === username.toLowerCase() ||
        user.displayName?.toLowerCase() === username.toLowerCase()
      );

      if (!targetUser) {
        throw new Error('User not found');
      }

      const groups = this.getAllGroups();
      const group = groups.find(g => g.id === groupId);

      if (!group) {
        throw new Error('Group not found');
      }

      if (group.members.includes(targetUser.uid)) {
        throw new Error('User is already a member');
      }

      // Add to group
      group.members.push(targetUser.uid);
      group.updatedAt = new Date().toISOString();

      localStorage.setItem(this.storageKey, JSON.stringify(groups));

      console.log('✅ Member invited to group:', groupId, targetUser.uid);
      return true;
    } catch (error) {
      console.error('Error inviting member by username:', error);
      throw error;
    }
  }

  // Clear all messages from group (admin only)
  clearGroupMessages(groupId) {
    try {
      localStorage.setItem(`${this.messagesKey}_${groupId}`, JSON.stringify([]));
      console.log('✅ All messages cleared from group:', groupId);
      return true;
    } catch (error) {
      console.error('Error clearing group messages:', error);
      throw error;
    }
  }

  // Update group roles
  updateGroupRoles(groupId, customRoles) {
    try {
      const groups = this.getAllGroups();
      const groupIndex = groups.findIndex(g => g.id === groupId);

      if (groupIndex === -1) {
        throw new Error('Group not found');
      }

      groups[groupIndex].customRoles = customRoles;
      groups[groupIndex].updatedAt = new Date().toISOString();

      localStorage.setItem(this.storageKey, JSON.stringify(groups));
      return true;
    } catch (error) {
      console.error('Error updating group roles:', error);
      throw error;
    }
  }

  // Assign role to member
  assignMemberRole(groupId, memberId, roleId) {
    try {
      const groups = this.getAllGroups();
      const groupIndex = groups.findIndex(g => g.id === groupId);

      if (groupIndex === -1) {
        throw new Error('Group not found');
      }

      if (!groups[groupIndex].memberRoles) {
        groups[groupIndex].memberRoles = {};
      }

      groups[groupIndex].memberRoles[memberId] = roleId;
      groups[groupIndex].updatedAt = new Date().toISOString();

      localStorage.setItem(this.storageKey, JSON.stringify(groups));
      return true;
    } catch (error) {
      console.error('Error assigning member role:', error);
      throw error;
    }
  }

  // Get member role
  getMemberRole(groupId, memberId) {
    try {
      const group = this.getGroupById(groupId);
      if (!group) return 'member';

      if (group.ownerId === memberId) return 'owner';
      if (group.admins?.includes(memberId)) return 'admin';

      return group.memberRoles?.[memberId] || 'member';
    } catch (error) {
      console.error('Error getting member role:', error);
      return 'member';
    }
  }

  // Check if member has permission
  hasPermission(groupId, memberId, permission) {
    try {
      const group = this.getGroupById(groupId);
      if (!group) return false;

      const role = this.getMemberRole(groupId, memberId);

      // Owner and admin have all permissions
      if (role === 'owner' || role === 'admin') return true;

      // Check custom role permissions
      const customRole = group.customRoles?.find(r => r.id === role);
      return customRole?.permissions?.[permission] || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }
}

// Create and export singleton instance
const groupService = new GroupService();
export default groupService;
