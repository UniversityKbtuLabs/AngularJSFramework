import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'amountPipe',
})
export class AmountPipe implements PipeTransform {
  transform(val: any) {
    if (val && typeof val === 'string') {
      return val.replaceAll(/\s/g, '  ');
    } else {
      return val;
    }

    // if (val === -0 || val === 0) {
    //   return '0';
    // }
    // if (!val) {
    //   return '';
    // }
    // val = val + ''; // may receive a number type
    // if (val.length < 4 || ((val.indexOf('.') > -1) && val.length < 6)) {
    //   return val;
    // } else {
    //   let fixed = '';
    //   if (val.indexOf('.') > -1) {
    //     fixed = val.substr(val.indexOf('.'));
    //     val = val.substr(0, val.indexOf('.'));
    //   }
    //   let firstDiv = val.length % 3;
    //   let truncated = val.substr(firstDiv);
    //   let segmentCount = parseInt('' + (truncated.length - 1) / 3, 10) + 1;
    //   let segments = [];
    //   if (firstDiv !== 0) {
    //     segments.push(val.substr(0, firstDiv));
    //   }
    //   for (var i = 0; i < segmentCount; i++) {
    //     segments.push(truncated.substr(i * 3, 3));
    //   }
    //   return segments.join(' ') + fixed;
    // }
  }
}
