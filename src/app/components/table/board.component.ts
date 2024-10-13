import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  signal,
  WritableSignal,
} from '@angular/core';
import { PieceComponent } from '@components/piece/piece.component';
import { ICell, IPiece } from '@interfaces/board.types';
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
        return signal({
          col: cols[col],
          row: rows[row],
          piece: null,
          color: (row + col) % 2 === 0 ? 'black' : 'white',
        });
      });
    },
  );

  constructor() {
    this.board[0][0].update((value) => {
      return {
        ...value,
        piece: { kind: 'tower', color: 'black' },
      };
    });
    this.board[0][1].update((value) => {
      return {
        ...value,
        piece: { kind: 'tower', color: 'white' },
      };
    });
    this.board[0][2].update((value) => {
      return {
        ...value,
        piece: { kind: 'horse', color: 'black' },
      };
    });
    this.board[0][3].update((value) => {
      return {
        ...value,
        piece: { kind: 'horse', color: 'white' },
      };
    });
    this.board[0][4].update((value) => {
      return {
        ...value,
        piece: { kind: 'bishop', color: 'black' },
      };
    });
    this.board[0][5].update((value) => {
      return {
        ...value,
        piece: { kind: 'bishop', color: 'white' },
      };
    });
    this.board[0][6].update((value) => {
      return {
        ...value,
        piece: { kind: 'queen', color: 'black' },
      };
    });
    this.board[0][7].update((value) => {
      return {
        ...value,
        piece: { kind: 'queen', color: 'white' },
      };
    });
    this.board[1].forEach((cell, index) => {
      cell.update((value) => {
        if ([0, 1].includes(index)) {

          if (index % 2 === 0) {
            return {
              ...value,
              piece: { kind: 'king', color: 'black' },
            };
          } else {
            return {
              ...value,
              piece: { kind: 'king', color: 'white' },
            };
          }
        }
        if (index % 2 === 0) {
          return {
            ...value,
            piece: { kind: 'pawn', color: 'white' },
          };
        }
        return {
          ...value,
          piece: { kind: 'pawn', color: 'black' },
        };
      });
    });
  }
}
