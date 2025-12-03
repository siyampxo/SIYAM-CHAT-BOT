const axios = require("axios");

module.exports.config = {
  name: "numlookup",
  version: "1.0",
  hasPermssion: 0,
  credits: "SIYAM CHAT BOT",
  description: "Phone number lookup",
  commandCategory: "tools",
  usages: "numlookup 8801XXXXXXXX",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {

  console.log("✅ numlookup command triggered");

  if (!args[0]) {
    return api.sendMessage(
      "❌ Name diye number dao\nExample:\n!numlookup 8801838XXXXXX",
      event.threadID
    );
  }

  const number = args.join("").replace(/\D/g, "");

  const apiURL = `https://connect-foxapi.onrender.com/tools/numlookup?apikey=gaysex&number=${number}`;

  api.sendMessage("⏳ Checking number...", event.threadID);

  try {
    const res = await axios.get(apiURL);

    const data = res.data;

    const name = data.name || "N/A";
    const fb = data.fb_id || "Not Found";

    let msg = `Number Lookup Results 📱\n\n`;
    msg += `❏ Number: ${number}\n`;
    msg += `❏ Name: ${name}\n`;
    msg += `❏ Facebook ID: ${fb}`;

    if (data.img) {
      const img = await axios.get(data.img, { responseType: "stream" });
      return api.sendMessage(
        { body: msg, attachment: img.data },
        event.threadID
      );
    } else {
      return api.sendMessage(msg, event.threadID);
    }

  } catch (e) {
  console.log("NUMLOOKUP FULL ERROR:", e.response ? e.response.data : e.message);

  let errMsg = "❌ API Error\n";

  if (e.response && e.response.data) {
    errMsg += JSON.stringify(e.response.data);
  } else {
    errMsg += e.message;
  }

  api.sendMessage(errMsg, event.threadID);
  }
