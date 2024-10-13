import { cols, rows } from '@constants/board.constants';

export type IColor = 'black' | 'white';

export type IKindPiece =
  | 'pawn'
  | 'tower'
  | 'horse'
  | 'bishop'
  | 'queen'
  | 'king';

export type ICol = (typeof cols)[number];
export type IRow = (typeof rows)[number];

export interface IPiece {
  kind: IKindPiece;
  color: IColor;
}

export interface ICell {
  col: ICol;
  row: IRow;
  piece: null | IPiece;
  color: IColor;
  showMoves: boolean;
  selected: boolean;
}
