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

  public selectedCell = computed(() => {
    return this.board.flat().find((cell) => cell().selected);
  });

  public selectedPiece = computed(() => {
    const cell = this.selectedCell();
    return cell?.().piece;
  });

  // Desde que perspectiva se verá el tablero. Desde la perspectiva de las piezas negras o de las blancas. En principio será la del color del jugador, pero podría cambiar
  public boardPerspectiveColor = signal<IColor>('white');

  public boardPerspective = computed(() => {
    return this.boardPerspectiveColor() === 'white'
      ? [...this.board].reverse()
      : this.board;
  });

  public possiblePositionsMoves = computed(() => {
    return this.selectedPiece()?.movements();
  });

  private _subscriptions: Subscription[] = [];

  // ANCHOR Constructor
  constructor(private _stateSvc: StateService) {
    this.newMatch();
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
    this._subscriptions.push(subNewMatch);
  }

  private _testHighlihtAndSelect() {
    this.board[4][2].update((value) => {
      return {
        ...value,
        piece: new Piece({
          kind: 'tower',
          color: 'black',
          board: this.board,
        }),
      };
    });
    this.board[4][3].update((value) => {
      return {
        ...value,
        piece: new Piece({
          kind: 'tower',
          color: 'black',
          board: this.board,
        }),
      };
    });
    this.board[4][5].update((value) => {
      return {
        ...value,
        selected: true,
        piece: new Piece({
          kind: 'tower',
          color: 'black',
          board: this.board,
        }),
      };
    });
    this.board[4][6].update((value) => {
      return {
        ...value,
        selected: true,
        piece: new Piece({
          kind: 'tower',
          color: 'black',
          board: this.board,
        }),
      };
    });
  }

  public newMatch() {
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
  }

  public onSelectCell(cellSelected: WritableSignal<ICell>): void {
    const { col: cellCol, row: cellRow } = cellSelected();
    const { col: selectedCol, row: selectedRow } =
      this.selectedCell()?.() ?? {};
    const areSame = cellCol === selectedCol && cellRow === selectedRow;
    const finalPosPiece = cellSelected().piece; // TODO Hacer que si es del color contrario no se pueda seleccionar
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

  public onMovePiece(cellSelected: WritableSignal<ICell>): void {
    const selectedPiece = this.selectedPiece()!;
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
        },
      ];
    });
  }
}
