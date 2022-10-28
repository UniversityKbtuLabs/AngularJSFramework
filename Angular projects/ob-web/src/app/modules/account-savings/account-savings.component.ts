import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { Router } from '@angular/router';
import { AccountsService } from '@core/services/accounts.service';

@Component({
  selector: 'ob-account-savings',
  templateUrl: './account-savings.component.html',
  styleUrls: ['./account-savings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSavingsComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  public type: string = ' ';
  public isErrorPage: boolean = false;

  constructor(
    private router: Router,
    private accountsService: AccountsService,
    private changeDetector: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.type = this.router.url.split('/')[1];
    this.addSubscriber(
      this.accountsService.isErrorPage$.subscribe({
        next: v => {
          this.isErrorPage = v;
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.accountsService.isErrorPage$.next(false);
  }
}
