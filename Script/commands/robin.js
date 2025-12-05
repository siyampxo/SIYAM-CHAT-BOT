module.exports.config = {
  name: "robin",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "You",
  description: "Custom meme generator using Imgur template",
  commandCategory: "Picture",
  usages: "robin [@mention]",
  cooldowns: 5,
  dependencies: {
    "fs-extra": "",
    "axios": "",
    "canvas": "",
    "jimp": "",
    "node-superfetch": ""
  }
};

module.exports.circle = async (image) => {
  const jimp = global.nodemodule["jimp"];
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
};

module.exports.run = async ({ event, api }) => {
  try {
    const Canvas = global.nodemodule["canvas"];
    const request = global.nodemodule["node-superfetch"];
    const jimp = global.nodemodule["jimp"];
    const fs = global.nodemodule["fs-extra"];

    const outPath = __dirname + "/cache/robin_custom.png";

    // mention না থাকলে sender ID
    const id =
      Object.keys(event.mentions)[0] || event.senderID;

    // 🔹 তোমার দেওয়া ইমগার ছবির URL
    const bgUrl = "https://imgur.com/RYrjG6Q.jpeg";

    // Canvas size (তোমার ইমগার ছবির উপর নির্ভর করে পরিবর্তন করা লাগলে জানিও)
    const canvas = Canvas.createCanvas(1024, 576);
    const ctx = canvas.getContext("2d");

    // Load background
    const background = await Canvas.loadImage(bgUrl);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Load FB avatar
    const avatarReq = await request.get(
      `https://graph.facebook.com/${id}/picture?width=512&height=512`
    );
    const avatar = await this.circle(avatarReq.body);

    const avatarImg = await Canvas.loadImage(avatar);

    // 🔹 মাথায় বসানোর অবস্থান (X, Y, Size)
    // চাইলে আমি এটা Adjust করে perfect করে দিতে পারি
    ctx.drawImage(avatarImg, 375, 45, 180, 180);

    // Save final
    const buffer = canvas.toBuffer();
    fs.writeFileSync(outPath, buffer);

    api.sendMessage(
      {
        body: "তোমার টেমপ্লেট রেডি 😄",
        attachment: fs.createReadStream(outPath)
      },
      event.threadID,
      () => fs.unlinkSync(outPath),
      event.messageID
    );
  } catch (e) {
    api.sendMessage("Error: " + e.message, event.threadID);
  }
};
