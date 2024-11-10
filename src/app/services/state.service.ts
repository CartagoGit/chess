import { Injectable, signal } from '@angular/core';
import { ICell, IMovement } from '@interfaces/board.types';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  public readonly title = `Cartago's Chess`;
  public readonly footer = `© 2024 Cartago Nova`;

  public isTurnWhite = signal<boolean>(true);

  public newMatch$ = new BehaviorSubject<void>(undefined);
  public setBoard$ = new Subject<ICell[][]>();
  // public playerColor = Math.random() > 0.5 ? 'white' : 'black';

  public movements = signal<IMovement[]>([]);
  public selectedMovement = signal<IMovement | null>(null);

  constructor() {}
}
