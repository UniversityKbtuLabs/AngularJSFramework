import { Component, ChangeDetectionStrategy } from '@angular/core';
// import { TranslateService } from '@ngx-translate/core'
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'ob-certificate-hint-modal',
  templateUrl: './certificate-hint-modal.component.html',
  styleUrls: ['./certificate-hint-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificateHintModalComponent {
  constructor(
    // private translate: TranslateService,
    private bsModalRef: BsModalRef
  ) {}

  closeModal() {
    this.bsModalRef.hide();
  }
}
