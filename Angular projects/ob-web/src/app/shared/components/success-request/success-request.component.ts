import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ob-success-request',
  templateUrl: './success-request.component.html',
  styleUrls: ['./success-request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuccessRequestComponent {
  constructor(public router: Router) {}

  backToAccounts() {
    this.router.navigate(['/main/accounts/currents']);
  }
}
