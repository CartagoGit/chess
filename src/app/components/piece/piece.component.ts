import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { Piece } from '@models/piece.model';

@Component({
  selector: 'chess-piece',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './piece.component.html',
  styleUrl: './piece.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieceComponent {
  public piece = input.required<Piece>();

  public imgSrc = computed(() => {
    const color = this.piece().color === 'black' ? 'b' : 'w';
    return `assets/images/pieces/${this.piece().kind}-${color}.svg`;
  });

}
