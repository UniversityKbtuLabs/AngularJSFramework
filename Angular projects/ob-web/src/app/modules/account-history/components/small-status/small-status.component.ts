import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  dateFormat,
  mmmmDateFormat,
  requestDateFormat,
} from '@app/core/constants';
import { AccountHistoryService } from '@app/core/services/account-history.service';
import { HelperService } from '@app/core/services/helper.service';
import moment from 'moment';

@Component({
  selector: 'ob-small-status',
  templateUrl: './small-status.component.html',
  styleUrls: ['./small-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmallStatusComponent implements OnInit, OnChanges {
  @Input() type: string = '';
  @Input() list: any = [];
  @Input() title: string = '';
  @Input() signatureStatus: string = '';
  @Input() open: boolean = false;

  public isStatusOpen: boolean = false;
  public isFinished: boolean = false;

  constructor(
    public dischargeHistoryService: AccountHistoryService,
    public helperService: HelperService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.open) {
      this.checkParentArrowClick();
    }
  }

  ngOnInit(): void {
    if (this.list[0][0] === 'APPROVED' || this.list[0][0] === 'FULFILLED') {
      this.isFinished = true;
    }
  }

  checkParentArrowClick() {
    if (this.open) {
      this.isStatusOpen = true;
    } else {
      this.isStatusOpen = false;
    }
  }
  getImgSrc(item: any) {
    if (this.type === 'signers') {
      return item.status
        ? './assets/icons/approved.svg'
        : './assets/icons/onSign.svg';
    } else {
      return this.dischargeHistoryService.statusList[item[0]].icon;
    }
  }

  getTitle(title: string) {
    if (this.type === 'signers') {
      return title;
    } else {
      return this.dischargeHistoryService.statusList[title].label;
    }
  }

  getClassName(item: any) {
    if (this.type === 'signers') {
      return item.status ? 'approved' : '';
    } else {
      return this.dischargeHistoryService.statusList[item[0]].clName;
    }
  }

  getRejectedMessage() {
    let operationInfo = JSON.parse(localStorage.getItem('operation-info'));
    return operationInfo.statusDetails || '';
  }

  getformattedDate(date: string) {
    return moment(date, dateFormat).format(mmmmDateFormat);
  }
}
