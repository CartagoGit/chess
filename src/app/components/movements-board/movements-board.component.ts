import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'chess-movements-board',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './movements-board.component.html',
  styleUrl: './movements-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovementsComponent { }
