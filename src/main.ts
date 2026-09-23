import { Player } from "./Player";
import gsap from "gsap";

const gameModeScreen = document.querySelector(
  ".game-mode-screen",
) as HTMLDivElement;
const pvpButton = document.querySelector(
  ".player-vs-player",
) as HTMLButtonElement;
const pvcButton = document.querySelector(
  ".player-vs-computer",
) as HTMLButtonElement;
const restartButton = document.querySelector(
  ".restart-button",
) as HTMLButtonElement;
const selectGameModeButton = document.querySelector(
  ".game-mode-selection-button",
) as HTMLButtonElement;
const gameStatusElement = document.querySelector(
  ".game-status",
) as HTMLParagraphElement;
const cells = document.querySelectorAll(".cell") as NodeListOf<HTMLDivElement>;

showGameModeScreen();

let players: Player[] = [];
let currentPlayerIndex: 0 | 1 = 0;
let gameMode: "pvp" | "pvc" | undefined = undefined;
let isGameOver: boolean = true;

pvpButton.addEventListener("click", () => {
  const player1 = new Player("player 1", "X");
  const player2 = new Player("player 2", "O");
  players.push(player1, player2);
  gameMode = "pvp";
  isGameOver = false;
  gameStatusElement.textContent = players[currentPlayerIndex]?.name + "'s turn";
  hideGameModeScreen("pvp");
});

pvcButton.addEventListener("click", () => {
  const player1 = new Player("player", "X");
  const player2 = new Player("Computer", "O");
  players.push(player1, player2);
  gameMode = "pvc";
  isGameOver = false;
  gameStatusElement.textContent = players[currentPlayerIndex]?.name + "'s turn";
  hideGameModeScreen("pvc");
});

cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    if (isGameOver) return;

    if (cell.textContent !== "") return;

    cell.textContent = players[currentPlayerIndex]?.symbol!;

    currentPlayerIndex === 0
      ? (currentPlayerIndex = 1)
      : (currentPlayerIndex = 0);

    gameStatusElement.textContent =
      players[currentPlayerIndex]?.name + "'s turn";

    const { winner, winnerCellsIndices } = getWinner();

    if (winner !== null) {
      gameStatusElement.textContent = `${winner.name} won!`;
      cells.forEach((cell, index) => {
        if (winnerCellsIndices.includes(index)) {
          gsap.to(cell, { backgroundColor: "rgba(180,250,200)" });
        }
      });
      isGameOver = true;
    }

    if (isBoardFull()) {
      if (winner === null) {
        gameStatusElement.textContent = "Its a draw!";
      }
      isGameOver = true;
    }

    if (gameMode === "pvc" && !isGameOver) {
      const bestMoveIndex = getBestMove();
      cells[bestMoveIndex]!.textContent = players[currentPlayerIndex]!.symbol;
      currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
      gameStatusElement.textContent =
        players[currentPlayerIndex]?.name + "'s turn";
      const { winner, winnerCellsIndices } = getWinner();
      if (winner !== null) {
        gameStatusElement.textContent = `${winner.name} won!`;
        cells.forEach((cell, index) => {
          if (winnerCellsIndices.includes(index)) {
            gsap.to(cell, { backgroundColor: "rgba(180,250,200)" });
          }
        });
        isGameOver = true;
      }
      if (isBoardFull()) {
        if (winner === null) {
          gameStatusElement.textContent = "Its a draw!";
        }
        isGameOver = true;
      }
    }
  });
});

restartButton.addEventListener("click", restartCurrentMode);

selectGameModeButton.addEventListener("click", () => {
  resetGame();
  showGameModeScreen();
});

const winningCombinations: Array<[number, number, number]> = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function isBoardFull() {
  const cellsArray = Array.from(cells);
  return cellsArray.every((cell) => cell.textContent !== "");
}

function getWinner(): {
  winner: Player | null;
  winnerCellsIndices: [number, number, number];
} {
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (
      cells[a]?.textContent !== null &&
      cells[a]?.textContent === cells[b]?.textContent &&
      cells[a]?.textContent === cells[c]?.textContent
    ) {
      let winner: Player | null = null;
      let winnerCellsIndices: [number, number, number] = combination;
      players.forEach((player) => {
        if (player.symbol === cells[a]?.textContent) {
          winner = player;
        }
      });

      return { winner, winnerCellsIndices };
    }
  }

  return { winner: null, winnerCellsIndices: [0, 0, 0] };
}

function getBoard(): Array<"X" | "O" | ""> {
  return Array.from(cells).map((cell) =>
    cell.textContent === "X" ? "X" : cell.textContent === "O" ? "O" : "",
  );
}

function checkBoardWinner(
  board: Array<"X" | "O" | "">,
): "X" | "O" | "draw" | null {
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] !== "" && board[a] === board[b] && board[a] === board[c]) {
      return board[a]!;
    }
  }

  return board.every((value) => value !== "") ? "draw" : null;
}

// Minimax algorithm
function minimax(
  board: Array<"X" | "O" | "">,
  isMaximizing: boolean,
  depth: number,
): number {
  const result = checkBoardWinner(board);

  if (result === "O") return 10 - depth;
  if (result === "X") return depth - 10;
  if (result === "draw") return 0;

  let bestScore = isMaximizing ? -Infinity : Infinity;

  board.forEach((value, index) => {
    if (value !== "") return;

    board[index] = isMaximizing ? "O" : "X";
    const score = minimax(board, !isMaximizing, depth + 1);
    board[index] = "";

    if (isMaximizing) {
      bestScore = Math.max(score, bestScore);
    } else {
      bestScore = Math.min(score, bestScore);
    }
  });

  return bestScore;
}

function getBestMove(): number {
  const board = getBoard();
  let bestScore = -Infinity;
  let bestMoveIndex = -1;

  board.forEach((value, index) => {
    if (value !== "") return;

    board[index] = "O";
    const score = minimax(board, false, 0);
    board[index] = "";

    if (score > bestScore) {
      bestScore = score;
      bestMoveIndex = index;
    }
  });

  return bestMoveIndex;
}

function hideGameModeScreen(selectedMode: "pvp" | "pvc") {
  if (selectedMode === "pvp") {
    gsap.to(pvpButton, { scale: 1.05 });
    gsap.to(pvcButton, { y: 100, autoAlpha: 0 });
    gsap.to(gameModeScreen, {
      autoAlpha: 0,
      display: "none",
      delay: 0.8,
    });
  } else {
    gsap.to(pvcButton, { scale: 1.05 });
    gsap.to(pvpButton, { y: 100, autoAlpha: 0 });
    gsap.to(gameModeScreen, {
      autoAlpha: 0,
      display: "none",
      delay: 0.8,
    });
  }
}

function showGameModeScreen() {
  gsap.set([pvpButton, pvcButton], { scale: 0.4, y: 0, autoAlpha: 1 });
  gsap.to([pvpButton, pvcButton], { scale: 1, duration: 0.8, ease: "elastic" });
  gsap.to(gameModeScreen, {
    autoAlpha: 1,
    display: "flex",
  });
}

function resetGame() {
  players = [];
  currentPlayerIndex = 0;
  gameMode = undefined;
  isGameOver = true;
  gsap.killTweensOf(cells);
  cells.forEach((cell) => {
    cell.textContent = "";
    gsap.set(cell, { clearProps: "backgroundColor" });
  });
}

function restartCurrentMode() {
  gsap.killTweensOf(cells);
  cells.forEach((cell) => {
    cell.textContent = "";
    gsap.set(cell, { clearProps: "backgroundColor" });
  });
  currentPlayerIndex = 0;
  gameStatusElement.textContent = players[currentPlayerIndex]?.name + "'s turn";
  isGameOver = false;
}
