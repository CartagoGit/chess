import { IColor, IKindPiece, IPiece, IPosition } from '@interfaces/board.types';

export class Piece implements IPiece {
  public kind!: IKindPiece;
  public color!: IColor;
  public isMoved?: boolean;

  constructor(data: IPiece | Piece) {
    Object.assign(this, data);
  }

  public movements() {
    switch (this.kind) {
      case 'pawn':
        return this._getPawnMovements();
      case 'tower':
        return this._getTowerMovements();
      case 'horse':
        return this._getHorseMovements();
      case 'bishop':
        return this._getBishopMovements();
      case 'queen':
        return this._getQueenMovements();
      case 'king':
        return this._getKingMovements();
    }
  }

  private _getPawnMovements() {
    return [];
  }

  private _getTowerMovements() {
    return [];
  }

  private _getHorseMovements() {
    return [];
  }

  private _getBishopMovements() {
    return [];
  }

  private _getQueenMovements() {
    return [];
  }

  private _getKingMovements() {
    return [];
  }

  public onMove() {
    this.isMoved = true;
  }
}
