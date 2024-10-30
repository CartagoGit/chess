import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { StateService } from '@services/state.service';

@Component({
  selector: 'chess-movements-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movements-board.component.html',
  styleUrl: './movements-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovementsComponent {
  // ANCHOR : Propierties

  public movesByColor = computed(() => {
    const moves = this._stateSvc.didMovements();
    const blackMoves = [];
    const whiteMoves = [];

    for (const move of moves) {
      if (move.color === 'black') blackMoves.push(move);
      else if (move.color === 'white') whiteMoves.push(move);
    }

    return { blackMoves, whiteMoves };
  });

  public whiteMoves = computed(() => this.movesByColor().whiteMoves);
  public blackMoves = computed(() => this.movesByColor().blackMoves);

  // ANCHOR: Constructor
  constructor(private _stateSvc: StateService) {}

  // ANCHOR : Methods
}
