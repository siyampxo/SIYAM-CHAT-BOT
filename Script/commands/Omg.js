module.exports = {
  config: {
    name: "art",
    version: "1.3",
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

      // ✅ Correct API call with 'p' query
      const response = await axios.get("https://dev.oculux.xyz/api/artv1", {
        params: { p: prompt }
      });

      console.log("DEBUG: Full API response:", response.data); // Check the console for exact API response

      // Handle different API response types
      let imageUrl = null;

      if (response.data.url) {
        imageUrl = response.data.url; // direct image URL
      } else if (response.data.image) {
        // Might be base64 string
        const base64Data = response.data.image.replace(/^data:image\/\w+;base64,/, "");
        fs.writeFileSync(avatarPath, Buffer.from(base64Data, "base64"));
        imageUrl = avatarPath; // local file path
      } else {
        return api.sendMessage("❌ Failed to generate image. Check console for API response.", event.threadID);
      }

      // If imageUrl is a URL, download it
      if (!fs.existsSync(imageUrl)) {
        const imgResp = await axios.get(imageUrl, { responseType: "stream" });
        const writer = fs.createWriteStream(avatarPath);
        imgResp.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
      }

      // Send image
      await api.sendMessage({
        body: `🎨 Here’s your art for: "${prompt}"`,
        attachment: fs.createReadStream(avatarPath)
      }, event.threadID);

      fs.unlinkSync(avatarPath);

    } catch (error) {
      console.error("Error in art command:", error.response ? error.response.data : error);
      api.sendMessage("❌ An error occurred while generating art. Check console for details.", event.threadID);
    }
  }
};
