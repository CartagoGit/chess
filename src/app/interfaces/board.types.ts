import { WritableSignal } from '@angular/core';
import { cols, rows } from '@constants/board.constants';
import { Piece } from '@models/piece.model';

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

export interface IPosition {
  col: ICol;
  row: IRow;
}

export interface IPiece {
  kind: IKindPiece;
  color: IColor;
  board: WritableSignal<ICell>[][];
  isMoved?: boolean;
}

export interface ICell {
  col: ICol;
  row: IRow;
  piece: null | Piece;
  color: IColor;
  showMoves: boolean;
  selected: boolean;
}
