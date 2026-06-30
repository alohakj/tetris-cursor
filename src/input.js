import { dropPiece, hardDrop, movePiece, rotatePiece } from './game.js';

/**
 * 키 입력에 따라 블록을 조작한다.
 * @param {string} keyCode - KeyboardEvent.code 값
 * @param {{ row: number, col: number, cells: number[][], color: string }} piece - 현재 블록
 * @param {(string|null)[][]} matrix - 고정 블록이 있는 보드
 * @returns {{ type: 'render' | 'lock' | 'none', lockResult?: 'locked' | 'gameover' }} 처리 결과
 */
export function handleKeyInput(keyCode, piece, matrix) {
  switch (keyCode) {
    case 'ArrowLeft':
      return { type: movePiece(piece, -1, 0, matrix) ? 'render' : 'none' };
    case 'ArrowRight':
      return { type: movePiece(piece, 1, 0, matrix) ? 'render' : 'none' };
    case 'ArrowDown': {
      const result = dropPiece(piece, matrix);
      if (result === 'moved') {
        return { type: 'render' };
      }
      return { type: 'lock', lockResult: result };
    }
    case 'ArrowUp':
      return { type: rotatePiece(piece, matrix) ? 'render' : 'none' };
    case 'Space': {
      const result = hardDrop(piece, matrix);
      return { type: 'lock', lockResult: result };
    }
    default:
      return { type: 'none' };
  }
}

/** 조작에 사용하는 키 목록 */
export const CONTROL_KEY_CODES = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowDown',
  'ArrowUp',
  'Space',
]);
