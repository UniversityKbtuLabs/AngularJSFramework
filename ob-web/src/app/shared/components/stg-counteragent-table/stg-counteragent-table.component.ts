import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { ICounteragent } from '@data/models/payment-types';

@Component({
  selector: 'ob-stg-counteragent-table',
  templateUrl: './stg-counteragent-table.component.html',
  styleUrls: ['./stg-counteragent-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StgCounteragentTableComponent {
  @Input() countragentList: ICounteragent[] = [];
  public counterAgentSort: number = 0;
  public isCounterAgentSort: boolean = false;
  public accountSort: number = 0;
  public isAccountSort: boolean = false;
  public engAlphabet: string[] = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
  ];

  constructor() {}

  sorting(type: string) {
    switch (type) {
      case 'counteragent': {
        this.isAccountSort = false;
        this.isCounterAgentSort = true;
        this.getCounteragentSortedList();
        break;
      }
      case 'account': {
        this.isAccountSort = true;
        this.isCounterAgentSort = false;
        this.getAccountSortedList();
        break;
      }
      default: {
        break;
      }
    }
  }

  getCounteragentSortedList() {
    if (this.counterAgentSort % 2 === 0) {
      this.counterAgentSort = this.counterAgentSort + 1;
      this.countragentList.sort(this.byFieldAsc('name', this.engAlphabet));
    } else {
      this.counterAgentSort = this.counterAgentSort + 1;
      this.countragentList.sort(this.byFieldDesc('name', this.engAlphabet));
    }
  }

  getAccountSortedList() {
    //Список контрагентов халык банка
    let halykBanks: ICounteragent[] = [];
    //список контрагентов других банков
    let otherBanks: ICounteragent[] = [];
    //разделение на контрагентов
    this.countragentList.map(item => {
      if (item.bankBic === 'HSBKKZKX') {
        halykBanks.push(item);
      } else if (item.bankBic !== 'HSBKKZKX') {
        otherBanks.push(item);
      }
    });
    if (this.accountSort % 2 === 0) {
      this.accountSort = this.accountSort + 1;
      this.countragentList = [];
      this.countragentList = this.countragentList.concat(halykBanks);
      this.countragentList = this.countragentList.concat(otherBanks);
    } else {
      this.accountSort = this.accountSort + 1;
      this.countragentList = [];
      this.countragentList = this.countragentList.concat(otherBanks);
      this.countragentList = this.countragentList.concat(halykBanks);
    }
  }

  byFieldAsc(field: any, engAlphabet: string[]) {
    return function (a: any, b: any) {
      if (a[field] === b[field]) {
        return 0;
      } else if (a[field] === null) {
        return 1;
      } else if (b[field] === null) {
        return -1;
      } else if (engAlphabet.includes(a[field].substr(0, 1).toLowerCase())) {
        //если присутствуют английские буквы
        return 1;
      } else if (engAlphabet.includes(b[field].substr(0, 1).toLowerCase())) {
        //если присутствуют английские буквы
        return -1;
      } else if (a[field] > b[field]) {
        return 1;
      } else {
        return -1;
      }
    };
  }

  byFieldDesc(field: any, engAlphabet: string[]) {
    return function (a: any, b: any) {
      if (a[field] === b[field]) {
        return 0;
      } else if (a[field] === null) {
        return 1;
      } else if (b[field] === null) {
        return -1;
      } else if (engAlphabet.includes(a[field].substr(0, 1).toLowerCase())) {
        //если присутствуют английские буквы
        return 1;
      } else if (engAlphabet.includes(b[field].substr(0, 1).toLowerCase())) {
        //если присутствуют английские буквы
        return -1;
      } else if (a[field] < b[field]) {
        return 1;
      } else {
        return -1;
      }
    };
  }
}
