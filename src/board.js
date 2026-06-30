/** 테트리스 보드 가로 칸 수 */
export const COLS = 10;

/** 테트리스 보드 세로 칸 수 */
export const ROWS = 20;

/** 보드 한 칸의 픽셀 크기 */
export const CELL_SIZE = 30;

/**
 * 2차원 배열로 빈 보드를 만든다.
 * @returns {(string|null)[][]} null로 채워진 보드
 */
export function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}
