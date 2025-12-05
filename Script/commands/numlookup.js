/**
 * numlookup.js
 * Usage:
 *   !numlookup 8801789963078
 *   /numlookup 01838000000
 *
 * API:
 * https://connect-foxapi.onrender.com/tools/numlookup?apikey=gaysex&number=
 */

module.exports.config = {
  name: "numlookup",
  version: "2.0",
  hasPermssion: 0,
  credits: "SIYAM",
  description: "Phone number lookup with image + card style",
  commandCategory: "utility",
  usages: "!numlookup <number>",
  cooldowns: 3
};

const axios = require("axios");

const BASE_API = "https://connect-foxapi.onrender.com/tools/numlookup";
const API_KEY = "gaysex"; // YOUR API KEY HERE

module.exports.run = async function({ api, event, args }) {
  try {
    const threadID = event.threadID;
    const input = args.join("").trim();

    if (!input) {
      return api.sendMessage(
        "❗ Use: !numlookup <phone number>\nExample: !numlookup 8801789963078",
        threadID
      );
    }

    // sanitize number
    const number = input.replace(/\s+/g, "").replace(/^\+/, "");

    const url = `${BASE_API}?apikey=${API_KEY}&number=${number}`;

    await api.sendMessage(`🔎 Looking up: ${number} ...`, threadID);

    const res = await axios.get(url, { timeout: 15000 });
    const data = res.data;

    if (!data || data.error || data.status === "error") {
      return api.sendMessage(
        `❌ Lookup failed.\n${data.message || "No response from API"}`,
        threadID
      );
    }

    // Unwrap API response safely
    let payload = data.data || data.result || data;

    const name = payload.name || "Not Found";
    const img = payload.img || null;
    const fb = payload.fb_id || "Not Found";

    // UI Output
    const text = 
`📱 Number Lookup Results

━━━━━━━━━━━━━━━━━━
☑ Number      : ${number}
☑ Name        : ${name}
☑ Facebook ID : ${fb === null ? "Not Found" : fb}
━━━━━━━━━━━━━━━━━━
🤖 SIYAM Lookup Bot`;

    // Send with image if exists
    if (img) {
      const stream = await axios.get(img, { responseType: "stream" });
      return api.sendMessage({
        body: text,
        attachment: stream.data
      }, threadID);
    }

    // else text only
    return api.sendMessage(text, threadID);

  } catch (err) {
    console.log("numlookup error:", err.message || err);
    return api.sendMessage("❌ Error occurred during lookup. Try again later.", event.threadID);
  }
};
