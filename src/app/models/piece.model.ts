import { WritableSignal } from '@angular/core';
import {
  ICell,
  IColor,
  IKindPiece,
  IPiece,
  IPosition,
} from '@interfaces/board.types';

export class Piece implements IPiece {
  public kind!: IKindPiece;
  public color!: IColor;
  public board!: WritableSignal<ICell>[][];
  public isMoved?: boolean;

  constructor(data: IPiece | Piece) {
    Object.assign(this, data);
  }

  public movements() {
    const movements = {
      pawn: this._getPawnMovements(),
      tower: this._getTowerMovements(),
      horse: this._getHorseMovements(),
      bishop: this._getBishopMovements(),
      queen: this._getQueenMovements(),
      king: this._getKingMovements(),
    };
    return movements[this.kind];
  }

  private _getPawnMovements(): IPosition[] {
    return [];
  }

  private _getTowerMovements(): IPosition[] {
    return [];
  }

  private _getHorseMovements(): IPosition[] {
    return [];
  }

  private _getBishopMovements(): IPosition[] {
    return [];
  }

  private _getQueenMovements(): IPosition[] {
    return [];
  }

  private _getKingMovements(): IPosition[] {
    return [];
  }

  public onMove() {
    this.isMoved = true;
  }
}
