import { COLS, ROWS } from './board.js';
import { getPieceAbsoluteCells } from './pieces.js';

/**
 * 고정 보드와 현재 블록을 합쳐 표시용 보드를 만든다.
 * DOM을 변경하지 않으며, 렌더링 전 데이터 합성 단계이다.
 * @param {(string|null)[][]} board - 고정된 블록이 있는 보드
 * @param {{ row: number, col: number, cells: number[][], color: string }|null} piece - 현재 블록
 * @returns {(string|null)[][]} 렌더링용 보드
 */
export function drawPiece(board, piece) {
  const display = board.map((row) => [...row]);

  if (!piece) {
    return display;
  }

  for (const [row, col] of getPieceAbsoluteCells(piece)) {
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      display[row][col] = piece.color;
    }
  }

  return display;
}

/**
 * CSS Grid 보드를 DOM에 렌더링한다.
 * @param {HTMLElement} container - 보드 컨테이너 요소
 * @param {(string|null)[][]} displayBoard - 표시할 보드 상태
 */
export function renderBoard(container, displayBoard) {
  if (!container.dataset.initialized) {
    container.style.setProperty('--board-cols', String(COLS));
    container.style.setProperty('--board-rows', String(ROWS));
    container.replaceChildren();

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = String(row);
        cell.dataset.col = String(col);
        container.appendChild(cell);
      }
    }

    container.dataset.initialized = 'true';
  }

  const cells = container.querySelectorAll('.cell');

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = cells[row * COLS + col];
      const color = displayBoard[row][col];

      if (color) {
        cell.classList.add('cell--filled');
        cell.style.setProperty('--cell-color', color);
      } else {
        cell.classList.remove('cell--filled');
        cell.style.removeProperty('--cell-color');
      }
    }
  }
}

/**
 * 보드 상태를 화면에 반영한다.
 * @param {HTMLElement} container - 보드 컨테이너 요소
 * @param {(string|null)[][]} board - 고정 블록 보드
 * @param {{ type: string, row: number, col: number, cells: number[][], color: string }|null} piece - 현재 블록
 */
export function paint(container, board, piece) {
  const displayBoard = drawPiece(board, piece);
  renderBoard(container, displayBoard);
}
