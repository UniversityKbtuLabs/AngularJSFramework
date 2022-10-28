import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';
import { toInt } from 'ngx-bootstrap/chronos/utils/type-checks';

@Injectable({
  providedIn: 'root',
})
export class CustomvalidationService {
  constructor() {}

  symbolValidator(control: AbstractControl): { [key: string]: boolean } {
    if (!control.value) {
      return null;
    }
    const symbolRegxp: RegExp = /[\\/':'*<>|$&`~#]/;
    const invalid = symbolRegxp.test(control.value);
    return invalid ? { invalidSymbol: true } : null;
  }

  amountValidator(sum: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } => {
      if (!control.value) {
        return null;
      }
      return sum > control.value ? null : { insufficientFunds: true };
    };
  }

  objectValidator(control: AbstractControl): { [key: string]: boolean } {
    let obj = control.value;
    if (!obj) {
      return null;
    }

    return obj.knp ? null : { invalidObj: true };
  }

  accountFromValidator(control: AbstractControl): { [key: string]: boolean } {
    if (control && control.value && Object.keys(control.value).length) {
      return null;
    } else {
      return { accountFrom: true };
    }
  }

  accountToValidator(control: AbstractControl): { [key: string]: boolean } {
    if (control && control.value && Object.keys(control.value).length) {
      return null;
    } else {
      return { accountTo: true };
    }
  }

  cardToValidator = (control: FormControl) => {
    let cardNum = control.value;
    if (control && cardNum) {
      if (typeof cardNum === 'object' && cardNum !== null) {
        return null;
      } else {
        cardNum = cardNum.replace(/[^\d]/g, '');
        return cardNum.length === 16 ? null : { cardLength: true };
      }
    } else {
      return { required: true };
    }
  };

  docNumValidator(control: AbstractControl): { [key: string]: boolean } {
    // Валидатор поля Номера документа
    if (control.value) {
      if (control.value.length > 9) {
        return { maxLengthExceeded: true };
      } else {
        if (!/^[a-zA-Z0-9]+$/.test(control.value)) {
          return { pattern: true };
        } else {
          return null;
        }
      }
    } else {
      return { required: true };
    }
  }
  employeeFioValidator(control: AbstractControl): { [key: string]: boolean } {
    if (control.value) {
      if (
        /[0-9]$|[\\/':'*<>|$&`~#!?@№%*();''""=/[{ \]}.,+]$/.test(control.value)
      ) {
        return { pattern: true };
      } else {
        return null;
      }
    } else {
      return { required: true };
    }
  }

  binValidator(control: AbstractControl): { [key: string]: boolean } {
    let iin = control.value;
    if (!iin) {
      return { invalidBin: true };
    }
    iin = iin.trim();
    if (iin.length != 12) {
      return { invalidBin: true };
    }
    let arr = [];
    for (let i = 0; i < iin.length; i++) {
      arr[i] = parseInt(iin[i]);
    }
    let kr =
      (arr[0] * 1 +
        arr[1] * 2 +
        arr[2] * 3 +
        arr[3] * 4 +
        arr[4] * 5 +
        arr[5] * 6 +
        arr[6] * 7 +
        arr[7] * 8 +
        arr[8] * 9 +
        arr[9] * 10 +
        arr[10] * 11) %
      11;
    if (kr == 10) {
      kr =
        (arr[0] * 3 +
          arr[1] * 4 +
          arr[2] * 5 +
          arr[3] * 6 +
          arr[4] * 7 +
          arr[5] * 8 +
          arr[6] * 9 +
          arr[7] * 10 +
          arr[8] * 11 +
          arr[9] * 1 +
          arr[10] * 2) %
        11;
    }
    if (kr == 10) {
      return { invalidBin: true };
    }
    if (kr == arr[11]) {
      return null;
    }
    return { invalidBin: true };
  }

  innValidator(control: AbstractControl): { [key: string]: boolean } {
    let inn = control.value;

    if (inn && inn.length !== 10 && inn.length !== 12) {
      if (inn === 0 || inn === '0') {
        return null;
      } else {
        return { invalidLength: true };
      }
    } else {
      return null;
    }
  }

  sumZeroValidator(control: AbstractControl): { [key: string]: boolean } {
    if (control.value <= 0) {
      return { zeroSum: true };
    }
    if (control.value && isNaN(control.value)) {
      return { zeroSum: true };
    }
    return null;
  }

  allZeroValidator(control: AbstractControl): { [key: string]: boolean } {
    if (!control.value) {
      return null;
    }
    const allZero: RegExp = /^(0)\1+$/;
    const invalid = allZero.test(control.value);
    return invalid ? { allZero: true } : null;
  }

  repatriationPeriodValidator(control: AbstractControl): {
    [key: string]: boolean;
  } {
    if (control.value) {
      if (control.value.length === 6) {
        let dayPart = control.value.split('.')[0];
        let yearPart = control.value.split('.')[1];
        if (Number(dayPart) === 0 && Number(yearPart) === 0) {
          return { allZero: true };
        }
        if (Number(dayPart) < 180 && Number(yearPart < 1)) {
          return { minRepatriationError: true };
        }
        if (Number(dayPart) > 360) {
          return { maxRepatriationError: true };
        }
      }
    }
    return null;
  }
}
