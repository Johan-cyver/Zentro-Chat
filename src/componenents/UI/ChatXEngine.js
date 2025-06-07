// src/componenents/ChatXEngine.js

// Assign 1 or 2 imposters based on player count
export function assignRoles(players) {
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    const numImposters = players.length >= 7 ? 2 : 1;
  
    const imposters = shuffled.slice(0, numImposters).map(player => ({
      ...player,
      role: "Imposter",
    }));
  
    const crewmates = shuffled.slice(numImposters).map(player => ({
      ...player,
      role: "Crewmate",
    }));
  
    return [...imposters, ...crewmates];
  }
  