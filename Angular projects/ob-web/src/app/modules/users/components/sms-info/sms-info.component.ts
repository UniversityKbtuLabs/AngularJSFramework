import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'ob-sms-info',
  templateUrl: './sms-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmsInfoComponent {
  constructor(public bsModalRef: BsModalRef) {}
}
