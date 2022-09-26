import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { Router } from '@angular/router';
import { AccountComponent } from '@modules/account/account.component';

@Component({
  selector: 'ob-small-card',
  templateUrl: './small-card.component.html',
  styleUrls: ['./small-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmallCardComponent implements OnInit {
  @Input() account: any;
  @Input() type?: string = '';

  public balance: string = '';
  public currency: string = '';
  public iban: string = '';

  constructor(public router: Router) {}

  ngOnInit(): void {
    if (this.type === 'account') {
      this.balance = this.account.actualBalance;
      this.currency = this.account.currency;
      this.iban = this.account.iban;
    } else if (this.type === 'card') {
      this.balance = this.account.amountBalance;
      this.currency = this.account.currencyCode;
      this.iban = this.account.accountIban;
    }
  }

  cutIban(iban: string): string {
    return iban.slice(0, 4) + '*' + iban.slice(-4);
  }

  redirectToPage(id: number) {
    this.router.navigate([`${this.router.url}/${id}`]);
  }
}
