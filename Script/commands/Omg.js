module.exports = {
  config: {
    name: "art",
    version: "1.4",
    author: "SIYAM CHAT BOT",
    hasPermission: 0,
    commandCategory: "fun",
    cooldowns: 5,
    description: "Generate AI art from your prompt",
    usage: "[prompt]",
    dependencies: {
      "axios": "",
      "fs-extra": ""
    }
  },

  run: async function({ api, event, args }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const path = require("path");

    try {
      if (!args[0]) {
        return api.sendMessage("⚠️ Please provide a prompt.\nExample: !art sunset over mountains", event.threadID);
      }

      const prompt = args.join(" ");
      const avatarPath = path.join(__dirname, "cache", `${event.senderID}.jpg`);

      // ✅ Correct API call with stream response
      const response = await axios.get("https://dev.oculux.xyz/api/artv1", {
        params: { p: prompt },
        responseType: 'arraybuffer' // <-- important for direct image stream
      });

      // Save image locally
      fs.writeFileSync(avatarPath, Buffer.from(response.data, "binary"));

      // Send image in Messenger
      await api.sendMessage({
        body: `🎨 Here’s your art for: "${prompt}"`,
        attachment: fs.createReadStream(avatarPath)
      }, event.threadID);

      // Delete temp file
      fs.unlinkSync(avatarPath);

    } catch (error) {
      console.error("Error in art command:", error.response ? error.response.data : error);
      api.sendMessage("❌ An error occurred while generating art. Check console.", event.threadID);
    }
  }
};
