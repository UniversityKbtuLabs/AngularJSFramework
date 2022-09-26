import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'accountNumber',
  pure: true,
})
export class AccountNumberPipe implements PipeTransform {
  transform(account: any) {
    let accNumber;
    if (account.level) {
      if (account.level === 3) {
        accNumber = `${account.contractName}••${account.contractNumber.slice(
          -4
        )}`;
      } else {
        accNumber =
          account.contractNumber || account.iban || account.accountIban;
      }
    } else {
      accNumber = accNumber =
        account.contractNumber || account.iban || account.accountIban;
    }
    return accNumber;
  }
}
