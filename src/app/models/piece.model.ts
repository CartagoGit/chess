import { computed, Signal, WritableSignal } from '@angular/core';
import { cols, rows } from '@constants/board.constants';
import {
  ICell,
  ICol,
  IColor,
  IKindPiece,
  IPiece,
  IPosition,
  IRow,
} from '@interfaces/board.types';

export class Piece implements IPiece {
  public kind!: IKindPiece;
  public color!: IColor;
  public board!: WritableSignal<ICell>[][];
  public pieceCell = computed(() =>
    this.board
      .find((row) => row.find((cell) => cell().piece === this))
      ?.find((cell) => cell().piece === this)!(),
  );
  public position: Signal<IPosition | undefined> = computed(() => {
    const cell = this.pieceCell();
    if (!cell) return;
    const { col, row } = cell;
    return { col, row };
  });

  public isMoved?: boolean;

  constructor(data: IPiece | Piece) {
    Object.assign(this, data);
  }

  public movements(): IPosition[] {
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
    let positions: IPosition[] = [];
    const position = this.position();
    if (!position) return [];
    const { col, row } = position;
    const isWhite = this.color === 'white';
    const isInitialPosition = isWhite ? row === '2' : row === '7';
    const direction = isWhite ? 1 : -1;
    // Chekc if nex row is out of table
    const nextRow = rows.indexOf(row) + direction;
    if (!rows[nextRow]) return [];

    // Possibilities in pawn
    // 1. Move one cell forward
    // 2. Move two cells forward in initial position
    for (let i = 1; i <= 2; i++) {
      const next = rows.indexOf(row) + direction * i;
      if (this._hasOpponentPiece({ col, row: rows[next] })) break;
      if (i === 2 && !isInitialPosition) break;
      positions.push({ col, row: rows[next] });
    }

    // 3. Capture a piece
    const leftCol = cols[cols.indexOf(col) - 1];
    const rightCol = cols[cols.indexOf(col) + 1];
    for (let col of [leftCol, rightCol]) {
      if (!col) continue;
      if (this._hasOpponentPiece({ col, row: rows[nextRow] })) {
        positions.push({ col, row: rows[nextRow] });
      }
    }

    // 4. Capture in passant
    // TODO
    // REVIEW

    return positions;
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

  // Check if there is a opponent piece in the position
  private _hasOpponentPiece(position: IPosition): boolean {
    const { col, row } = position;
    const cell = this.board[rows.indexOf(row)][cols.indexOf(col)];
    console.log({
      result: cell().piece?.color !== this.color,
      cellColor: cell().piece?.color,
      pieceColor: this.color,
    });
    if (!cell().piece) return false;
    return cell().piece?.color !== this.color;
  }
}
