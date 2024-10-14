import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IColor } from '@interfaces/board.types';

@Component({
  selector: 'chess-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerComponent {
  public isTurn: boolean = false;
  public color!: IColor;
  public time: number = 0;
  public name: string = 'Player';
  public elo: number = 0;
}
