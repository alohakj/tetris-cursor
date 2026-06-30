import { COLS, ROWS } from './board.js';
import { canMove } from './collision.js';
import { getPieceAbsoluteCells } from './pieces.js';

/**
 * 블록을 이동할 수 있으면 위치를 갱신한다.
 * @param {{ row: number, col: number, cells: number[][] }} piece - 현재 블록
 * @param {number} dx - 가로 이동량
 * @param {number} dy - 세로 이동량
 * @param {(string|null)[][]} matrix - 고정 블록이 있는 보드
 * @returns {boolean} 이동 성공 여부
 */
export function movePiece(piece, dx, dy, matrix) {
  if (!canMove(piece, dx, dy, matrix)) {
    return false;
  }

  piece.row += dy;
  piece.col += dx;
  return true;
}

/**
 * 셀 좌표를 시계 방향 90도 회전한다.
 * @param {number[][]} cells - 상대 좌표 배열
 * @returns {number[][]} 회전된 상대 좌표
 */
export function rotateCells(cells) {
  const rotated = cells.map(([dr, dc]) => [dc, -dr]);
  const minRow = Math.min(...rotated.map(([row]) => row));
  const minCol = Math.min(...rotated.map(([, col]) => col));

  return rotated.map(([row, col]) => [row - minRow, col - minCol]);
}

/**
 * 블록을 시계 방향으로 회전한다.
 * @param {{ row: number, col: number, cells: number[][] }} piece - 현재 블록
 * @param {(string|null)[][]} matrix - 고정 블록이 있는 보드
 * @returns {boolean} 회전 성공 여부
 */
export function rotatePiece(piece, matrix) {
  const rotatedCells = rotateCells(piece.cells);
  const testPiece = { ...piece, cells: rotatedCells };

  if (!canMove(testPiece, 0, 0, matrix)) {
    return false;
  }

  piece.cells = rotatedCells;
  return true;
}

/**
 * 현재 블록을 보드에 고정한다.
 * @param {(string|null)[][]} matrix - 고정 블록이 있는 보드
 * @param {{ color: string, row: number, col: number, cells: number[][] }} piece - 고정할 블록
 * @returns {boolean} 고정 성공 여부
 */
export function lockPiece(matrix, piece) {
  const absoluteCells = getPieceAbsoluteCells(piece);

  if (absoluteCells.some(([row]) => row < 0)) {
    return false;
  }

  for (const [row, col] of absoluteCells) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
      return false;
    }

    matrix[row][col] = piece.color;
  }

  return true;
}

/**
 * 완성된 가로줄을 제거하고 위 블록을 내린다.
 * @param {(string|null)[][]} matrix - 고정 블록이 있는 보드
 * @returns {number} 제거된 줄 수
 */
export function clearLines(matrix) {
  let clearedCount = 0;

  for (let row = ROWS - 1; row >= 0; row--) {
    if (matrix[row].every((cell) => cell !== null)) {
      matrix.splice(row, 1);
      matrix.unshift(Array(COLS).fill(null));
      clearedCount += 1;
      row += 1;
    }
  }

  return clearedCount;
}

/**
 * 제거한 줄 수에 따른 점수를 계산한다.
 * @param {number} lineCount - 제거한 줄 수
 * @returns {number} 획득 점수
 */
export function scoreForLines(lineCount) {
  const scores = { 1: 100, 2: 300, 3: 500, 4: 800 };
  return scores[lineCount] ?? lineCount * 100;
}

/**
 * 한 칸 아래로 낙하를 시도하고, 막히면 보드에 고정한다.
 * @param {{ row: number, col: number, cells: number[][], color: string }} piece - 현재 블록
 * @param {(string|null)[][]} matrix - 고정 블록이 있는 보드
 * @returns {'moved' | 'locked' | 'gameover'} 낙하 결과
 */
export function dropPiece(piece, matrix) {
  if (movePiece(piece, 0, 1, matrix)) {
    return 'moved';
  }

  if (!lockPiece(matrix, piece)) {
    return 'gameover';
  }

  return 'locked';
}

/**
 * 블록을 바닥까지 즉시 낙하시킨 뒤 고정한다.
 * @param {{ row: number, col: number, cells: number[][], color: string }} piece - 현재 블록
 * @param {(string|null)[][]} matrix - 고정 블록이 있는 보드
 * @returns {'locked' | 'gameover'} 낙하 결과
 */
export function hardDrop(piece, matrix) {
  while (movePiece(piece, 0, 1, matrix)) {
    // 바닥 또는 장애물에 닿을 때까지 반복
  }

  if (!lockPiece(matrix, piece)) {
    return 'gameover';
  }

  return 'locked';
}

/** 블록 자동 낙하 간격(ms) */
export const DROP_INTERVAL_MS = 800;
