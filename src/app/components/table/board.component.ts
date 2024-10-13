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

  public selectedCell: WritableSignal<ICell> | null = null;
  public selectedPiece = computed(() => {
    return this.selectedCell?.().piece;
  })

  constructor() {
    this.newMatch();
    this._testHighlihtAndSelect();
    this.permutTable();
  }

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
    // Si no se selecciona una celda con pieza o ya estaba seleccionada la misma celda, se deselecciona la celda seleccionada previamente
    if (cellSelected().piece === null || this.selectedCell === cellSelected) {
      this.selectedCell?.update((value) => {
        return {
          ...value,
          selected: false,
        };
      });
      this.selectedCell = null;
      return;
    }

    // Si hay una celda seleccionada previamente, se deselecciona. Y se selecciona la celda seleccionada
    this.selectedCell?.update((value) => {
      return {
        ...value,
        selected: false,
      };
    });
    cellSelected.update((value) => {
      return {
        ...value,
        selected: !value.selected,
      };
    });
    this.selectedCell = cellSelected;
  }

  public permutTable() {
    this.board = this.board.reverse();
  }
}
