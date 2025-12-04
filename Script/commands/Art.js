const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const API_ENDPOINT = "https://dev.oculux.xyz/api/artv1";
const cache = new Map();

module.exports = {
  config: {
    name: "art",
    aliases: ["artv1","draw"],
    version: "2.0",
    author: "ONLY SIYAM",
    countDown: 15,
    role: 0,
    description: "Generate AI images (grid + reply select)",
    category: "ai-image",
    usages: ".art <prompt>"
  },

  run: async ({ api, event, args }) => {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("❌ Please provide a prompt.\nExample: .art a cat in space", event.threadID);

    generateImages(api, event, prompt);
  },

  handleEvent: async ({ api, event }) => {
    const pick = event.body?.trim();
    if (!["1","2","3","4"].includes(pick)) return;

    if (!cache.has(event.senderID)) return;

    const data = cache.get(event.senderID);
    const imgURL = data.urls[pick - 1];

    if (!imgURL) return api.sendMessage("❌ Image not found", event.threadID);

    const file = path.join(__dirname,"cache",`art_pick_${event.senderID}.png`);

    try {
      const buffer = (await axios.get(imgURL, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(file, buffer);

      api.sendMessage({
        body: "✅ Selected Image:",
        attachment: fs.createReadStream(file)
      }, event.threadID, () => fs.unlinkSync(file));

      cache.delete(event.senderID);

    } catch(e){
      api.sendMessage("❌ Failed to send selected image", event.threadID);
    }
  }
};

// ===== IMAGE GENERATION & GRID =====
async function generateImages(api, event, prompt){
  let wait;
  const dir = path.join(__dirname,"cache");
  if(!fs.existsSync(dir)) fs.mkdirSync(dir);

  try {
    wait = await api.sendMessage("⏳ Generating 4 images...", event.threadID);

    const urls = [];
    for(let i=0;i<4;i++){
      const fullApiUrl = `${API_ENDPOINT}?p=${encodeURIComponent(prompt.trim())}`;
      const res = await axios.get(fullApiUrl, { responseType:"arraybuffer", timeout:60000 });
      const fileName = path.join(dir, `artv1_${Date.now()}_${i}.png`);
      fs.writeFileSync(fileName, res.data);
      urls.push(`file://${fileName}`);
    }

    const gridPath = path.join(dir, `grid_${Date.now()}.png`);
    await makeGrid(urls, gridPath);

    api.sendMessage({
      body: "🖼 Reply with 1-4 to select your preferred image",
      attachment: fs.createReadStream(gridPath)
    }, event.threadID, () => {
      urls.forEach(f=>{
        const p = f.replace("file://","");
        if(fs.existsSync(p)) fs.unlinkSync(p);
      });
      if(fs.existsSync(gridPath)) fs.unlinkSync(gridPath);
    });

    cache.set(event.senderID, { urls });

    api.unsendMessage(wait.messageID);

  } catch(e){
    console.error(e);
    api.sendMessage("❌ ArtV1 generation failed", event.threadID);
  }
}

// ===== GRID MAKER =====
async function makeGrid(images, output){
  const imgs = await Promise.all(images.map(p=>loadImage(p.replace("file://",""))));

  const w = imgs[0].width;
  const h = imgs[0].height;
  const pad = 10;

  const canvas = createCanvas(w*2 + pad*3, h*2 + pad*3);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#111";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  const pos = [
    [pad, pad],
    [pad*2 + w, pad],
    [pad, pad*2 + h],
    [pad*2 + w, pad*2 + h]
  ];

  imgs.forEach((img,i)=>{
    ctx.drawImage(img, pos[i][0], pos[i][1], w, h);

    ctx.fillStyle="rgba(0,0,0,0.6)";
    ctx.beginPath();
    ctx.arc(pos[i][0]+35,pos[i][1]+35,25,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle="#fff";
    ctx.font="bold 26px Arial";
    ctx.textAlign="center";
    ctx.textBaseline="middle";
    ctx.fillText(i+1,pos[i][0]+35,pos[i][1]+35);
  });

  fs.writeFileSync(output, canvas.toBuffer());
}
