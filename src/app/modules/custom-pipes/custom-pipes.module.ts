import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormattedDatePipe } from 'src/app/pipes/formatted-date.pipe';
import { GetHqPicturePipe } from 'src/app/pipes/get-hq-picture.pipe';
import { DateToTimeElapsedPipe } from 'src/app/pipes/date-to-time-elapsed.pipe';
import { TrimWordPipe } from 'src/app/pipes/trim-word.pipe';
import { FormatNumberPipe } from 'src/app/pipes/format-number.pipe';

@NgModule({
  declarations: [FormattedDatePipe, GetHqPicturePipe, DateToTimeElapsedPipe, TrimWordPipe, FormatNumberPipe],
  imports: [
    CommonModule
  ],
  exports: [FormattedDatePipe, GetHqPicturePipe, DateToTimeElapsedPipe, TrimWordPipe, FormatNumberPipe]
})
export class CustomPipesModule { }
