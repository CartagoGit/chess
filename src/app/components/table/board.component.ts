import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  WritableSignal,
} from '@angular/core';
import { PieceComponent } from '@components/piece/piece.component';
import { ICell, IColor, IKindPiece } from '@interfaces/board.types';
import { Piece } from '@models/piece.model';
import { HasPositionInArrayPipe } from '@pipes/hasPositionInArray.pipe';
import { StateService } from '@services/state.service';
import { Subscription } from 'rxjs';
import { cols, rows } from 'src/app/constants/board.constants';

@Component({
  selector: 'chess-board',
  standalone: true,
  imports: [CommonModule, PieceComponent, HasPositionInArrayPipe],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent {
  // ANCHOR Propierties
  public board: WritableSignal<ICell>[][] = Array.from(
    { length: 8 },
    (_val, row) => {
      return Array.from({ length: 8 }, (_val, col) => {
        const cell: ICell = {
          col: cols[col],
          row: rows[row],
          piece: null,
          color: (row + col) % 2 === 0 ? 'black' : 'white',
          selected: false,
        };
        return signal(cell);
      });
    },
  );

  private _initBoard: ICell[][] = [];

  public selectedMovement = computed(() => this._stateSvc.selectedMovement());

  public selectedCell = computed(() => {
    return this.board.flat().find((cell) => cell().selected);
  });

  public selectedPiece = computed(() => {
    const cell = this.selectedCell();
    return cell?.().piece;
  });

  // Chequea si es el turno de la pieza seleccionada
  public isTurnPiece = computed(() => {
    const selectedPiece = this.selectedPiece();
    if (!selectedPiece) return false;
    const turnColor: IColor = this._stateSvc.isTurnWhite() ? 'white' : 'black';
    return selectedPiece.color === turnColor;
  });

  // Desde que perspectiva se verá el tablero. Desde la perspectiva de las piezas negras o de las blancas. En principio será la del color del jugador, pero podría cambiar
  public boardPerspectiveColor = signal<IColor>('white');

  public boardPerspective = computed(() => {
    return this.boardPerspectiveColor() === 'white'
      ? [...this.board].reverse()
      : this.board;
  });

  // Movimientos posibles de la pieza seleccionada, filtrando las posibles amenazas
  public possiblePositionsMoves = computed(() => {
    const selectedPiece = this.selectedPiece();
    if (!selectedPiece) return [];
    if (selectedPiece.kind === 'king') {
      // En el caso del rey hay que comprobar si hay piezas que amenazando las posiciones posibles
      const enemyThreats = this._getEnemyThreats(selectedPiece.color);
      const kingMoves = selectedPiece.movements();
      return kingMoves.filter((move) => {
        // !enemyThreats[`${move.col}${move.row}`]
        const hasThreat = !!enemyThreats[`${move.col}${move.row}`];
        if (hasThreat) return false;

        // Check Castling Moves
        const isCastling = move.isCastling;
        if (!isCastling) return true;

        // Calculate possible Castling
        const isWhitePiece = selectedPiece.color === 'white';
        const isShortCastling = cols.indexOf(move.col) === 6;
        const towerCols = isShortCastling ? [4, 7] : [1, 5];
        const cellsBetween = this.board[isWhitePiece ? 0 : 7].slice(
          ...towerCols,
        );
        const hasCastlingThreated = cellsBetween.some((cell$) => {
          const cell = cell$();
          return !!enemyThreats[`${cell.col}${cell.row}`];
        });
        return !hasCastlingThreated;
      });
    }
    return selectedPiece.movements();
  });

  private _subscriptions: Subscription[] = [];

  // ANCHOR Constructor
  constructor(private _stateSvc: StateService) {
    this.createBoard();
    this._makeSubscriptions();
    // this._testHighlihtAndSelect();
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((sub) => !sub?.closed && sub.unsubscribe());
  }

  // ANCHOR Methods
  private _makeSubscriptions(): void {
    const subNewMatch = this._stateSvc.newMatch$.subscribe(() =>
      this.newMatch(),
    );
    const subSetBoard = this._stateSvc.setBoard$.subscribe((newBoard) =>
      this.setBoard(newBoard),
    );
    this._subscriptions.push(subNewMatch);
  }

  // private _testHighlihtAndSelect() {
  //   this.board[4][2].update((value) => {
  //     return {
  //       ...value,
  //       piece: new Piece({
  //         kind: 'tower',
  //         color: 'black',
  //         board: this.board,
  //       }),
  //     };
  //   });
  //   this.board[4][3].update((value) => {
  //     return {
  //       ...value,
  //       piece: new Piece({
  //         kind: 'tower',
  //         color: 'black',
  //         board: this.board,
  //       }),
  //     };
  //   });
  //   this.board[4][5].update((value) => {
  //     return {
  //       ...value,
  //       selected: true,
  //       piece: new Piece({
  //         kind: 'tower',
  //         color: 'black',
  //         board: this.board,
  //       }),
  //     };
  //   });
  //   this.board[4][6].update((value) => {
  //     return {
  //       ...value,
  //       selected: true,
  //       piece: new Piece({
  //         kind: 'tower',
  //         color: 'black',
  //         board: this.board,
  //       }),
  //     };
  //   });
  // }

  public newMatch(): void {
    this._stateSvc.movements.set([]);
    this._stateSvc.isTurnWhite.set(true);
    this.setBoard(this._initBoard);
  }

  public setBoard(newBoard: ICell[][]): void {
    // Pase lo que pase vamos a querer deseleccionar si hay alguna celda seleccionada previamente
    this.selectedCell()?.update((value) => {
      return {
        ...value,
        selected: false,
      };
    });
    // this.board = newBoard.map((row) => row.map((cell) => signal(cell)));
    for (let [indexRow, row] of this.board.entries()) {
      for (let [indexCell, cell$] of row.entries()) {
        const newCell = newBoard[indexRow][indexCell];
        cell$.update(() => {
          return {
            ...newCell,
          };
        });
      }
    }
  }

  public createBoard() {
    const whitePiecesStartRow = [0, 1];
    const blackPiecesStartRow = [7, 6];
    const orderPieces: IKindPiece[] = [
      'tower',
      'horse',
      'bishop',
      'queen',
      'king',
      'bishop',
      'horse',
      'tower',
    ];
    for (let [indexRow, row] of this.board.entries()) {
      for (let [indexCell, cell] of row.entries()) {
        const isSpaceWithPiace = [whitePiecesStartRow, blackPiecesStartRow]
          .flat()
          .includes(indexRow);
        if (!isSpaceWithPiace) {
          cell.update((value) => {
            return {
              ...value,
              piece: null,
              selected: false,
            };
          });
          continue;
        }
        const color = whitePiecesStartRow.includes(indexRow)
          ? 'white'
          : 'black';
        const kind =
          indexRow === 0 || indexRow === 7 ? orderPieces[indexCell] : 'pawn';

        cell.update((value) => {
          return {
            ...value,
            selected: false,
            piece: new Piece({
              kind,
              color,
              board: this.board,
            }),
          };
        });
      }
    }
    this._initBoard = this.board.map((row) => row.map((cell$) => cell$()));
  }

  public onSelectCell(cellSelected: WritableSignal<ICell>): void {
    // Ante todo si seleccionamos el tablero y hay algun movimiento seleccionado, volvemos a la situacion del tablero actual antes de poder seleccionar nada
    if (this._hasMovementSelected()) return;
    const { col: cellCol, row: cellRow } = cellSelected();
    const { col: selectedCol, row: selectedRow } =
      this.selectedCell()?.() ?? {};
    const areSame = cellCol === selectedCol && cellRow === selectedRow;
    const finalPosPiece = cellSelected().piece;
    const selectedPiece = this.selectedPiece();

    // Si el sitio donde seleccionamos es un movimiento posible, se mueve la pieza
    if (
      selectedPiece &&
      selectedPiece.color !== finalPosPiece?.color &&
      this.possiblePositionsMoves()?.some(
        (pos) => pos.col === cellCol && pos.row === cellRow,
      )
    ) {
      return this.onMovePiece(cellSelected);
    }

    // Pase lo que pase vamos a querer deseleccionar si hay alguna celda seleccionada previamente
    this.selectedCell()?.update((value) => {
      return {
        ...value,
        selected: false,
      };
    });

    // Si no hay pieza en la celda seleccionada, no hacemos nada
    if (!finalPosPiece) return;

    // Si no es la misma celda, seleccionamos la celda
    if (!areSame) {
      cellSelected.update((value) => {
        return {
          ...value,
          selected: true,
        };
      });
    }
  }

  private _hasMovementSelected(): boolean {
    const hasSelectedMovement = !!this.selectedMovement();
    if (hasSelectedMovement) {
      this._stateSvc.selectedMovement.set(null);
      const lastMove = this._stateSvc.movements().at(-1);
      this.setBoard(lastMove!.momentBoard);
    }
    return hasSelectedMovement;
  }

  // Eventos necesarios cuando una pieza va realizar un movimiento
  public onMovePiece(cellSelected: WritableSignal<ICell>): void {
    // if (!this.isTurnPiece()) return;
    // REVIEW REACTIVAR CUANDO SE TERMINEN DE CONFIGURAR TODOS LOS MOVIMIENTOS
    const selectedPiece = this.selectedPiece()!;
    // Check Castling Moves
    this._checkCastlingMoves(cellSelected);

    // Check Capture in passant
    this._checkCaptureInPassant(cellSelected);

    // Es doble salto de peon?
    const isDoublePawn =
      selectedPiece.kind === 'pawn' &&
      !selectedPiece.isMoved &&
      Math.abs(
        Number(cellSelected().row) - Number(selectedPiece.pieceCell()!.row),
      ) === 2;

    this.selectedCell()?.update((value) => {
      return {
        ...value,
        piece: null,
        selected: false,
      };
    });
    cellSelected.update((value) => {
      selectedPiece.onMove();
      return {
        ...value,
        piece: selectedPiece,
      };
    });

    // Cambiamos el color del turno
    this._stateSvc.isTurnWhite.update((isTurnWhite) => !isTurnWhite);
    // Añadimos el movimiento al historial
    this._stateSvc.movements.update((movements) => {
      const color = selectedPiece.color === 'black' ? 'b' : 'w';
      const imgSrc = `assets/images/pieces/${selectedPiece.kind}-${color}.svg`;
      return [
        ...movements,
        {
          col: cellSelected().col,
          row: cellSelected().row,
          color: selectedPiece.color,
          piece: selectedPiece,
          index: movements.length,
          imgSrc,
          isDoublePawn,
          momentBoard: this.board.map((row) => row.map((cell$) => cell$())),
        },
      ];
    });
  }

  // Chequea si se mueve el rey en un enrroque para mover la torre correspondiente
  public _checkCastlingMoves(cellSelected: WritableSignal<ICell>) {
    const selectedPiece = this.selectedPiece()!;
    // Si la pieza no es el rey no se puede enrrocar
    // No se chequea si hay piezas intermedias porque eso ya se ha checkeado en los posibles movimientos del rey.
    if (selectedPiece.kind !== 'king' || selectedPiece.isMoved) return;
    const { col } = cellSelected();
    const isWhitePiece = selectedPiece.color === 'white';
    const isCastling = cols.indexOf(col) === 2 || cols.indexOf(col) === 6;
    if (!isCastling) return;
    const isShortCastling = cols.indexOf(col) === 6;
    const towerCol = isShortCastling ? 7 : 0;
    const towerRow = isWhitePiece ? 0 : 7;
    const towerCell = this.board[towerRow][towerCol];
    const piece = towerCell().piece;
    towerCell.update((value) => {
      return {
        ...value,
        piece: null,
      };
    });
    this.board[towerRow][isShortCastling ? 5 : 3].update((value) => {
      piece?.onMove();
      return {
        ...value,
        piece,
      };
    });
  }

  // Recupera las amenazas enemigas
  private _getEnemyThreats(pieceColor: IColor): Record<string, boolean> {
    const enemyColor = pieceColor === 'white' ? 'black' : 'white';
    const result: Record<string, boolean> = {};
    for (let cell$ of this.board.flat()) {
      const cell = cell$();
      if (!cell.piece || cell.piece.color !== enemyColor) continue;
      const piece = cell.piece!;

      piece.threats().forEach((movement) => {
        result[`${movement.col}${movement.row}`] = true;
      });
    }
    return result;
  }

  // Chequea si se puede hacer una captura al paso
  private _checkCaptureInPassant(cellSelected: WritableSignal<ICell>) {
    const selectedPiece = this.selectedPiece()!;
    const lastMove = this._stateSvc.movements().at(-1);
    const { isDoublePawn, col: lastCol, row: lastRow } = lastMove || {};
    if (selectedPiece.kind !== 'pawn' || !isDoublePawn) return;
    const { col: celSelectedCol } = cellSelected();
    const { row: selectedPieceRow } = selectedPiece.pieceCell()!;
    const isCaptureInPassant =
      celSelectedCol === lastCol && selectedPieceRow === lastRow;
    if (!isCaptureInPassant) return;
    const enemyPawnCell =
      this.board[rows.indexOf(lastRow!)][cols.indexOf(celSelectedCol)];
    enemyPawnCell.update((value) => {
      return {
        ...value,
        piece: null,
      };
    });
  }
}
