import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { HelperService } from '@core/services/helper.service';

@Component({
  selector: 'ob-currency-control-description',
  templateUrl: './currency-control-description.component.html',
  styleUrls: ['./currency-control-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyControlDescriptionComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  public description: boolean = true;

  constructor(private helperService: HelperService) {
    super();
  }

  ngOnInit(): void {
    this.addSubscriber(
      this.helperService.currencyControlDescription$.subscribe(value => {
        this.description = value;
      })
    );
  }

  showDescription() {
    this.helperService.currencyControlDescription$.next(!this.description);
  }
}
