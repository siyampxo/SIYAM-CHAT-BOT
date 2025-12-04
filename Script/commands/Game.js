module.exports = {
  config: {
    name: "game",
    version: "3.0",
    author: "তোমার নাম / CYBER TEAM",
    category: "game",
    description: "বটের সাথে বিভিন্ন গেম খেলো",
    usage: "game <tictactoe / guess / rps / word / math / hangman>"
  },

  onStart: async function ({ api, event, args }) {
    const command = args[0]?.toLowerCase();

    if (!command) {
      return api.sendMessage(
`🎮 𝗚𝗔𝗠𝗘 𝗠𝗘𝗡𝗨 🎲

🎲 tictactoe → X O খেলা
🎲 guess → সংখ্যা অনুমান করো
🎲 rps → পাথর কাগজ কাঁচি
🎲 word → শব্দের চেইন
🎲 math → গণিতের প্রশ্ন
🎲 hangman → ঝুলন্ত মানুষ

শুধু লিখো: game tictactoe
অথবা: game guess`, event.threadID);
    }

    // Tic Tac Toe
    if (command === "tictactoe" || command === "xo") {
      const board = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
      global.tictactoe = { board, player: event.senderID, turn: "X" };
      return api.sendMessage(`🎲 𝗧𝗜𝗖 𝗧𝗔𝗖 𝗧𝗢𝗘\n\n${formatBoard(board)}\nতোমার চিহ্ন: X\n১-৯ নম্বর দিয়ে খেলো!`, event.threadID);
    }

    // Number Guessing
    if (command === "guess") {
      const number = Math.floor(Math.random() * 100) + 1;
      global.guess = { number, player: event.senderID, tries: 0 };
      return api.sendMessage(`🔢 আমি ১-১০০ এর মধ্যে একটা সংখ্যা ভেবেছি!\nঅনুমান করো!`, event.threadID);
    }

    // Rock Paper Scissors
    if (command === "rps") {
      return api.sendMessage(`✊✋✌️ রক পেপার সিজার্স!\nরিপ্লাই করো: rock / paper / scissors`, event.threadID, (err, info) => {
        global.rps = { messageID: info.messageID, player: event.senderID };
      });
    }
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    const { author, messageID } = Reply;

    if (!global.tictactoe && !global.guess && !global.rps) return;

    // Tic Tac Toe Reply
    if (global.tictactoe && global.tictactoe.player === event.senderID) {
      const move = parseInt(event.body);
      if (isNaN(move) || move < 1 || move > 9 || global.tictactoe.board[move-1] === "X" || global.tictactoe.board[move-1] === "O") {
        return api.sendMessage("❌ ভুল জায়গা! আবার চেষ্টা করো।", event.threadID);
      }
      global.tictactoe.board[move-1] = "X";
      if (checkWin(global.tictactoe.board, "X")) {
        api.sendMessage(`🎉 তুমি জিতেছো!\n\n${formatBoard(global.tictactoe.board)}`, event.threadID);
        delete global.tictactoe;
      } else if (global.tictactoe.board.every(v => v === "X" || v === "O")) {
        api.sendMessage(`🤝 ড্র হয়ে গেল!\n\n${formatBoard(global.tictactoe.board)}`, event.threadID);
        delete global.tictactoe;
      } else {
        botMove();
        if (checkWin(global.tictactoe.board, "O")) {
          api.sendMessage(`😔 বট জিতেছে!\n\n${formatBoard(global.tictactoe.board)}`, event.threadID);
          delete global.tictactoe;
        } else {
          api.sendMessage(`${formatBoard(global.tictactoe.board)}\nতোমার পালা (X)`, event.threadID);
        }
      }
    }

    // Number Guess Reply
    if (global.guess && global.guess.player === event.senderID) {
      const guess = parseInt(event.body);
      global.guess.tries++;
      if (guess === global.guess.number) {
        api.sendMessage(`🎉 সঠিক! তুমি জিতেছো!\nসংখ্যা ছিল: ${global.guess.number}\nচেষ্টা: ${global.guess.tries} বার`, event.threadID);
        delete global.guess;
      } else if (guess < global.guess.number) {
        api.sendMessage(`📈 আরেকটু বড় সংখ্যা!`, event.threadID);
      } else {
        api.sendMessage(`📉 আরেকটু ছোট সংখ্যা!`, event.threadID);
      }
    }

    // RPS Reply
    if (global.rps && global.rps.messageID === event.messageReply?.messageID) {
      const choice = event.body.toLowerCase();
      const options = ["rock", "paper", "scissors"];
      const bot = options[Math.floor(Math.random() * 3)];
      const result = (choice === bot) ? "🤝 ড্র!" :
                     (choice === "rock" && bot === "scissors") || 
                     (choice === "paper" && bot === "rock") || 
                     (choice === "scissors" && bot === "paper") ? "🎉 তুমি জিতেছো!" : "😔 বট জিতেছে!";
      api.sendMessage(`${result}\nতুমি: ${choice}\nবট: ${bot}`, event.threadID);
      delete global.rps;
    }
  }
};

function formatBoard(board) {
  return `${board[0]} | ${board[1]} | ${board[2]}\n${board[3]} | ${board[4]} | ${board[5]}\n${board[6]} | ${board[7]} | ${board[8]}`;
}

function checkWin(board, player) {
  const win = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return win.some(combo => combo.every(i => board[i] === player));
}

function botMove() {
  const board = global.tictactoe.board;
  const available = board.map((v, i) => v !== "X" && v !== "O" ? i : null).filter(v => v !== null);
  const move = available[Math.floor(Math.random() * available.length)];
  board[move] = "O";
  }
