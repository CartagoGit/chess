import { Injectable, signal } from '@angular/core';
import { ICell, ICheckState, IMovement } from '@interfaces/board.types';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  // ANCHOR : Propierties
  public readonly title = `Cartago's Chess`;
  public readonly footer = `© 2024 Cartago Nova`;

  public isTurnWhite = signal<boolean>(true);

  public newMatch$ = new BehaviorSubject<void>(undefined);
  public setBoard$ = new Subject<ICell[][]>();
  // public playerColor = Math.random() > 0.5 ? 'white' : 'black';

  public movements = signal<IMovement[]>([]);
  public selectedMovement = signal<IMovement | null>(null);

  // REVIEW
  // 1 - Cuando se hace jaque
  // - 1.1. Mirar las piezas que amenazan al rey
  // - 1.2 Los posibles movimientos del rey
  // - 1.3 Los posibles movimientos de las piezas para proteger al rey
  // - 1.4 Impedir movimiento de piezas que descubren un jaque al rey

  // 2 - Jaque Mate
  // - 2.3 - Si el rey no tiene movimientos posibles ni niguna puede proteget
  // - 2.2 - Abandono del jugador


  // 3 - Tablas
  // - 3.1 - Tablas por ahogado
  // - 3.2 - Tablas por repetición
  // - 3.3 - Tablas por regla de los 50 movimientos
  // - 3.4 - Tablas por falta de material
  // - 3.5 - Tablas por acuerdo de los jugadores


  public checkState = signal<ICheckState>('normal');

  // ANCHOR : Constructor
  constructor() {}
}
