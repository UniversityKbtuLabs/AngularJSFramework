import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  Input,
} from '@angular/core';
import { IExchange } from '@data/models/exchange-types';
import { ExchangeService } from '@core/services/exchange.service';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import moment from 'moment';
import { dateFormat } from '@app/core/constants';
import { Router } from '@angular/router';
import { HelperService } from '@core/services/helper.service';
import { environment } from '@env/environment';

@Component({
  selector: 'ob-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExchangeComponent
  extends SubscriptionAccumulator
  implements OnInit
{
  public exchangeData: IExchange[] | null = null;
  @Input() page: string = '';
  public isProduction: boolean = environment.production;

  constructor(
    public exchangeService: ExchangeService,
    private helperService: HelperService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.getExchange();
  }

  getExchange(): void {
    this.addSubscriber(
      this.exchangeService.getExchanges().subscribe(
        (data: IExchange[]) => {
          this.exchangeData = data;
          this.exchangeService.setExchangeLoading(false);
        },
        err => {
          this.exchangeService.setExchangeLoading(false);
        }
      )
    );
  }

  getCurrentDate() {
    return moment().format(dateFormat);
  }

  getExchangeRate(buyChange: number): string {
    return buyChange > 0 ? 'exchangeup' : 'exchangedown';
  }

  redirectTo() {
    // window.open('https://www.google.com/', '_blank').focus();
  }

  getCurrency(cur: string): string {
    if (cur) {
      return this.helperService.formatCurrency(cur);
    } else {
      return '';
    }
  }

  goToHalykFXPage() {
    this.router.navigate(['currency-control/halykfx']);
  }
}
