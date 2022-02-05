import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formattedDate'
})
export class FormattedDatePipe implements PipeTransform {

  months = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

  transform(value: string | undefined) {
    if (!value) return undefined;

    const [ date ] = value.split("T");
    const [ year, month, day ] = date.split("-");

    return `${day.startsWith("0") ? day.replace("0", "") : day} ${this.months[Number(month) - 1]} ${year}`;
  }

}
