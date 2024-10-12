import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StateService } from 'src/app/services/state.service';
import { MovementsComponent } from "../components/movements/movements.component";
import { BoardComponent } from "../components/table/board.component";

@Component({
  selector: 'chess-layout',
  standalone: true,
  imports: [CommonModule, MovementsComponent, BoardComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  state = inject(StateService);

}
