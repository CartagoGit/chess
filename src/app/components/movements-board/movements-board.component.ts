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

  public whiteMovements = signal<IMovement[]>([]);
  public blackMovements = signal<IMovement[]>([]);

  private _subscriptions: Subscription[] = [];

  // ANCHOR: Constructor
  constructor(public stateSvc: StateService) {
    this._makeSubscriptions();
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((sub) => !sub?.closed && sub.unsubscribe());
  }

  // ANCHOR : Methods

  // Subscriptions to manage it and destroy with component
  private _makeSubscriptions(): void {
    // Observe movements and update the movements by color with optime performance
    const subMovements = toObservable(this.stateSvc.movements).subscribe(
      (movements) => {
        if (!movements?.length) {
          this.whiteMovements.set([]);
          this.blackMovements.set([]);
          return;
        }
        const lastMovement = movements.at(-1);
        if (!lastMovement) return;
        const isWhite = lastMovement.color === 'white';
        const movementsByColor = isWhite
          ? this.whiteMovements
          : this.blackMovements;
        movementsByColor.update((prev) => [...prev, lastMovement]);
      },
    );
    this._subscriptions.push(subMovements);
  }

  public newGame() : void {
    this.stateSvc.newMatch$.next();
    this.stateSvc.movements.set([])
  }


}
