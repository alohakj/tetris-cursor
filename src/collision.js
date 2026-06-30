import { COLS, ROWS } from './board.js';

/**
 * 이동 후 블록이 보드 안에 있고 빈 칸만 차지하는지 검사한다.
 * @param {{ row: number, col: number, cells: number[][] }} piece - 현재 블록
 * @param {number} dx - 가로 이동량
 * @param {number} dy - 세로 이동량
 * @param {(string|null)[][]} matrix - 고정 블록이 있는 보드
 * @returns {boolean} 이동 가능 여부
 */
export function canMove(piece, dx, dy, matrix) {
  for (const [dr, dc] of piece.cells) {
    const row = piece.row + dr + dy;
    const col = piece.col + dc + dx;

    if (col < 0 || col >= COLS) {
      return false;
    }

    if (row >= ROWS) {
      return false;
    }

    if (row >= 0 && matrix[row][col] !== null) {
      return false;
    }
  }

  return true;
}
