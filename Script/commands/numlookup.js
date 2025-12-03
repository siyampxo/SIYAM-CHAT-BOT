const axios = require("axios");

module.exports.config = {
  name: "numlookup",
  version: "1.1",
  hasPermission: 0,
  credits: "SIYAM",
  description: "Phone number lookup",
  commandCategory: "utility",
  usages: ".numlookup <number>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {

  const number = args[0];
  if (!number) {
    return api.sendMessage("❌ Use: .numlookup <number>", event.threadID);
  }

  const url = `https://connect-foxapi.onrender.com/tools/numlookup?apikey=gaysex&number=${number}`;

  try {
    const res = await axios.get(url);
    const data = res.data;

    // 🔍 DEBUG (চাও তো remove করতে পারো পরে)
    console.log("API Response:", data);

    if (!data || data.status === false) {
      return api.sendMessage("❌ Lookup Failed! API did not return valid data.", event.threadID);
    }

    const name = data.name || data.result?.name || "Not Found";
    const fb = data.facebook || data.result?.facebook || "Not Found";

    let fbText = "Not Found";
    if (fb && fb !== "Not Found") {
      fbText = `https://facebook.com/${fb}`;
    }

    const message = 
`📱 Number Lookup Results

❏ Number: ${number}
❏ Name: ${name}
❏ Facebook: ${fbText}`;

    return api.sendMessage(message, event.threadID);

  } catch (error) {
    console.error("Lookup Error:", error.message);
    return api.sendMessage("❌ Lookup Failed (API Error or Server Down).", event.threadID);
  }
};