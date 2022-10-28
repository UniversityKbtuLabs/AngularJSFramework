import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reverse',
})
export class ReversePipe implements PipeTransform {
  transform(value: string): string {
    var newValue = '';
    if (value) {
      newValue = value.split('-').reverse().join('.');
    }
    return newValue;
  }
}
