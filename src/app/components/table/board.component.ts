import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  WritableSignal,
} from '@angular/core';
import { PieceComponent } from '@components/piece/piece.component';
import { ICell, IKindPiece } from '@interfaces/board.types';
import { Piece } from '@models/piece.model';
import { cols, rows } from 'src/app/constants/board.constants';

@Component({
  selector: 'chess-board',
  standalone: true,
  imports: [CommonModule, PieceComponent],
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
          showMoves: false,
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

  public boardVision = computed(() => {
    return this.board.flat()[0]().color === 'black' ? 'black' : 'white';
  });

  // ANCHOR Constructor
  constructor() {
    this.newMatch();
    this._testHighlihtAndSelect();
    this.permutTable();
  }

  // ANCHOR Methods
  private _testHighlihtAndSelect() {
    this.board[4][2].update((value) => {
      return {
        ...value,
        showMoves: true,
        piece: new Piece({
          kind: 'tower',
          color: 'black',
        }),
      };
    });
    this.board[4][3].update((value) => {
      return {
        ...value,
        showMoves: true,
        piece: new Piece({
          kind: 'tower',
          color: 'black',
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
              showMoves: false,
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
            showMoves: false,
            selected: false,
            piece: new Piece({
              kind,
              color,
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
    // if (cellSelected().showMoves && selectedPiece) {
    if (selectedPiece && selectedPiece.color !== finalPosPiece?.color) {
      this.selectedCell()?.update((value) => {
        return {
          ...value,
          piece: null,
          selected: false,
        };
      });
      console.log('Moviendo pieza', selectedPiece);
      cellSelected.update((value) => {
        selectedPiece.onMove();
        return {
          ...value,
          piece: selectedPiece,
        };
      });
      return;
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

  // Cambia la tabla de posición para vista del jugador
  public permutTable() {
    this.board = this.board.reverse();
  }
}
