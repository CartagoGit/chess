import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'chess-movements',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './movements.component.html',
  styleUrl: './movements.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovementsComponent { }
