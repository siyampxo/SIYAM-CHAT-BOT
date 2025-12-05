/**
 * numlookup.js
 * Usage:
 *   !numlookup 8801838000000
 *   /numlookup 01838000000
 *
 * Uses the provided API:
 * https://connect-foxapi.onrender.com/tools/numlookup?apikey=gaysex&number=...
 *
 * Replace API_URL or apikey if you have a different key.
 */

module.exports.config = {
  name: "numlookup",
  version: "1.0",
  hasPermssion: 0,
  credits: "SIYAM",
  description: "Lookup phone number info via foxapi",
  commandCategory: "utility",
  usages: "!numlookup <phone>",
  cooldowns: 3
};

const axios = require("axios");

// If you want to change apikey later, edit this constant
const BASE_API = "https://connect-foxapi.onrender.com/tools/numlookup";
const API_KEY = "gaysex"; // provided by you

// Helper: nicely format nested objects
function formatObject(obj, indent = "") {
  if (obj === null) return "null";
  if (typeof obj !== "object") return String(obj);

  let out = "";
  const pad = indent + "  ";
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      out += `${indent}${key}:\n${formatObject(val, pad)}\n`;
    } else if (Array.isArray(val)) {
      if (val.length === 0) {
        out += `${indent}${key}: []\n`;
      } else {
        out += `${indent}${key}:\n`;
        val.forEach((v, i) => {
          out += `${pad}[${i}] ${formatObject(v, pad + "  ")}\n`;
        });
      }
    } else {
      out += `${indent}${key}: ${val}\n`;
    }
  }
  return out.trimRight();
}

module.exports.run = async function({ api, event, args }) {
  try {
    const threadID = event.threadID;
    // join args in case number contains spaces (user mistake)
    const input = args.join("").trim();
    if (!input) {
      return api.sendMessage(
        "❗ Use: !numlookup <phone number>\nExample: !numlookup 8801838000000",
        threadID
      );
    }

    // Basic sanitize: remove spaces, plus signs
    const number = input.replace(/\s+/g, "").replace(/^\+/, "");

    // build url
    const url = `${BASE_API}?apikey=${encodeURIComponent(API_KEY)}&number=${encodeURIComponent(number)}`;

    await api.sendMessage(`🔎 Looking up: ${number} ...`, threadID);

    const res = await axios.get(url, { timeout: 15000 });
    const data = res.data;

    if (!data) {
      return api.sendMessage("❌ No response from lookup API.", threadID);
    }

    // If API returns an error structure, handle gracefully
    if (data.error || data.status === "error") {
      const errMsg = data.message || data.error || "Unknown API error";
      return api.sendMessage(`❌ API error: ${errMsg}`, threadID);
    }

    // Format the result generically so it works with many response shapes
    // If response contains `data` or `result` unwrap it
    let payload = data;
    if (payload.data && typeof payload.data === "object") payload = payload.data;
    if (payload.result && typeof payload.result === "object") payload = payload.result;

    // Build pretty text
    let text = `📌 Number lookup result for: ${number}\n────────────────────\n`;

    // Try to include a few common fields first (if present)
    const commonFields = [
      "valid", "phone", "international_format", "local_format",
      "country", "country_code", "location", "carrier", "line_type",
      "operator", "region"
    ];
    for (const f of commonFields) {
      if (payload[f] !== undefined) {
        text += `• ${f.charAt(0).toUpperCase() + f.slice(1)}: ${payload[f]}\n`;
      }
    }

    // If payload has many other keys, append them prettily
    const remaining = {};
    for (const k of Object.keys(payload)) {
      if (!commonFields.includes(k)) remaining[k] = payload[k];
    }

    if (Object.keys(remaining).length) {
      text += `\n🔍 More info:\n${formatObject(remaining, "  ")}\n`;
    }

    // If final text is too long for a single message, send in parts
    const chunkSize = 1500;
    if (text.length <= chunkSize) {
      return api.sendMessage(text, threadID);
    } else {
      // split by lines to keep messages readable
      const lines = text.split("\n");
      let part = "";
      for (const line of lines) {
        if ((part + "\n" + line).length > chunkSize) {
          await api.sendMessage(part, threadID);
          part = line;
        } else {
          part += (part ? "\n" : "") + line;
        }
      }
      if (part) await api.sendMessage(part, threadID);
    }

  } catch (err) {
    console.error("numlookup error:", err && err.message ? err.message : err);
    const threadID = event.threadID;
    // Try to give helpful error to user
    if (err.code === "ECONNABORTED") {
      return api.sendMessage("❌ Request timed out. Try again later.", threadID);
    }
    if (err.response && err.response.data) {
      return api.sendMessage(`❌ API error: ${JSON.stringify(err.response.data)}`, threadID);
    }
    return api.sendMessage("❌ Unknown error occurred while looking up number.", threadID);
  }
};
