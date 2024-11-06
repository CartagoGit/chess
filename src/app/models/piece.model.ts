import { computed, Signal, WritableSignal } from '@angular/core';
import { cols, rows } from '@constants/board.constants';
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
    console.log('Movements', this.kind);
    const movements = {
      pawn: () => this._getPawnMovements(),
      tower: () => this._getTowerMovements(),
      horse: () => this._getHorseMovements(),
      bishop: () => this._getBishopMovements(),
      queen: () => this._getQueenMovements(),
      king: () => this._getKingMovements(),
    };
    return movements[this.kind]();
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
      const newPosition = { col, row: rows[next] };
      if (
        this._hasOpponentPiece(newPosition) ||
        this._hasSameColorPiece(newPosition)
      )
        break;
      if (i === 2 && !isInitialPosition) break;
      positions.push(newPosition);
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

    // Finally remove positions where there is a piece of the same color

    return positions;
  }

  private _getTowerMovements(): IPosition[] {
    let positions: IPosition[] = [];
    const position = this.position();
    if (!position) return [];
    const { col, row } = position;

    // Possibilities in tower
    // 1. Move up
    for (let i = rows.indexOf(row) + 1; i < rows.length; i++) {
      const newPosition = { col, row: rows[i] };
      if (this._isBreakIterableOrAssignPosition({ positions, newPosition }))
        break;
    }
    // 2. Move right
    for (let i = cols.indexOf(col) + 1; i < cols.length; i++) {
      const newPosition = { col: cols[i], row };
      if (this._isBreakIterableOrAssignPosition({ positions, newPosition }))
        break;
    }
    // 3. Move down
    for (let i = rows.indexOf(row) - 1; i >= 0; i--) {
      const newPosition = { col, row: rows[i] };
      if (this._isBreakIterableOrAssignPosition({ positions, newPosition }))
        break;
    }
    // 4. Move left
    for (let i = cols.indexOf(col) - 1; i >= 0; i--) {
      const newPosition = { col: cols[i], row };
      if (this._isBreakIterableOrAssignPosition({ positions, newPosition }))
        break;
    }
    return positions;
  }

  private _getHorseMovements(): IPosition[] {
    let positions: IPosition[] = [];
    const position = this.position();
    if (!position) return [];
    const { col, row } = position;

    // Possibilities in horse
    const possibilities = [
      { col: cols[cols.indexOf(col) + 2], row: rows[rows.indexOf(row) + 1] },
      { col: cols[cols.indexOf(col) + 2], row: rows[rows.indexOf(row) - 1] },
      { col: cols[cols.indexOf(col) - 2], row: rows[rows.indexOf(row) + 1] },
      { col: cols[cols.indexOf(col) - 2], row: rows[rows.indexOf(row) - 1] },
      { col: cols[cols.indexOf(col) + 1], row: rows[rows.indexOf(row) + 2] },
      { col: cols[cols.indexOf(col) + 1], row: rows[rows.indexOf(row) - 2] },
      { col: cols[cols.indexOf(col) - 1], row: rows[rows.indexOf(row) + 2] },
      { col: cols[cols.indexOf(col) - 1], row: rows[rows.indexOf(row) - 2] },
    ];

    for (let newPosition of possibilities) {
      this._isBreakIterableOrAssignPosition({ positions, newPosition });
    }

    console.log('HORSE', { positions });
    return positions;
  }

  private _getBishopMovements(): IPosition[] {
    let positions: IPosition[] = [];
    const position = this.position();
    if (!position) return [];
    const { col, row } = position;

    // Possibilities in Bishop
    // 1. Move up-left
    for (
      let i = rows.indexOf(row) + 1, j = cols.indexOf(col) - 1;
      i < rows.length;
      i++, j--
    ) {
      const newPosition = { col: cols[j], row: rows[i] };
      if (this._isBreakIterableOrAssignPosition({ positions, newPosition }))
        break;
    }
    // 2. Move up-right
    for (
      let i = rows.indexOf(row) + 1, j = cols.indexOf(col) + 1;
      i < rows.length;
      i++, j++
    ) {
      const newPosition = { col: cols[j], row: rows[i] };
      if (this._isBreakIterableOrAssignPosition({ positions, newPosition }))
        break;
    }
    // 3. Move down-right
    for (
      let i = rows.indexOf(row) - 1, j = cols.indexOf(col) + 1;
      i < rows.length;
      i--, j++
    ) {
      const newPosition = { col: cols[j], row: rows[i] };
      if (this._isBreakIterableOrAssignPosition({ positions, newPosition }))
        break;
    }
    // 4. Move down-left
    for (
      let i = rows.indexOf(row) - 1, j = cols.indexOf(col) - 1;
      i < rows.length;
      i--, j--
    ) {
      const newPosition = { col: cols[j], row: rows[i] };
      if (this._isBreakIterableOrAssignPosition({ positions, newPosition }))
        break;
    }
    console.log('BISHOP', { positions });
    return positions;
  }

  private _getQueenMovements(): IPosition[] {
    const positions = [
      ...this._getTowerMovements(),
      ...this._getBishopMovements(),
    ];
    console.log('QUEEN', { positions });
    return positions;
  }

  private _getKingMovements(): IPosition[] {
    let positions: IPosition[] = [];
    const position = this.position();
    if (!position) return [];
    const { col, row } = position;

    // Possibilities in King
    const possibilities = [
      { col: cols[cols.indexOf(col) + 1], row: rows[rows.indexOf(row) + 1] },
      { col: cols[cols.indexOf(col) + 1], row },
      { col: cols[cols.indexOf(col) + 1], row: rows[rows.indexOf(row) - 1] },
      { col, row: rows[rows.indexOf(row) + 1] },
      { col, row: rows[rows.indexOf(row) - 1] },
      { col: cols[cols.indexOf(col) - 1], row: rows[rows.indexOf(row) + 1] },
      { col: cols[cols.indexOf(col) - 1], row },
      { col: cols[cols.indexOf(col) - 1], row: rows[rows.indexOf(row) - 1] },
    ];

    for (let newPosition of possibilities) {
      this._isBreakIterableOrAssignPosition({ positions, newPosition });
    }
    console.log('KING', { positions, _enemyMovements: this._enemyMovements() });

    // REVIEW Enrroque corto y largo
    // 2. Castling
    const isWhite = this.color === 'white';
    if (!this.isMoved) {
      // 2.1. Short castling
      // TODO Chequear que no haya piezas amenazando el camino
      const towerShort = this.board[isWhite ? 0 : 7][7]().piece;
      if (towerShort && !towerShort.isMoved) {
        const cellsBetween = this.board[isWhite ? 0 : 7].slice(5, 7);
        const areThereSomePiecesBetween = cellsBetween.some(
          (cell) => cell().piece,
        );
        if (!areThereSomePiecesBetween) {
          positions.push({ col: cols[cols.indexOf(col) + 2], row });
        }
      }
      // 2.2 Long castling
      // TODO Chequear que no haya piezas amenazando el camino
      const towerLong = this.board[isWhite ? 0 : 7][0]().piece;
      if (towerLong && !towerLong.isMoved) {
        const cellsBetween = this.board[isWhite ? 0 : 7].slice(1, 4);
        const areThereSomePiecesBetween = cellsBetween.some(
          (cell) => cell().piece,
        );
        if (!areThereSomePiecesBetween) {
          positions.push({ col: cols[cols.indexOf(col) - 2], row });
        }
      }
    }
    // TODO
    // REVIEW sitios donde el rey no puede moverse por jaque

    return positions;
  }

  public onMove() {
    this.isMoved = true;
  }

  // Check if there is a opponent piece in the position
  private _hasOpponentPiece(position: IPosition): boolean {
    const { col, row } = position;
    const cell = this.board[rows.indexOf(row)]?.[cols.indexOf(col)];
    if (!cell?.().piece) return false;
    return cell().piece?.color !== this.color;
  }

  private _hasSameColorPiece(position: IPosition): boolean {
    const { col, row } = position;
    const cell = this.board[rows.indexOf(row)]?.[cols.indexOf(col)];
    if (!cell?.().piece) return false;
    return cell().piece?.color === this.color;
  }

  private _isOutOfBoard(position: IPosition): boolean {
    const { col, row } = position;
    return !cols.includes(col) || !rows.includes(row);
  }

  // Funcion to refactor same code, check the position in direction, if is the same color return true, if is opponent return true and add the position to the array
  private _isBreakIterableOrAssignPosition(data: {
    positions: IPosition[];
    newPosition: IPosition;
  }): boolean {
    const { positions, newPosition } = data;

    if (this._isOutOfBoard(newPosition) || this._hasSameColorPiece(newPosition))
      return true;
    if (this._hasOpponentPiece(newPosition)) {
      positions.push(newPosition);
      return true;
    }
    positions.push(newPosition);
    return false;
  }

  // // Comprueba si es posible que el rey se mueva a la posición sin ser amenazado
  // private _checkKingMovementIsSafe(position: IPosition): boolean {
  //   if (this.kind !== 'king') return true;
  //   const enemyMovements = this._enemyMovements();
  //   return !enemyMovements[`${position.col}${position.row}`];
  // }

  // Metodo que recupera los movimientos posibles de las piezas enemigas
  private _enemyMovements(): Record<string, boolean> {
    const enemyColor = this.color === 'white' ? 'black' : 'white';
    const result: Record<string, boolean> = {};
    console.log(this.board.flat());
    for (let cell$ of this.board.flat()) {
      const cell = cell$();
      if (!cell.piece || cell.piece.color !== enemyColor) continue;
      const piece = cell.piece!;

      piece.movements().forEach((movement) => {
        result[`${movement.col}${movement.row}`] = true;
      });
    }
    return result;
  }
}
