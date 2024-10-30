import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { IMovement } from '@interfaces/board.types';
import { StateService } from '@services/state.service';
import { Subscription } from 'rxjs';

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
