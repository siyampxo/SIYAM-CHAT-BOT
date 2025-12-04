// ফাইল নাম: omg.js (commands ফোল্ডারে রাখো)
const axios = require("axios");

module.exports = {
  config: {
    name: "omg",
    version: "3.0",
    hasPermssion: 0,
    credits: "Siyam Pro (Backup Edition)",
    description: "Instant OMG AI Image with backups",
    usages: ".omg a hot girl in red dress on beach",
    commandCategory: "AI IMAGE",
    cooldowns: 6
  },

  run: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("❌ লিখো কী চাও!\nExample: .omg a muscular man in gym", event.threadID);

    let msg = await api.sendMessage("🚀 OMG Loading... (with backups!)", event.threadID);

    // Backup APIs (সবচেয়ে রিলায়েবল)
    const apis = [
      // 1. Fal.ai Flux (সুপার ফাস্ট, no auth)
      {
        url: `https://fal.run/fal-ai/flux/schnell?prompt=${encodeURIComponent(prompt)}`,
        extract: (data) => data.images?.[0]?.url || data.url
      },
      // 2. YanzBot AI (ফ্রি + স্টেবল)
      {
        url: `https://api.yanzbotz.eu.org/api/ai/text2img?prompt=${encodeURIComponent(prompt)}`,
        extract: (data) => data.result || data.image_url
      },
      // 3. Safone Dev (বাংলা সাপোর্ট + art)
      {
        url: `https://api.safone.dev/ai/image?prompt=${encodeURIComponent(prompt)}`,
        extract: (data) => data.image || data.url
      }
    ];

    for (let apiConfig of apis) {
      try {
        const res = await axios.get(apiConfig.url, { timeout: 45000 });
        const imgUrl = apiConfig.extract(res.data);
        
        if (!imgUrl) continue;  // Skip if no URL

        const imageResponse = await axios.get(imgUrl, { responseType: "stream", timeout: 30000 });

        api.unsendMessage(msg.messageID);
        return api.sendMessage({
          body: `✨ OMG Magic Done! Used: ${apiConfig.url.includes('fal') ? 'Flux AI' : apiConfig.url.includes('yanz') ? 'YanzBot' : 'Safone'} 🔥`,
          attachment: imageResponse.data
        }, event.threadID);

      } catch (e) {
        console.log(`API ${apiConfig.url} failed:`, e.message);
        continue;  // Next API
      }
    }

    // যদি সব fail হয়
    api.unsendMessage(msg.messageID);
    api.sendMessage("❌ সব API busy আজকে! ৫ মিনিট পর আবার ট্রাই করো বা prompt চেঞ্জ করো। Alternative: .meta a dragon", event.threadID);
  }
};
