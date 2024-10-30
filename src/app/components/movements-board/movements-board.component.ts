import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
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

  // ANCHOR: Constructor
  constructor(public stateSvc: StateService) {}

  // ANCHOR : Methods
}
