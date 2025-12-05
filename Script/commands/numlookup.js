/**
 * numlookup.js
 * Usage:
 * !numlookup 8801789963078
 */

module.exports.config = {
  name: "numlookup",
  version: "3.0",
  hasPermssion: 0,
  credits: "SIYAM",
  description: "Live number lookup styled output",
  commandCategory: "utility",
  usages: "!numlookup <number>",
  cooldowns: 3
};

const axios = require("axios");

const BASE_API = "https://connect-foxapi.onrender.com/tools/numlookup";
const API_KEY = "gaysex";

module.exports.run = async function({ api, event, args }) {
  try {

    const threadID = event.threadID;
    const input = args.join("").trim();

    if (!input) {
      return api.sendMessage("❌ Usage: .numlookup <number>\nExample: .numlookup 8801XXXXXXXXX", threadID);
    }

    // Clean number
    const number = input.replace(/\s+/g, "").replace(/^\+/, "");

    await api.sendMessage(`🔍 SEARCHING PLEASE WAIT...\n\n📞 Looking: ${number}`, threadID);

    const url = `${BASE_API}?apikey=${API_KEY}&number=${number}`;
    const res = await axios.get(url, { timeout: 15000 });
    const data = res.data;

    if (!data || data.status === "error" || data.error) {
      return api.sendMessage("❌ Lookup failed! API did not respond.", threadID);
    }

    // Extract data
    const payload = data.data || data.result || data;

    const name = payload.name || "Not Found";
    const img = payload.img || null;
    const fb = payload.fb_id || "Not Found";

    const photoStatus = img ? "Loaded ✅" : "Not Found ❌";

    // Final styled output
    const resultText = 
`🔍 𝕃𝕀𝕍𝔼 ℕ𝕌𝕄𝔹𝔼ℝ 𝕃𝕆𝕆𝕂𝕌ℙ

👤 𝙽𝙰𝙼𝙴      : ${name}
📞 𝙽𝚄𝙼𝙱𝙴𝚁    : ${number}
📘 𝙵𝚊𝚌𝚎𝚋𝚘𝚘𝚔  : ${fb === null ? "Not Found" : fb}
🖼 𝙿𝙷𝙾𝚃𝙾     : ${photoStatus}

━━━━━━━━━━━━
🤖 𝐒𝐈𝐘𝐀𝐌 𝐋𝐎𝐎𝐊𝐔𝐏 𝐁𝐎𝐓`;

    // Send with image if exists
    if (img) {
      const stream = await axios.get(img, { responseType: "stream" });
      return api.sendMessage({
        body: resultText,
        attachment: stream.data
      }, threadID);
    }

    // No image -> only text
    return api.sendMessage(resultText, threadID);

  } catch (e) {
    console.error("numlookup error:", e.message || e);
    return api.sendMessage("❌ Server error! Try again later.", event.threadID);
  }
};
