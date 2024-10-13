import { IColor, IKindPiece, IPiece } from '@interfaces/board.types';

export class Piece implements IPiece {
  public kind: IKindPiece;
  public color: IColor;
  public isMoved?: boolean;

  constructor(data: IPiece) {
    const { kind, color, isMoved } = data;
    this.kind = kind;
    this.color = color;
    this.isMoved = isMoved;
  }

  public getMovements(kindPiece: IKindPiece) {
    switch (kindPiece) {
      case 'pawn':
        return this.getPawnMovements();
      case 'tower':
        return this.getTowerMovements();
      case 'horse':
        return this.getHorseMovements();
      case 'bishop':
        return this.getBishopMovements();
      case 'queen':
        return this.getQueenMovements();
      case 'king':
        return this.getKingMovements();
    }
  }

  private getPawnMovements() {
    return [];
  }

  private getTowerMovements() {
    return [];
  }

  private getHorseMovements() {
    return [];
  }

  private getBishopMovements() {
    return [];
  }

  private getQueenMovements() {
    return [];
  }

  private getKingMovements() {
    return [];
  }
}
