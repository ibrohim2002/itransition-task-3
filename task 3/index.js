import crypto from "crypto";
import readline from "readline";

function generateWinTable(moves) {
  const table = {};

  for (let i = 0; i < moves.length; i++) {
    table[moves[i]] = {};

    for (let j = 0; j < moves.length; j++) {
      if (i === j) {
        table[moves[i]][moves[j]] = "Draw";
      } else {
        const diff = (j - i + moves.length) % moves.length;

        if (diff <= moves.length / 2) {
          table[moves[i]][moves[j]] = "Win";
        } else {
          table[moves[i]][moves[j]] = "Lose";
        }
      }
    }
  }

  console.table(table);
}

function generateKey() {
  return crypto.randomBytes(32).toString("hex");
}

function calculateHMAC(key, message) {
  const hmac = crypto.createHmac("sha256", key);
  hmac.update(message);
  return hmac.digest("hex");
}

function determineWinner(userMove, computerMove, moves) {
  const movesCount = moves.length;
  const halfMoves = movesCount / 2;
  const userIndex = moves.indexOf(userMove);
  const computerIndex = moves.indexOf(computerMove);

  if (userIndex === -1 || computerIndex === -1) {
    return "Invalid move";
  }

  if (userIndex === computerIndex) {
    return "Draw";
  }

  const diff = (userIndex - computerIndex + movesCount) % movesCount;

  if (diff <= halfMoves) {
    return "User";
  } else {
    return "Computer";
  }
}

function playGame(moves) {
  const key = generateKey();
  const computerMove = moves[Math.floor(Math.random() * moves.length)];
  const hmac = calculateHMAC(key, computerMove);

  console.log(`HMAC: ${hmac}`);
  console.log("Available moves:");
  moves.forEach((move, index) => {
    console.log(`${index + 1} - ${move}`);
  });
  console.log("0 - exit");
  console.log("? - help");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter your move: ", (userInput) => {
    rl.close();

    const isNumber = /^[0-9]*$/.test(userInput);

    if (isNumber && userInput !== "0") {
      const input = parseInt(userInput);

      if (input >= 1 && input <= moves.length) {
        const userMove = moves[input - 1];
        const winner = determineWinner(userMove, computerMove, moves);

        console.log(`Your move: ${userMove}`);
        console.log(`Computer move: ${computerMove}`);

        if (winner === "User") {
          console.log("You win!");
        } else if (winner === "Computer") {
          console.log("Computer wins.");
        } else {
          console.log("It's a draw.");
        }

        console.log(`HMAC key: ${key}`);
      } else {
        console.log("Invalid input. Please enter a valid move.");
      }
    } else if (userInput === "?") {
      generateWinTable(moves);
    }

    console.log("\n==================================\n");

    if (userInput === "0") {
      console.log("Quitting game...");
      console.clear();
    } else {
      playGame(moves);
    }
  });
}

const moves = process.argv.slice(2);

if (
  moves.length < 3 ||
  moves.length % 2 === 0 ||
  new Set(moves).size !== moves.length
) {
  console.error("Invalid input. Please provide an odd number of unique moves.");
} else {
  playGame(moves);
}
