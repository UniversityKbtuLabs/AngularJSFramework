import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { OPERATIONS } from '@core/constants/pathnames';

@Component({
  selector: 'ob-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent implements OnInit {
  paymentType = '';
  id: number = 0;
  operations = OPERATIONS;

  constructor(
    private route: ActivatedRoute,
    public changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.paymentType = this.route.snapshot.params['type'];
    this.id = this.route.snapshot.params['id'];
  }

  goBack() {
    window.history.back();
  }
}
