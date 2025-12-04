module.exports.config = {
    name: "math",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "Grok xAI + Siam",
    description: "বাংলায় পূর্ণাঙ্গ ধাপে ধাপে গণিত সমাধান",
    commandCategory: "study",
    usages: "math x + 5 = 10",
    cooldowns: 5,
    dependencies: { "axios": "", "fs-extra": "" },
    envConfig: { "WOLFRAM": "T8J8YV-H265UQ762K" }
};

module.exports.run = async function ({ api, event, args }) {
    const axios = global.nodemodule["axios"];
    const fs = global.nodemodule["fs-extra"];
    const { threadID, messageID } = event;
    const out = (msg, callback) => api.sendMessage(msg, threadID, callback, messageID);

    const input = args.join(" ").trim();
    if (!input) return out("❌ কী সমাধান করবো? একটা প্রশ্ন লিখো 😅\nউদাহরণ: math 2x + 8 = 20");

    // Wolfram থেকে step-by-step নেওয়ার চেষ্টা
    try {
        const res = await axios.get("http://api.wolframalpha.com/v2/query", {
            params: {
                appid: global.configModule.math.WOLFRAM,
                input: input + " step-by-step",
                podstate: "Step-by-step solution",
                format: "plaintext",
                output: "json"
            }
        });

        const data = res.data.queryresult;

        if (data.success === false) throw new Error("Wolfram failed");

        let steps = "";
        let images = [];

        for (let pod of data.pods) {
            if (pod.title.toLowerCase().includes("step") || pod.title.toLowerCase().includes("solution")) {
                for (let sub of pod.subpods) {
                    if (sub.plaintext) steps += sub.plaintext + "\n\n";
                    if (sub.img?.src) images.push(sub.img.src);
                }
            }
        }

        // যদি Wolfram এ ভালো স্টেপ না পাই → নিজে লিখে দিব
        if (!steps.includes("step") && !steps.includes("⇒") && steps.length < 50) {
            steps = await beautifulBanglaSolution(input);
        }

        let msg = `🧮 গণিত সমাধান\n\n`;
        msg += `📝 প্রশ্ন: ${input}\n\n`;
        msg += `✍️ ধাপে ধাপে সমাধান:\n\n`;
        msg += steps.trim();

        // ছবি থাকলে পাঠাবো
        if (images.length > 0) {
            const attachments = [];
            for (let url of images.slice(0, 3)) {
                const img = (await axios.get(url, { responseType: "stream" })).data;
                const path = __dirname + `/cache/math_${Date.now()}.png`;
                await new Promise(r => img.pipe(fs.createWriteStream(path)).on("close", r));
                attachments.push(fs.createReadStream(path));
            }
            return out({ body: msg, attachment: attachments }, () => attachments.forEach(f => fs.unlinkSync(f.path)));
        }

        out(msg);

    } catch (e) {
        // Wolfram ফেল করলে নিজের ফাংশন দিয়ে সমাধান করব
        const manual = await beautifulBanglaSolution(input);
        out(`🧮 গণিত সমাধান\n\n📝 প্রশ্ন: ${input}\n\n✍️ ধাপে ধাপে সমাধান:\n\n${manual}`);
    }
};

// এটাই ম্যাজিক → সব ধরনের সমীকরণের জন্য সুন্দর বাংলা সমাধান
async function beautifulBanglaSolution(eq) {
    eq = eq.replace(/\s/g, "").toLowerCase();

    // কেস ১: x = 5 এর মতো
    if (/^x=?[0-9.+-]+$/.test(eq)) {
        const val = eq.split("=")[1] || eq.replace("x", "");
        return `দেওয়া আছে: x = ${val}\n\nএটি একটি সরল সমীকরণ যেখানে x এর মান সরাসরি দেওয়া আছে।\n\n∴ x = ${val}\n\n✅ সমাধান সম্পূর্ণ`;
    }

    // কেস ২: ax + b = c
    const linearPattern = /([0-9.]*\.?[0-9]+)?x([+-]\d+\.?\d*)?=([+-]?\d+\.?\d+)/;
    if (linearPattern.test(eq)) {
        let [_, a = "1", b = "", c] = eq.match(linearPattern);
        a = a || "1";
        b = b || "0";
        c = c || "0";

        if (a === "") a = "1";
        if (b.startsWith("+")) b = b.slice(1);

        let steps = `দেওয়া আছে:\n${a === "1" ? "" : a}x ${b >= 0 ? "+" : ""} ${b} = ${c}\n\n`;

        steps += "১. দুই পাশ থেকে ";
        if (parseFloat(b) >= 0) steps += `+${b} বিয়োগ করি:\n`;
        else steps += `${b} যোগ করি:\n`;

        const newRight = parseFloat(c) - parseFloat(b);
        steps += `${a}x = ${newRight}\n\n`;

        steps += `২. দুই পাশকে ${a} দিয়ে ভাগ করি:\n`;
        steps += `x = ${newRight / parseFloat(a)}\n\n`;

        steps += `✅ সমাধান: x = ${newRight / parseFloat(a)}`;
        return steps;
    }

    // আরো অনেক কেস যোগ করা যাবে (কোয়াড্রেটিক, ট্রিগ ইত্যাদি)
    return `এই সমীকরণটির ধাপে ধাপে সমাধান এখনো তৈরি করা হয়নি 😅\nতবে Wolfram Alpha থেকে চেষ্টা করা হয়েছে!`;
}
