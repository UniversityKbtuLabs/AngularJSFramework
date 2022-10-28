import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ob-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorPageComponent {
  @Input() breadCrumbs: string = '';

  constructor(private router: Router, private activeRoute: ActivatedRoute) {}

  toAllAccounts() {
    let type = this.router.url.split('/')[1];
    if (type === 'account') {
      this.router.navigateByUrl('accounts', { state: { type: 'accounts' } });
    } else if (type === 'card') {
      this.router.navigateByUrl('accounts', { state: { type: 'cards' } });
    } else {
      this.router.navigateByUrl('accounts', { state: { type: 'deposits' } });
    }
  }
}
