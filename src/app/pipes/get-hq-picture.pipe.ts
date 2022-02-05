import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getHqPicture'
})
export class GetHqPicturePipe implements PipeTransform {

  transform(value: string | undefined) {
    if (!value) return undefined;

    return value.replace("normal", "400x400");
  }

}
