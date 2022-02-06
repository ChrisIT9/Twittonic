import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trimWord'
})
export class TrimWordPipe implements PipeTransform {

  transform(value: string | undefined) {
    if (!value) return undefined;

    return value.length >= 20 ? `${value.substring(0, 15)}...` : value;
  }

}
