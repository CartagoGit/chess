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

export type IActionMove = IPosition & {
  isCastling?: boolean;
  isDoublePawn?: boolean;
};

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
  selected: boolean;
}

export type IMovement = IActionMove & {
  color: IColor;
  piece: IPiece;
  imgSrc: string;
  momentBoard: ICell[][];
};


export type ICheckState = 'check' | 'checkmate' | 'draw' | 'normal';
