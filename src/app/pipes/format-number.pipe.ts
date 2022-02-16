import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatNumber'
})
export class FormatNumberPipe implements PipeTransform {

  transform(value: number) {
    if (value >= 1000 && value < 1000000) return `${Math.ceil(value / 1000)}K`;
    if (value >= 1000000) return `${Math.ceil(value / 1000000)}M`;
    return value;
  }

}
