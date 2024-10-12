import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { cols, rows } from 'src/app/constants/board.constants';

@Component({
  selector: 'chess-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent {
  public board = Array.from({ length: 8 }, (_val, row) => {
    return Array.from({ length: 8 }, (_val, col) => {
      return {
        col: cols[col],
        row: rows[row],
        piece: null,
        color: (row + col) % 2 === 0 ? 'black' : 'white',
      };
    });
  });

  constructor() {}
}
