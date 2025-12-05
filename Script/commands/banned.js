module.exports.config = {
    name: "check",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "𝐎𝐍𝐋𝐘 𝐒𝐈𝐘𝐀𝐌 𝐁𝐎𝐓 𝑻𝑬𝑨𝑴_ ☢️",
    description: "Check Free Fire player info and banned status by UID",
    commandCategory: "game",
    usages: "[UID]",
    cooldowns: 5
};

module.exports.languages = {
    "en": {
        "noArgs": "❌ Please enter UID. Example: %prefix%check 903437692",
        "fetching": "⏳ Fetching info for UID: %1...",
        "result": "🧑‍💻 Player Info\n├─ Name: %1\n├─ UID: %2\n├─ Status: %3",
        "error": "❌ Error fetching info: %1"
    }
};

function escape_md(text) {
    if (!text) return "Unknown";
    return text.toString()
        .replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1"); // escape markdown
}

module.exports.run = async function({ api, event, args, getText }) {
    const axios = require("axios");
    const { threadID, messageID } = event;

    if (!args[0])
        return api.sendMessage(getText("noArgs", { prefix: global.config.PREFIX }), threadID, messageID);

    const UID = args[0];
    api.sendMessage(getText("fetching", UID), threadID, messageID);

    try {
        // 1️⃣ Danger Info API to get player name
        const dangerRes = await axios.get(`https://danger-info-alpha.vercel.app/accinfo?uid=${UID}&key=DANGERxINFO`);
        const playerName = escape_md(dangerRes.data.basicInfo?.nickname || "Unknown");

        // 2️⃣ Amin-Team API to get ban status
        const banRes = await axios.get(`http://amin-team-api.vercel.app/check_banned?player_id=${UID}`);
        const banStatus = banRes.data.status || "Unknown";

        // 3️⃣ Send structured response
        const msg = getText("result", playerName, UID, banStatus);
        api.sendMessage(msg, threadID, messageID);

    } catch (err) {
        api.sendMessage(getText("error", err.message), threadID, messageID);
    }
};
