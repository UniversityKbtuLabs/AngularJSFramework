import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { AccountHistoryService } from '@app/core/services/account-history.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-operation-status',
  templateUrl: './operation-status.component.html',
  styleUrls: ['./operation-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationStatusComponent {
  @Input() status: string = 'DEFAULT';
  @Input() signatureStatus: string = '';
  @Input() id: number;
  @Input() signers: any = null;
  @Input() className: string = '';
  @Input() signersInfo: any = {};

  constructor(
    public accountHistoryService: AccountHistoryService,
    public translate: TranslateService
  ) {
    this.getlabel = this.getlabel.bind(this);
  }

  getClassName(status: any, key: string) {
    if (status) {
      if (key === 'clName') {
        if (this.status === 'NEWDOC' && this.signatureStatus === 'SUFFICIENT') {
          return 'status in-progress';
        } else {
          return this.accountHistoryService.statusList[status]?.clName;
        }
      } else if (key === 'icon') {
        return this.accountHistoryService.statusList[status]?.icon;
      } else if (key === 'label') {
        if (this.status === 'NEWDOC' && this.signatureStatus === 'SUFFICIENT') {
          return this.accountHistoryService.statusList['IN_PROGRESS']?.label;
        }
        return this.accountHistoryService.statusList[status]?.label;
      }
    }
  }

  getlabel() {
    if (this.status === 'NEWDOC' && this.signatureStatus === 'SUFFICIENT') {
      return this.translate.instant('status.in-processing');
    } else {
      return this.getClassName(this.status, 'label');
    }
  }
}
