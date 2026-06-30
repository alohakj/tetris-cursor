import { createEmptyBoard } from './board.js';
import { canMove } from './collision.js';
import {
  DROP_INTERVAL_MS,
  clearLines,
  dropPiece,
  scoreForLines,
} from './game.js';
import { CONTROL_KEY_CODES, handleKeyInput } from './input.js';
import { PIECE_TYPES, createPiece } from './pieces.js';
import { paint } from './render.js';

/** @typedef {'idle' | 'playing' | 'gameover'} GameStatus */

/** @type {{ board: (string|null)[][], currentPiece: object|null, score: number, status: GameStatus }} */
const gameState = {
  board: createEmptyBoard(),
  currentPiece: null,
  score: 0,
  status: 'idle',
};

/** @type {number|null} */
let dropAnimationId = null;

/** @type {number} */
let lastDropTime = 0;

/** @type {{ boardElement: HTMLElement, scoreElement: HTMLElement, gameOverElement: HTMLElement, startBtn: HTMLButtonElement, restartBtn: HTMLButtonElement }|null} */
let uiContext = null;

/**
 * 필수 DOM 요소를 가져온다.
 * @param {string} id - 요소 id
 * @returns {HTMLElement}
 */
function getRequiredElement(id) {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`필수 요소를 찾을 수 없습니다: #${id}`);
  }

  return element;
}

/**
 * 점수 표시를 갱신한다.
 * @param {HTMLElement} scoreElement - 점수를 표시할 요소
 * @param {number} score - 현재 점수
 */
function updateScoreDisplay(scoreElement, score) {
  scoreElement.textContent = String(score);
}

/**
 * 게임 오버 오버레이를 표시한다.
 */
function showGameOver() {
  if (uiContext) {
    uiContext.gameOverElement.hidden = false;
    uiContext.gameOverElement.setAttribute('aria-hidden', 'false');
  }
}

/**
 * 게임 오버 오버레이를 숨긴다.
 */
function hideGameOver() {
  if (uiContext) {
    uiContext.gameOverElement.hidden = true;
    uiContext.gameOverElement.setAttribute('aria-hidden', 'true');
  }
}

/**
 * 게임 상태에 맞게 버튼 활성화를 동기화한다.
 * @param {HTMLButtonElement} startBtn - 시작 버튼
 * @param {HTMLButtonElement} restartBtn - 재시작 버튼
 */
function syncUIButtons(startBtn, restartBtn) {
  const isPlaying = gameState.status === 'playing';
  startBtn.disabled = isPlaying || gameState.status === 'gameover';
  restartBtn.disabled = !isPlaying && gameState.status !== 'gameover';
}

/**
 * 랜덤 테트로미노 종류를 고른다.
 * @returns {string} 블록 종류
 */
function pickRandomPieceType() {
  const index = Math.floor(Math.random() * PIECE_TYPES.length);
  return PIECE_TYPES[index];
}

/**
 * 새 블록을 생성해 게임 상태에 반영한다.
 */
function spawnNewPiece() {
  gameState.currentPiece = createPiece(pickRandomPieceType());
}

/**
 * 보드와 점수를 초기 상태로 되돌린다.
 */
function resetBoardState() {
  gameState.board = createEmptyBoard();
  gameState.score = 0;
  spawnNewPiece();
}

/**
 * 현재 게임 상태를 화면에 반영한다.
 */
function renderGame() {
  if (!uiContext) {
    return;
  }

  paint(uiContext.boardElement, gameState.board, gameState.currentPiece);
  updateScoreDisplay(uiContext.scoreElement, gameState.score);
}

/**
 * 자동 낙하 루프를 중지한다.
 */
function stopDropLoop() {
  if (dropAnimationId !== null) {
    cancelAnimationFrame(dropAnimationId);
    dropAnimationId = null;
  }

  lastDropTime = 0;
}

/**
 * 게임 오버 상태로 전환한다.
 */
function triggerGameOver() {
  gameState.currentPiece = null;
  gameState.status = 'gameover';
  stopDropLoop();

  if (uiContext) {
    syncUIButtons(uiContext.startBtn, uiContext.restartBtn);
    showGameOver();
  }
}

/**
 * 스폰 직후 겹침이 있으면 게임 오버로 처리한다.
 * @returns {boolean} 게임을 계속할 수 있으면 true
 */
function ensureSpawnIsValid() {
  if (!gameState.currentPiece) {
    return false;
  }

  if (canMove(gameState.currentPiece, 0, 0, gameState.board)) {
    return true;
  }

  triggerGameOver();
  return false;
}

/**
 * 블록 고정 후 줄 삭제·점수·재스폰을 처리한다.
 */
function handleAfterLock() {
  const clearedLines = clearLines(gameState.board);

  if (clearedLines > 0) {
    gameState.score += scoreForLines(clearedLines);
  }

  spawnNewPiece();
  ensureSpawnIsValid();
}

/**
 * 블록 고정 또는 게임 오버 결과를 처리한다.
 * @param {'locked' | 'gameover'} lockResult - 고정 결과
 */
function handleLockResult(lockResult) {
  if (lockResult === 'gameover') {
    triggerGameOver();
    renderGame();
    return;
  }

  handleAfterLock();
  renderGame();
}

/**
 * 자동 낙하 한 틱을 처리한다.
 */
function handleDropTick() {
  if (gameState.status !== 'playing' || !gameState.currentPiece) {
    return;
  }

  const result = dropPiece(gameState.currentPiece, gameState.board);

  if (result === 'moved') {
    renderGame();
    return;
  }

  handleLockResult(result);
}

/**
 * requestAnimationFrame 기반 자동 낙하 루프
 * @param {number} timestamp - 고해상도 시각
 */
function dropLoop(timestamp) {
  if (gameState.status !== 'playing') {
    return;
  }

  if (!lastDropTime) {
    lastDropTime = timestamp;
  }

  if (timestamp - lastDropTime >= DROP_INTERVAL_MS) {
    lastDropTime = timestamp;
    handleDropTick();
  }

  dropAnimationId = requestAnimationFrame(dropLoop);
}

/**
 * 자동 낙하 루프를 시작한다.
 */
function startDropLoop() {
  stopDropLoop();
  dropAnimationId = requestAnimationFrame(dropLoop);
}

/**
 * 키보드 입력을 처리한다.
 * @param {KeyboardEvent} event - 키보드 이벤트
 */
function onKeyDown(event) {
  if (gameState.status !== 'playing' || !gameState.currentPiece) {
    return;
  }

  if (!CONTROL_KEY_CODES.has(event.code)) {
    return;
  }

  event.preventDefault();

  const result = handleKeyInput(
    event.code,
    gameState.currentPiece,
    gameState.board,
  );

  if (result.type === 'render') {
    renderGame();
    return;
  }

  if (result.type === 'lock' && result.lockResult) {
    handleLockResult(result.lockResult);
  }
}

/**
 * 게임을 시작한다.
 */
function startGame() {
  hideGameOver();
  gameState.status = 'playing';

  if (uiContext) {
    syncUIButtons(uiContext.startBtn, uiContext.restartBtn);
  }

  startDropLoop();
}

/**
 * 게임을 재시작한다.
 */
function restartGame() {
  stopDropLoop();
  hideGameOver();
  resetBoardState();
  gameState.status = 'playing';
  renderGame();

  if (uiContext) {
    syncUIButtons(uiContext.startBtn, uiContext.restartBtn);
  }

  startDropLoop();
}

/**
 * 앱을 초기화하고 이벤트를 연결한다.
 */
function init() {
  const boardElement = getRequiredElement('game-board');
  const scoreElement = getRequiredElement('score');
  const gameOverElement = getRequiredElement('game-over');
  const startBtn = /** @type {HTMLButtonElement} */ (getRequiredElement('start-btn'));
  const restartBtn = /** @type {HTMLButtonElement} */ (getRequiredElement('restart-btn'));

  uiContext = { boardElement, scoreElement, gameOverElement, startBtn, restartBtn };

  gameState.status = 'idle';
  resetBoardState();
  hideGameOver();
  renderGame();
  syncUIButtons(startBtn, restartBtn);

  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', restartGame);
  document.addEventListener('keydown', onKeyDown);
}

init();
