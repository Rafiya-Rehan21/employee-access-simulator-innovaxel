const roomRules = {
  "ServerRoom": {
    minAccessLevel: 2,
    openTime: "09:00",
    closeTime: "11:00",
    cooldown: 15 // minutes
  },
  "Vault": {
    minAccessLevel: 3,
    openTime: "09:00",
    closeTime: "10:00",
    cooldown: 30 // minutes
  },
  "R&D Lab": {
    minAccessLevel: 1,
    openTime: "08:00",
    closeTime: "12:00",
    cooldown: 10 // minutes
  }
};

module.exports = { roomRules };