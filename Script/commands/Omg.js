module.exports = {
  config: {
    name: "art",
    version: "1.0",
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
        return api.sendMessage("⚠️ Please provide a prompt to generate art.\nExample: !art sunset over mountains", event.threadID);
      }

      const prompt = args.join(" ");
      const avatarPath = path.join(__dirname, "cache", `${event.senderID}.jpg`);

      // Call the API
      const response = await axios.post("https://dev.oculux.xyz/api/artv1", { prompt });
      const imageUrl = response.data.url; // API er image URL

      if (!imageUrl) {
        return api.sendMessage("❌ Failed to generate image. Try again later.", event.threadID);
      }

      // Download image
      const imgResp = await axios.get(imageUrl, { responseType: "stream" });
      const writer = fs.createWriteStream(avatarPath);
      imgResp.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Send message with image
      const message = {
        body: `🎨 Here’s your art for: "${prompt}"`,
        attachment: fs.createReadStream(avatarPath)
      };

      await api.sendMessage(message, event.threadID);
      fs.unlinkSync(avatarPath);

    } catch (error) {
      console.error("Error in art command:", error);
      api.sendMessage("❌ An error occurred while generating art.", event.threadID);
    }
  }
};
