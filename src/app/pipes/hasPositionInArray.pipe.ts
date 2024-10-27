import { Pipe, type PipeTransform } from '@angular/core';
import { IPosition } from '@interfaces/board.types';

@Pipe({
  name: 'hasPositionInArray',
  standalone: true,
})
export class HasPositionInArrayPipe implements PipeTransform {

  transform(data: {possiblePossitions?: IPosition[] , position: IPosition}): boolean {
    const { possiblePossitions = [], position } = data;
    return possiblePossitions.some(
      (possiblePosition) =>
        possiblePosition.col === position.col &&
        possiblePosition.row === position.row,
    );
  }

}
