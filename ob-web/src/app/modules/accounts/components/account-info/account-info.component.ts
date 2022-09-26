import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
@Component({
  selector: 'ob-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountInfoComponent {
  @Input() account: any = {};

  constructor() {}
}
