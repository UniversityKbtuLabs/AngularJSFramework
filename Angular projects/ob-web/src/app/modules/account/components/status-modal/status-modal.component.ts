import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { thousandsSeparator } from '@app/core/helpers';
import { HelperService } from '@app/core/services/helper.service';
import moment from 'moment';
import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'ob-status-modal',
  templateUrl: './status-modal.component.html',
  styleUrls: ['./status-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusModalComponent implements OnInit {
  showDetails: boolean[] = [];
  result: any = [];
  title: any = '';
  status: any = '';

  constructor(
    private bsModalRef: BsModalRef,
    private modalOptions: ModalOptions,
    public helperService: HelperService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.result = this.modalOptions?.initialState?.content;
    this.title = this.modalOptions?.initialState?.title;
    this.status = this.modalOptions?.initialState?.status;
  }
  ngOnInit(): void {
    this.title = this.initTitle();
    this.initShowDetails();
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  initTitle() {
    switch (this.title) {
      case 'Арестован':
        return 'Причины ареста';
      default:
        return this.title;
    }
  }

  initShowDetails() {
    for (let i = 0; i < this.result.length; i++) {
      this.showDetails.push(false);
    }
  }
  changeShowDetails(index: number) {
    this.showDetails[index] = !this.showDetails[index];
  }

  formatCurrency(currency: string) {
    return this.helperService.formatCurrency(currency);
  }

  formatDate(date: string) {
    let currentDate = moment(date).format('DD.MM.YYYY');
    return currentDate;
  }

  getFormattedActualBalance(amount: any) {
    return thousandsSeparator(amount);
  }
}
