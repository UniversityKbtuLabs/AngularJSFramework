import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { HOME_OPERATIONS, WELCOME } from '@app/core/constants/pathnames';
import { getNounByNumbers } from '@app/core/helpers';
import { HelperService } from '@app/core/services/helper.service';
import { AccountHistoryService } from '@core/services/account-history.service';

@Component({
  selector: 'ob-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessComponent implements OnInit {
  amountList: any;
  public docLength: number = 0;
  public productLength: number = 0;

  constructor(
    public router: Router,
    public helperService: HelperService,
    private dischargeHistoryService: AccountHistoryService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.dischargeHistoryService.docsLength$.subscribe({
      next: value => {
        this.docLength = value;
        this.changeDetector.detectChanges();
      },
    });
    this.dischargeHistoryService.productsLength$.subscribe({
      next: value => {
        this.productLength = value;
        this.changeDetector.detectChanges();
      },
    });
    this.dischargeHistoryService.docsAmount$.subscribe(value => {
      this.amountList = JSON.parse(value);
      this.changeDetector.detectChanges();
    });
  }

  goToSignedDocs() {
    this.dischargeHistoryService.docsAmount$.next('{"KZT":[0]}');
    this.dischargeHistoryService.docsLength$.next(0);
    this.dischargeHistoryService.productsLength$.next(0);
    this.dischargeHistoryService.selectedDocuments.next([]);
    this.dischargeHistoryService.openedDocument$.next(null);
    this.router.navigate([HOME_OPERATIONS]);
  }

  navigateToMain() {
    this.router.navigate([WELCOME]);
  }

  getAmountKeys(): any {
    return Object.keys(this.amountList);
  }
  // для получения окончаний 1 заяв-ка 2 заяв-ки 9 заяв-ок
  getNouns(num: number, type: string) {
    if (type === 'products') {
      return getNounByNumbers(num, [
        'default.request1',
        'default.request2',
        'default.request3',
      ]);
    } else {
      return getNounByNumbers(num, [
        'default.operation1',
        'default.operation2',
        'default.operation3',
      ]);
    }
  }
}
