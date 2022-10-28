import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

@Component({
  selector: 'ob-currency-card',
  templateUrl: './currency-card.component.html',
  styleUrls: ['./currency-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyCardComponent {
  @Input() isoCode: string = '';
  @Input() name: string = '';
  @Input() isActiveToShow: string = '';
  @Input() iconUrl: string = '';
  constructor() {}
}
