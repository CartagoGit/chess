import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  public readonly title = `Cartago's Chess`;
  public readonly footer = `© 2024 Cartago Nova`;

  // public playerColor = Math.random() > 0.5 ? 'white' : 'black';


  constructor() {}
}
