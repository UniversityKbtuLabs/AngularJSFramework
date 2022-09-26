import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { ISigner } from '@data/models/document-type';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-stg-user-table',
  templateUrl: './stg-user-table.component.html',
  styleUrls: ['./stg-user-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StgUserTableComponent {
  @Input() allSigners: ISigner[] = [];
  public userSort: number = 0;
  public isUserSort: boolean = false;
  public signSort: number = 0;
  public isSignSort: boolean = false;
  public statusSort: number = 0;
  public isStatusSort: boolean = false;
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

  constructor(private translate: TranslateService) {}

  sorting(type: string) {
    switch (type) {
      case 'name': {
        this.isUserSort = true;
        this.isSignSort = false;
        this.isStatusSort = false;
        this.getUserSortedList();
        break;
      }
      case 'sign': {
        this.isUserSort = false;
        this.isSignSort = true;
        this.isStatusSort = false;
        this.getSignSortedList();
        break;
      }
      case 'status': {
        this.isUserSort = false;
        this.isSignSort = false;
        this.isStatusSort = true;
        this.getStatusSortedList();
        break;
      }
      default: {
        break;
      }
    }
  }

  getUserSortedList() {
    if (this.userSort % 2 === 0) {
      this.userSort = this.userSort + 1;
      this.allSigners.sort(this.byFieldAsc('name', this.engAlphabet));
    } else {
      this.userSort = this.userSort + 1;
      this.allSigners.sort(this.byFieldDesc('name', this.engAlphabet));
    }
  }

  getSignSortedList() {
    if (this.signSort % 2 === 0) {
      this.signSort = this.signSort + 1;
      this.allSigners.sort(this.byFieldAsc('id', this.engAlphabet));
    } else {
      this.signSort = this.signSort + 1;
      this.allSigners.sort(this.byFieldDesc('id', this.engAlphabet));
    }
  }

  getStatusSortedList() {
    if (this.statusSort % 2 === 0) {
      this.statusSort = this.statusSort + 1;
      this.allSigners.sort(this.byFieldAsc('type', this.engAlphabet));
    } else {
      this.statusSort = this.statusSort + 1;
      this.allSigners.sort(this.byFieldDesc('type', this.engAlphabet));
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
      } else if (a[field] < b[field]) {
        return 1;
      } else {
        return -1;
      }
    };
  }

  getStatus(type: string) {
    let res;
    this.translate.get('default.' + type).subscribe((translation: string) => {
      res = translation;
    });
    return res;
  }
}
