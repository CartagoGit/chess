import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'chess-piece',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './piece.component.html',
  styleUrl: './piece.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieceComponent {
  // piece
}
