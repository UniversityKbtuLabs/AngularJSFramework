import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FXOpenAccountModalComponent } from '@shared/modal_windows/f-x-open-account-modal/f-x-open-account-modal.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FXEditTradingSignalModalComponent } from '@shared/modal_windows/f-x-edit-trading-signal-modal/f-x-edit-trading-signal-modal.component';
import { OperationsService } from '@core/services/operations.service';
import { HelperService } from '@core/services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { successMessage, errorMessage } from '@app/core/helpers';

@Component({
  selector: 'ob-fx-trading-signal-table',
  templateUrl: './fx-trading-signal-table.component.html',
  styleUrls: ['./fx-trading-signal-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FXTradingSignalTableComponent implements OnInit {
  @ViewChild('dropdown') dropdown: ElementRef;
  modalRef: BsModalRef;
  tradingSignalsList: any[] = [];
  tradingSignalsListLoading: boolean = false;
  showTradingSignalActionsDropdawn: boolean[] = [];

  constructor(
    private modalService: BsModalService,
    private operationsService: OperationsService,
    private helperService: HelperService,
    private changeDetector: ChangeDetectorRef,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.getTradingSignalsList();
  }

  getTradingSignalsList() {
    this.operationsService.fxTradingSignals.subscribe((value: any[]) => {
      this.showTradingSignalActionsDropdawn = new Array(value.length).fill(
        false
      );
      this.tradingSignalsList = value;
      this.changeDetector.detectChanges();
    });
  }

  getTradingSignalsListLoading() {
    this.operationsService.fxTradingSignalsLoading.subscribe(
      (value: boolean) => {
        this.tradingSignalsListLoading = value;
        this.changeDetector.detectChanges();
      }
    );
  }

  deleteSignal(id: string | number) {
    this.operationsService.deleteFXTradingSignal(id).subscribe(
      value => {
        successMessage('Сигнал успешно удален', this.toastrService);
      },
      error => {
        errorMessage(error, this.toastrService);
      }
    );
  }

  openEditSignalModal() {
    let initialState = {};
    this.modalRef = this.modalService.show(FXEditTradingSignalModalComponent, {
      class: 'edit_fx_trading_signal_modal',
      id: 1,
      initialState,
      ignoreBackdropClick: false,
    });
  }

  formatCurrency(currency: string) {
    return this.helperService.formatCurrency(currency);
  }

  getDate(date: string): string {
    if (date) {
      let dateHelper = date.split(' ')[0];
      let timeHelper = date.split(' ')[1];
      let days = Number(dateHelper.split('-')[2]);
      let months = this.helperService
        .getMonth(dateHelper.split('-')[1])
        .substr(0, 3);
      let hours = timeHelper.split(':')[0];
      let minutes = timeHelper.split(':')[1];
      return days + ' ' + months + ' ' + hours + ':' + minutes;
    } else {
      return '';
    }
  }

  showItemDropdown(i: number) {
    for (
      let index: number = 0;
      index < this.showTradingSignalActionsDropdawn.length;
      index++
    ) {
      if (index === i) {
        this.showTradingSignalActionsDropdawn[index] =
          !this.showTradingSignalActionsDropdawn[index];
      } else {
        this.showTradingSignalActionsDropdawn[index] = false;
      }
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onGlobalClick(event: any): void {
    if (
      !this.dropdown.nativeElement.innerHTML.includes(event.target.innerHTML) ||
      event.target.innerHTML === ''
    ) {
      for (
        let i: number = 0;
        i < this.showTradingSignalActionsDropdawn.length;
        i++
      ) {
        this.showTradingSignalActionsDropdawn[i] = false;
      }
    }
  }
}
