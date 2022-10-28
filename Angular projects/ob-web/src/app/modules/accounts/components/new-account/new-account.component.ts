import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ob-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewAccountComponent {
  public selectedFilial: any;
  public selectedCurrency: string = '';
  public isFormEmpty: boolean = true;

  currencies = [
    { code: 'kzt', label: 'Тенге' },
    { code: 'rub', label: 'Рубль' },
    { code: 'usd', label: 'Доллар' },
  ];

  filials = [
    { code: 'almaty9mkr', label: 'Алматы 9мкр' },
    { code: 'shymkent9mkr', label: 'Шымкент 8мкр' },
    { code: 'aktau9mkr', label: 'Актау 7мкр' },
  ];

  constructor() {}

  onChange() {}

  sendMail() {
    this.isFormEmpty = false;
  }
}
