import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({
  name: 'formatAmount',
})
export class FormatAmountPipe implements PipeTransform {
  format: string = '1.0-2';
  locale: string = 'fr-FR';

  constructor(private decimalPipe: DecimalPipe) {}

  transform(value: string | number): string {
    return (
      <string>this.decimalPipe.transform(value, this.format, this.locale) || '0'
    );
  }
}
