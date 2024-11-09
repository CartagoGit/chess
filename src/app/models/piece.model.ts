import { computed, inject, Signal, WritableSignal } from '@angular/core';
import { cols, rows } from '@constants/board.constants';
import {
  IActionMove,
  ICell,
  IColor,
  IKindPiece,
  IPiece,
  IPosition,
} from '@interfaces/board.types';
import { StateService } from '@services/state.service';

export class Piece implements IPiece {
  // ANCHOR : Propierties
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

  private _stateSvc = inject(StateService);

  public isMoved?: boolean;

  // ANCHOR : Constructor

  constructor(data: IPiece | Piece) {
    Object.assign(this, data);
  }

  // ANCHOR : Methods
  public movements(): IActionMove[] {
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

  // Devuelve las amenazas de cada pieza
  public threats(): IPosition[] {
    const threats = {
      pawn: () => this._getPawnThreats(),
      tower: () => this._getTowerMovements({ isThreat: true }),
      horse: () => this._getHorseMovements({ isThreat: true }),
      bishop: () => this._getBishopMovements({ isThreat: true }),
      queen: () => this._getQueenMovements({ isThreat: true }),
      king: () => this._getKingMovements({ isThreat: true }),
    };
    return threats[this.kind]();
  }

  private _getPawnMovements(): IPosition[] {
    let positions: IActionMove[] = [];
    const position = this.position();
    if (!position) return [];
    const { col, row } = position;
    const isWhite = this.color === 'white';
    const direction = isWhite ? 1 : -1;
    const isInitialPosition = isWhite ? row === '2' : row === '7';
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
      positions.push({ ...newPosition, isDoublePawn: i === 2 });
    }

    // 3. Capture a piece
    const threats = this._getPawnThreats({ checkOpponent: true });
    positions.push(...threats);

    // 4. Capture in passant
    // TODO
    // REVIEW

    // Finally remove positions where there is a piece of the same color

    return positions;
  }

  // Comprueba las amenazas de un peón
  private _getPawnThreats(options?: { checkOpponent: boolean }): IActionMove[] {
    const { checkOpponent = false } = options || {};
    const position = this.position();
    if (!position) return [];
    const { col, row } = position;
    const leftCol = cols[cols.indexOf(col) - 1];
    const rightCol = cols[cols.indexOf(col) + 1];
    const isWhite = this.color === 'white';
    const direction = isWhite ? 1 : -1;
    const nextRow = rows.indexOf(row) + direction;
    const positions: IActionMove[] = [];
    for (let col of [leftCol, rightCol]) {
      if (!col) continue;
      if (checkOpponent) {
        const hasOpponent = this._hasOpponentPiece({ col, row: rows[nextRow] });
        // REVIEW - Check if the last movement was a double pawn movement
        const hasPassantPawn = this._stateSvc.movements().at(-1)?.isDoublePawn;
        if (hasOpponent) {
          positions.push({ col, row: rows[nextRow] });
        }
      } else positions.push({ col, row: rows[nextRow] });
    }
    return positions;
  }

  private _getTowerMovements(options?: { isThreat: boolean }): IActionMove[] {
    const { isThreat = false } = options || {};
    let positions: IPosition[] = [];
    const position = this.position();
    if (!position) return [];
    const { col, row } = position;

    // Possibilities in tower
    // 1. Move up
    for (let i = rows.indexOf(row) + 1; i < rows.length; i++) {
      const newPosition = { col, row: rows[i] };
      if (
        this._isBreakIterableOrAssignPosition({
          positions,
          newPosition,
          checkSameColorPiece: !isThreat,
        })
      )
        break;
    }
    // 2. Move right
    for (let i = cols.indexOf(col) + 1; i < cols.length; i++) {
      const newPosition = { col: cols[i], row };
      if (
        this._isBreakIterableOrAssignPosition({
          positions,
          newPosition,
          checkSameColorPiece: !isThreat,
        })
      )
        break;
    }
    // 3. Move down
    for (let i = rows.indexOf(row) - 1; i >= 0; i--) {
      const newPosition = { col, row: rows[i] };
      if (
        this._isBreakIterableOrAssignPosition({
          positions,
          newPosition,
          checkSameColorPiece: !isThreat,
        })
      )
        break;
    }
    // 4. Move left
    for (let i = cols.indexOf(col) - 1; i >= 0; i--) {
      const newPosition = { col: cols[i], row };
      if (
        this._isBreakIterableOrAssignPosition({
          positions,
          newPosition,
          checkSameColorPiece: !isThreat,
        })
      )
        break;
    }
    return positions;
  }

  private _getHorseMovements(options?: { isThreat: boolean }): IActionMove[] {
    const { isThreat = false } = options || {};
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
      this._isBreakIterableOrAssignPosition({
        positions,
        newPosition,
        checkSameColorPiece: !isThreat,
      });
    }
    return positions;
  }

  private _getBishopMovements(options?: { isThreat: boolean }): IActionMove[] {
    const { isThreat = false } = options || {};
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
      if (
        this._isBreakIterableOrAssignPosition({
          positions,
          newPosition,
          checkSameColorPiece: !isThreat,
        })
      )
        break;
    }
    // 2. Move up-right
    for (
      let i = rows.indexOf(row) + 1, j = cols.indexOf(col) + 1;
      i < rows.length;
      i++, j++
    ) {
      const newPosition = { col: cols[j], row: rows[i] };
      if (
        this._isBreakIterableOrAssignPosition({
          positions,
          newPosition,
          checkSameColorPiece: !isThreat,
        })
      )
        break;
    }
    // 3. Move down-right
    for (
      let i = rows.indexOf(row) - 1, j = cols.indexOf(col) + 1;
      i < rows.length;
      i--, j++
    ) {
      const newPosition = { col: cols[j], row: rows[i] };
      if (
        this._isBreakIterableOrAssignPosition({
          positions,
          newPosition,
          checkSameColorPiece: !isThreat,
        })
      )
        break;
    }
    // 4. Move down-left
    for (
      let i = rows.indexOf(row) - 1, j = cols.indexOf(col) - 1;
      i < rows.length;
      i--, j--
    ) {
      const newPosition = { col: cols[j], row: rows[i] };
      if (
        this._isBreakIterableOrAssignPosition({
          positions,
          newPosition,
          checkSameColorPiece: !isThreat,
        })
      )
        break;
    }
    return positions;
  }

  private _getQueenMovements(options?: { isThreat: boolean }): IActionMove[] {
    const { isThreat = false } = options || {};
    const positions = [
      ...this._getTowerMovements({ isThreat }),
      ...this._getBishopMovements({ isThreat }),
    ];
    return positions;
  }

  private _getKingMovements(options?: { isThreat: boolean }): IActionMove[] {
    const { isThreat = false } = options || {};
    let positions: IActionMove[] = [];
    const position = this.position();
    if (!position) return [];
    const { col, row } = position;

    // Possibilities in King
    const possibilities: IActionMove[] = [
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
      this._isBreakIterableOrAssignPosition({
        positions,
        newPosition,
        checkSameColorPiece: !isThreat,
      });
    }

    // 2. Castling
    const isWhite = this.color === 'white';
    if (!this.isMoved) {
      // 2.1. Short castling
      const towerShort = this.board[isWhite ? 0 : 7][7]().piece;
      if (towerShort && !towerShort.isMoved) {
        const cellsBetween = this.board[isWhite ? 0 : 7].slice(5, 7);
        const areThereSomePiecesBetween = cellsBetween.some(
          (cell) => cell().piece,
        );
        if (!areThereSomePiecesBetween) {
          positions.push({
            col: cols[cols.indexOf(col) + 2],
            row,
            isCastling: true,
          });
        }
      }
      // 2.2 Long castling
      const towerLong = this.board[isWhite ? 0 : 7][0]().piece;
      if (towerLong && !towerLong.isMoved) {
        const cellsBetween = this.board[isWhite ? 0 : 7].slice(1, 4);
        const areThereSomePiecesBetween = cellsBetween.some(
          (cell) => cell().piece,
        );
        if (!areThereSomePiecesBetween) {
          positions.push({
            col: cols[cols.indexOf(col) - 2],
            row,
            isCastling: true,
          });
        }
      }
    }

    return positions;
  }

  // Marca la pieza como movida
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

  // Comprueba si una posición tiene una pieza del mismo color
  private _hasSameColorPiece(position: IPosition): boolean {
    const { col, row } = position;
    const cell = this.board[rows.indexOf(row)]?.[cols.indexOf(col)];
    if (!cell?.().piece) return false;
    return cell().piece?.color === this.color;
  }

  // Comprueba si una posicion está fuera del tablero
  private _isOutOfBoard(position: IPosition): boolean {
    const { col, row } = position;
    return !cols.includes(col) || !rows.includes(row);
  }

  // Funcion to refactor same code, check the position in direction, if is the same color return true, if is opponent return true and add the position to the array
  private _isBreakIterableOrAssignPosition(data: {
    positions: IPosition[];
    newPosition: IPosition;
    checkSameColorPiece?: boolean;
  }): boolean {
    const { positions, newPosition, checkSameColorPiece = true } = data;

    if (
      this._isOutOfBoard(newPosition) ||
      // Si estamos checkeando el movimiento, no añadimos la posición ya que
      // no se puede mover a una posición donde hay una pieza del mismo color
      (checkSameColorPiece && this._hasSameColorPiece(newPosition))
    )
      return true;
    if (
      this._hasOpponentPiece(newPosition) ||
      // Si no estamos checkeando el color de la pieza, añadimos la posición
      // ya que en dicho caso una pieza si que puede amenazar esa posición
      (!checkSameColorPiece && this._hasSameColorPiece(newPosition))
    ) {
      positions.push(newPosition);
      return true;
    }
    positions.push(newPosition);
    return false;
  }
}
