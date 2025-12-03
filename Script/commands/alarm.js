const fs = require("fs");
const axios = require("axios");

module.exports.config = {
  name: "alarm",
  version: "FINAL-V2",
  hasPermssion: 0,
  credits: "SIYAM CHAT BOT",
  description: "Advanced Alarm Bot (Multi Voice System)",
  commandCategory: "tools",
  countDown: 1,
};

const DATA_FILE = __dirname + "/alarm_data.json";

// ✅ MP3 KEYWORD MAP
const MP3_MAP = {
  ALART: "https://drive.google.com/uc?export=download&id=1xHyaY30v3kLUAxIOCBh1dALQXeGa52-L",
  FUN: "https://drive.google.com/uc?export=download&id=19geGzFrKgg9Sq7t1Yf6z3vfW6X6m19TM",
  COW: "https://drive.google.com/uc?export=download&id=1eYElaLdKGCeUa7bnD6HNZ12ZpYEeswrd",
  LOVE: "https://example.com/love.mp3"
};

// ✅ fallback mp3
const DEFAULT_TYPE = "ALART";

let alarms = [];
if (fs.existsSync(DATA_FILE)) {
  try {
    alarms = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    alarms = [];
  }
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(alarms, null, 2));
}

// ✅ Bangladesh Time
function getBDTime() {
  return new Date(Date.now() + 21600000)
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
    .toUpperCase();
}

module.exports.run = async function ({ api, event, args }) {

  // 📃 LIST
  if (args[0] === "list") {
    if (!alarms.length) return api.sendMessage("❌ কোনো alarm নাই", event.threadID);

    let text = "⏰ Alarm List:\n\n";
    alarms.forEach((a, i) => {
      text += `${i + 1}. ${a.time} ${a.daily ? "(Daily)" : ""} | ${a.type} | ${a.message || "Alarm"}\n`;
    });
    return api.sendMessage(text, event.threadID);
  }

  // ❌ REMOVE
  if (args[0] === "remove") {
    const index = parseInt(args[1]) - 1;
    if (isNaN(index) || !alarms[index]) {
      return api.sendMessage("❌ ভুল নাম্বার দিছো", event.threadID);
    }
    alarms.splice(index, 1);
    saveData();
    return api.sendMessage("✅ Alarm delete হয়েছে", event.threadID);
  }

  let daily = false;
  let timeIndex = 0;

  // 🔁 DAILY
  if (args[0] === "daily") {
    daily = true;
    timeIndex = 1;
  }

  const time = args[timeIndex] + " " + args[timeIndex + 1];
  const format = /^\d{1,2}:\d{2}\s?(AM|PM)$/i;

  if (!format.test(time)) {
    return api.sendMessage("❌ Time ভুল\nExample: !alarm 12:30 PM FUN", event.threadID);
  }

  let message = "";
  let type = DEFAULT_TYPE;

  const remain = args.slice(timeIndex + 2);

  remain.forEach(arg => {
    const up = arg.toUpperCase();

    if (MP3_MAP[up]) {
      type = up;
    } else {
      message += arg + " ";
    }
  });

  alarms.push({
    time: time.toUpperCase(),
    message: message.trim(),
    type,
    url: MP3_MAP[type] || MP3_MAP[DEFAULT_TYPE],
    daily,
    threadID: event.threadID
  });

  saveData();

  api.sendMessage(`✅ Alarm set: ${time} ${daily ? "(Daily)" : ""}\n🎵 Voice Type: ${type}`, event.threadID);
};

// ⏰ LOOP CHECK
module.exports.onLoad = function ({ api }) {

  console.log("✅ Multi Voice Alarm Bot Running...");

  setInterval(async () => {

    const now = getBDTime();

    for (let i = alarms.length - 1; i >= 0; i--) {

      const alarm = alarms[i];

      if (alarm.time === now) {

        try {

          // ✅ Send text
          await api.sendMessage(
            alarm.message ? `⏰ সময় হয়ে গেছে\n${alarm.message}` : "⏰ সময় হয়ে গেছে!",
            alarm.threadID
          );

          // ✅ Send voice
          const audio = await axios.get(alarm.url, { responseType: "stream" });

          await api.sendMessage(
            { attachment: audio.data },
            alarm.threadID
          );

          // ✅ Remove if not daily
          if (!alarm.daily) alarms.splice(i, 1);
          saveData();

        } catch (err) {
          console.log("❌ Alarm Error:", err.message);
        }
      }
    }

  }, 15000);
};