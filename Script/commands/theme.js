module.exports.config = {
  name: "theme",
  version: "FULL",
  credits: "SIYAM",
  description: "Full Facebook Theme System",
  commandCategory: "box",
  usages: "theme | theme apply <id> | theme random | themelist",
  cooldowns: 3
};

// Theme List
const THEMES = [
  { id: "719114035556075", name: "Default Blue" },
  { id: "741311439775765", name: "Love Pink" },
  { id: "737753080201816", name: "Ocean" },
  { id: "673634452315956", name: "Forest" },
  { id: "169463077707051", name: "Lavender" },
  { id: "742453486151997", name: "Sunset Glitch" },
  { id: "173011038065004", name: "Cyberpunk Neon" },
  { id: "671846021198103", name: "Cosmic Purple" },
  { id: "910754461698398", name: "Halloween" },
  { id: "312458497455517", name: "Rose Gold" }
];

// Optional: Admin only
const ADMIN_ONLY = false; // true করলে শুধু admin apply করতে পারবে

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  const senderID = event.senderID;

  // Admin check
  if (ADMIN_ONLY && event.isGroup) {
    const info = await api.getThreadInfo(threadID);
    if (!info.adminIDs.find(ad => ad.id == senderID)) {
      return api.sendMessage("❌ Only admin can use this command.", threadID);
    }
  }

  // NO ARG -> Show current theme
  if (!args[0]) {
    try {
      const info = await api.getThreadInfo(threadID);
      const id = info.threadTheme?.id || "default";
      const color = info.color || "default";
      return api.sendMessage(
        `🎨 CURRENT THEME\n\nTheme ID: ${id}\nColor: ${color}`,
        threadID
      );
    } catch {
      return api.sendMessage("❌ Can't read current theme.", threadID);
    }
  }

  const command = args[0].toLowerCase();

  // RANDOM THEME
  if (command === "random") {
    const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
    try {
      await api.changeThreadColor(theme.id, threadID);
      return api.sendMessage(`🎲 RANDOM THEME APPLIED\n\n🎨 ${theme.name}\nID: ${theme.id}`, threadID);
    } catch (e) {
      return api.sendMessage(`❌ Failed to apply theme\n${e.message}`, threadID);
    }
  }

  // APPLY THEME
  if (command === "apply") {
    const ID = args[1];
    if (!ID) return api.sendMessage("❌ Usage: .theme apply <theme_id>", threadID);
    const exist = THEMES.find(t => t.id === ID);
    if (!exist) return api.sendMessage("❌ Invalid Theme ID. Use .themelist", threadID);

    try {
      await api.changeThreadColor(ID, threadID);
      return api.sendMessage(
        `✅ THEME APPLIED\n\n🎨 ${exist.name}\nID: ${exist.id}`,
        threadID
      );
    } catch (e) {
      return api.sendMessage(`❌ Failed to apply theme\n${e.message}`, threadID);
    }
  }

  // SHOW THEMELIST
  if (command === "list" || command === "themelist") {
    const list = THEMES.map((t, i) => `${i + 1}. ${t.name}\n   ID: ${t.id}`).join("\n\n");
    return api.sendMessage(
      `🎨 FACEBOOK THEME LIST\n\n${list}\n\nUse:\n.theme apply <id>\n.theme random`,
      threadID
    );
  }

  // INVALID
  return api.sendMessage(
    "ℹ Usage:\n.theme -> show current\n.theme apply <id>\n.theme random\n.themelist -> list all themes",
    threadID
  );
};
