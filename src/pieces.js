/** 테트로미노 종류 목록 */
export const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

/**
 * 테트로미노 정의
 * cells: 블록 기준점(row, col)으로부터의 상대 좌표 [dr, dc]
 */
export const TETROMINOES = {
  I: {
    color: '#00f0f0',
    cells: [[0, 0], [0, 1], [0, 2], [0, 3]],
  },
  O: {
    color: '#f0f000',
    cells: [[0, 0], [0, 1], [1, 0], [1, 1]],
  },
  T: {
    color: '#a000f0',
    cells: [[0, 1], [1, 0], [1, 1], [1, 2]],
  },
  S: {
    color: '#00f000',
    cells: [[0, 1], [0, 2], [1, 0], [1, 1]],
  },
  Z: {
    color: '#f00000',
    cells: [[0, 0], [0, 1], [1, 1], [1, 2]],
  },
  J: {
    color: '#0000f0',
    cells: [[0, 0], [1, 0], [1, 1], [1, 2]],
  },
  L: {
    color: '#f0a000',
    cells: [[0, 2], [1, 0], [1, 1], [1, 2]],
  },
};

/** 기본 스폰 위치 */
const DEFAULT_SPAWN = { row: 0, col: 3 };

/** 블록 종류별 예외 스폰 위치 */
const SPAWN_OVERRIDES = {
  O: { row: 0, col: 4 },
};

/**
 * 블록 종류에 맞는 스폰 위치를 반환한다.
 * @param {string} type - 블록 종류
 * @returns {{ row: number, col: number }}
 */
function getSpawnPosition(type) {
  return SPAWN_OVERRIDES[type] ?? DEFAULT_SPAWN;
}

/**
 * 지정한 종류의 테트로미노를 생성한다.
 * @param {string} type - 블록 종류 (I, O, T, S, Z, J, L)
 * @returns {{ type: string, row: number, col: number, cells: number[][], color: string }}
 */
export function createPiece(type) {
  const definition = TETROMINOES[type];

  if (!definition) {
    throw new Error(`알 수 없는 블록 종류: ${type}`);
  }

  const spawn = getSpawnPosition(type);

  return {
    type,
    row: spawn.row,
    col: spawn.col,
    cells: definition.cells.map(([dr, dc]) => [dr, dc]),
    color: definition.color,
  };
}

/**
 * 블록의 절대 보드 좌표를 반환한다.
 * @param {{ row: number, col: number, cells: number[][] }} piece - 현재 블록
 * @returns {number[][]} [row, col] 좌표 배열
 */
export function getPieceAbsoluteCells(piece) {
  return piece.cells.map(([dr, dc]) => [piece.row + dr, piece.col + dc]);
}
