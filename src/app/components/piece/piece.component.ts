import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { IPiece } from '@interfaces/board.types';

@Component({
  selector: 'chess-piece',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './piece.component.html',
  styleUrl: './piece.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieceComponent {
  public piece = input.required<IPiece>();

  public imgSrc = computed(() => {
    const color = this.piece().color === 'black' ? 'b' : 'w';
    return `assets/images/pieces/${this.piece().kind}-${color}.svg`;
  });

}
