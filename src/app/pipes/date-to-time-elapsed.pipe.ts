import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateToTimeElapsed'
})
export class DateToTimeElapsedPipe implements PipeTransform {

  months = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

  transform(value: string | undefined) {
    if (!value) return undefined;

    const currentTime = Math.floor(Date.now() / 1000);
    const time = Math.floor(new Date(value).getTime() / 1000);

    const differenceInSeconds = currentTime - time;

    if (differenceInSeconds < 60) return `${differenceInSeconds} ${differenceInSeconds === 1 ? "secondo" : "secondi"} fa`;
    if (differenceInSeconds >= 60 && differenceInSeconds < 3600) return `${Math.floor(differenceInSeconds / 60)} ${differenceInSeconds >= 60 && differenceInSeconds < 120 ? "minuto" : "minuti"} fa`;
    if (differenceInSeconds >= 3600 && differenceInSeconds < 86400) return `${Math.floor(differenceInSeconds / 3600)} ${differenceInSeconds >= 3600 && differenceInSeconds < 7200 ? "ora" : "ore"} fa`;

    const [ date ] = value.split("T");
    const [ year, month, day ] = date.split("-");

    return `${day.startsWith("0") ? day.replace("0", "") : day} ${this.months[Number(month) - 1]} ${year}`;
  }

}
