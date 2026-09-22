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

gsap.from([pvpButton, pvcButton], {
  scale: 0,
  duration: 0.8,
  ease: "elastic",
});

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
  gameModeScreen.style.display = "none";
});

pvcButton.addEventListener("click", () => {
  const player1 = new Player("player", "X");
  const player2 = new Player("Computer", "O");
  players.push(player1, player2);
  gameMode = "pvc";
  isGameOver = false;
  gameStatusElement.textContent = players[currentPlayerIndex]?.name + "'s turn";
  gameModeScreen.style.display = "none";
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

    const winner = getWinner();

    if (winner !== null) {
      gameStatusElement.textContent = `${winner.name} won!`;
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
      const winner = getWinner();
      if (winner !== null) {
        gameStatusElement.textContent = `${winner.name} won!`;
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

restartButton.addEventListener("click", () => {
  cells.forEach((cell) => {
    cell.textContent = "";
  });
  currentPlayerIndex = 0;
  gameStatusElement.textContent = players[currentPlayerIndex]?.name + "'s turn";
  isGameOver = false;
});

selectGameModeButton.addEventListener("click", () => {
  cells.forEach((cell) => {
    cell.textContent = "";
  });
  players = [];
  currentPlayerIndex = 0;
  gameMode = undefined;
  isGameOver = true;
  gameStatusElement.textContent = "";
  gameModeScreen.style.display = "flex";
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

function getWinner(): Player | null {
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (
      cells[a]?.textContent !== null &&
      cells[a]?.textContent === cells[b]?.textContent &&
      cells[a]?.textContent === cells[c]?.textContent
    ) {
      let winner: Player | null = null;
      players.forEach((player) => {
        if (player.symbol === cells[a]?.textContent) {
          winner = player;
        }
      });
      return winner;
    }
  }

  return null;
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

/**
 * Minimax algorithm. The computer ("O") is the maximizing player and the
 * human ("X") is the minimizing player. Depth is subtracted from / added to
 * the score so the computer prefers winning as fast as possible and losing
 * as slowly as possible.
 */
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
