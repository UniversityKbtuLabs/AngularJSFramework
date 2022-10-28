import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MainService } from '@core/services/main.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'ob-account-topup',
  templateUrl: './account-topup.component.html',
  styleUrls: ['./account-topup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountTopupComponent implements OnInit {
  public selectedDestinyAccount: any;
  public amount: string = '';

  public accounts = [
    {
      code: 'iban1',
      label: 'Счёт  31**2070',
      amount: '820 120 800 700,00 ₸',
      img: '/assets/icons/tenge_symbol.svg',
    },
    {
      code: 'iban2',
      label: 'Счёт  20**6334',
      amount: '21 000,00 $',
      img: '/assets/icons/usd_symbol.svg',
    },
    {
      code: 'iban3',
      label: 'Счёт  10**0176',
      amount: '178 310,00 ₽',
      img: '/assets/icons/rub_symbol.svg',
    },
  ];

  constructor(public mainService: MainService) {}

  ngOnInit() {
    this.selectedDestinyAccount = this.accounts[0].code;
  }

  onChange() {
    //
  }

  openSlider() {
    this.mainService.openSlideModal('tariffs');
  }
}
