import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { AccountsService } from '@core/services/accounts.service';

@Component({
  selector: 'ob-modal-discharge',
  templateUrl: './modal-discharge.component.html',
  styleUrls: ['./modal-discharge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalDischargeComponent
  extends SubscriptionAccumulator
  implements OnInit
{
  public selectedAccount: any;
  public format: string = '';
  public formatForm: FormGroup;
  public mail: string = '';
  public fromDate: string = this.formatDate(new Date());
  public toDate: string = this.formatDate(new Date());
  public accountsForDischarge: any = [];

  constructor(
    public formBuilder: FormBuilder,
    public accountsService: AccountsService,
    private changeDetector: ChangeDetectorRef
  ) {
    super();

    this.formatForm = this.formBuilder.group({
      format: [],
    });
  }

  ngOnInit(): void {
    this.addSubscriber(
      this.accountsService.currentAccounts.subscribe((accounts: any) => {
        this.accountsForDischarge = [...this.accountsForDischarge, ...accounts];
        this.accountsService.setSelectedAccount(this.accountsForDischarge[0]);

        this.changeDetector.detectChanges();
      })
    );

    this.addSubscriber(
      this.accountsService.currentCards.subscribe((cards: any) => {
        this.accountsForDischarge = [...this.accountsForDischarge, ...cards];
        this.accountsService.setSelectedAccount(this.accountsForDischarge[0]);
        this.changeDetector.detectChanges();
      })
    );

    this.addSubscriber(
      this.accountsService.currentSelectedAccount.subscribe((data: any) => {
        this.selectedAccount = data?.iban || data?.accountIban;
      })
    );
  }

  formatDate(date?: any): string {
    const formatDate = new Date(date).toISOString().split('T');
    const formatTime = formatDate?.[1].split('.')[0];

    return `${formatDate[0]} ${formatTime}`;
  }

  changeSelectedAccount() {
    const account = this.accountsForDischarge.find((acc: any) => {
      if (
        acc.iban === this.selectedAccount ||
        acc.accountIban === this.selectedAccount
      ) {
        return acc;
      }
    });

    this.accountsService.setSelectedAccount(account);
    this.changeDetector.detectChanges();
  }

  setFromDate(date: Date) {
    this.fromDate = this.formatDate(date);
  }

  setToDate(date: Date) {
    this.toDate = this.formatDate(date);
  }
}
