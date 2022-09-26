import { Pipe, PipeTransform } from '@angular/core';
import { checkObjectProperty } from '@app/core/helpers';

@Pipe({
  name: 'accountListSorter',
  pure: true,
})
export class AccountListSorter implements PipeTransform {
  transform(accounts: any[]) {
    let accountList: any = [];
    accountList = accounts.sort(function (a, b) {
      if (a.level && b.level) {
        return a.level - b.level;
      } else {
        const fieldB = checkObjectProperty(() => b.actualBalance)
          ? 'actualBalance'
          : 'amountBalance';
        const fieldA = checkObjectProperty(() => b.actualBalance)
          ? 'actualBalance'
          : 'amountBalance';
        return b[fieldB] - a[fieldA];
      }
    });
    return accountList;
  }
}
