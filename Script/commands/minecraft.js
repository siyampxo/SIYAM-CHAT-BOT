// ফাইলের নাম: minecraft.js
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "minecraft",
    version: "MC-3.0",
    hasPermssion: 0,
    credits: "SIYAM MINECRAFT BOT",
    description: "Minecraft style image gapcha 😂",
    commandCategory: "minecraft-fun",
    usages: "কোনো ছবিতে রিপ্লাই করে .minecraft লিখো",
    cooldowns: 3
  },

  run: async function({ api, event }) {
    if (!event.messageReply || !event.messageReply.attachments?.[0]?.url) {
      return api.sendMessage("🧱 Minecraft Error!\nকোনো ছবিতে রিপ্লাই করে `.minecraft` লিখো!", event.threadID);
    }

    const url = event.messageReply.attachments[0].url;
    const load = await api.sendMessage("⛏️ Minecraft Mode ON...\nGenerating blocks...", event.threadID);

    try {
      const { data } = await axios.get(url, { responseType: "arraybuffer" });
      const img = await loadImage(data);

      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext("2d");

      // Pixel Block Effect
      const smallCanvas = createCanvas(25, 25);
      const smallCtx = smallCanvas.getContext("2d");
      smallCtx.drawImage(img, 0, 0, 25, 25);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(smallCanvas, 0, 0, img.width, img.height);

      // Magic Blur
      ctx.filter = "blur(12px)";
      ctx.drawImage(canvas, 0, 0);

      const outPath = path.join(__dirname, "cache", `minecraft_${Date.now()}.jpg`);
      fs.ensureDirSync(path.dirname(outPath));
      fs.writeFileSync(outPath, canvas.toBuffer("image/jpeg", { quality: 70 }));

      api.unsendMessage(load.messageID);
      api.sendMessage({
        body: "✅ Minecraft Completed!\nYour image is now BLOCKED 😂",
        attachment: fs.createReadStream(outPath)
      }, event.threadID, () => fs.unlinkSync(outPath));

    } catch (e) {
      console.log("MINECRAFT ERROR:", e.message);
      api.unsendMessage(load.messageID);
      api.sendMessage("❌ Minecraft processing failed!\nTry again!", event.threadID);
    }
  }
};
