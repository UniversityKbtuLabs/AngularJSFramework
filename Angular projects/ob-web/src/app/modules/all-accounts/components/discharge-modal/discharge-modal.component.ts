/* eslint-disable max-len */
import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';

import { AccountsService } from '@core/services/accounts.service';
import { HelperService } from '@core/services/helper.service';
import moment from 'moment';
import { statementRequestDateFormat } from '@app/core/constants';
import {
  GET_ACCOUNT_STATEMENTS_PDF,
  GET_ACCOUNT_STATEMENTS_XLS,
  GET_CARD_STATEMENTS_PDF,
  GET_CARD_STATEMENTS_XLSX,
  GET_DEPOSIT_STATEMENTS_PDF,
} from '@app/core/constants/apiUrls';

const cards = {
  xls: GET_CARD_STATEMENTS_XLSX,
  pdf: GET_CARD_STATEMENTS_PDF,
};
const accounts = {
  xls: GET_ACCOUNT_STATEMENTS_XLS,
  pdf: GET_ACCOUNT_STATEMENTS_PDF,
};

const deposit = {
  xls: GET_DEPOSIT_STATEMENTS_PDF, // TODO XLS ROUTE
  pdf: GET_DEPOSIT_STATEMENTS_PDF,
};

const reportUrl: { [key: string]: { [key: string]: string } } = {
  cards: cards,
  card: cards,
  accounts: accounts,
  account: accounts,
  deposit: deposit,
};

@Component({
  selector: 'ob-discharge-modal',
  templateUrl: './discharge-modal.component.html',
  styleUrls: ['./discharge-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DischargeModalComponent {
  public minDate = new Date();
  public maxDate = new Date();
  public operationDate: Date[];
  public selectedDate: string = '';
  public selectedFormat: string = 'pdf';
  public comissionOff: boolean = false;
  public type: any = '';
  public accountsList: any = [];
  public iban: unknown;
  public selectedAccount: any;
  public countragent: string;
  public click: boolean = false;
  public format: string = 'yyyy-MM-dd HH:mm:ss';
  public error: string = '';

  public filterDateList = [
    { code: 'month', label: this.translate.instant('general.time.month') },
    {
      code: 'half-year',
      label: this.translate.instant('general.time.half-year'),
    },
    { code: 'year', label: this.translate.instant('general.time.year') },
  ];

  public formatList = [
    { code: 'pdf', label: 'PDF' },
    { code: 'xls', label: 'Excel' },
    // { code: '1C', label: '1C' },
    // { code: 'mt', label: 'MT' },
  ];

  constructor(
    public bsModalRef: BsModalRef,
    public modalOptions: ModalOptions,
    private translate: TranslateService,
    public accountService: AccountsService,
    public changeDetector: ChangeDetectorRef,
    public helperService: HelperService,
    private router: Router
  ) {
    this.type = this.modalOptions?.initialState?.type;
    this.iban = this.modalOptions?.initialState?.iban;
    this.accountsList = this.modalOptions?.initialState?.accountsList;
    this.minDate.setMonth(this.minDate.getMonth() - 1);
    this.operationDate = [this.minDate, this.maxDate];
    this.getDischarge = this.getDischarge.bind(this);
  }

  closeModal() {
    this.bsModalRef.hide();
    this.click = false;
  }

  changeSelectedDate(value: string) {
    let d = new Date();

    if (value === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (value === 'half-year') {
      d.setMonth(d.getMonth() - 6);
    } else if (value === 'year') {
      d.setFullYear(d.getFullYear() - 1);
    }

    this.operationDate = [d, new Date()];
  }

  changeSelectedFormat = (value: string) => (this.selectedFormat = value);

  getAccountsList() {
    if (this.type !== 'cards') {
      return this.accountsList;
    } else {
      const newAccList: any = [];
      Object.keys(this.accountsList)?.forEach((account: any) => {
        this.accountsList[account][0].links.forEach((nestedAccount: any) => {
          newAccList.push(nestedAccount);
        });
      });

      return newAccList;
    }
  }

  getAccountInfo(acc: any) {
    let info = {
      title: '',
      description: '',
      key: '',
    };

    if (this.type === 'accounts') {
      info.title = acc.accountInfo;
      info.description =
        this.helperService.formatAmount(acc.amount) +
        ' ' +
        this.helperService.formatCurrency(acc.currency);
      info.key = acc.accountInfo;
    } else if (this.type === 'deposits') {
      info.title = acc.depositAccount;
      info.description =
        this.helperService.formatAmount(acc.amount) +
        ' ' +
        this.helperService.formatCurrency(acc.currency);
    } else if (this.type === 'cards') {
      info.title = acc.name;
      info.description =
        this.helperService.formatAmount(acc.amount) +
        ' ' +
        this.helperService.formatCurrency(acc.currency);
      info.key = acc.contractId;
    }

    return info;
  }

  getImage(acc: any) {
    return this.helperService.getAccountIcon(
      acc.currency,
      acc.active,
      this.type
    );
  }

  download(params: any) {
    // this.accountService.getStatementsReport(params).subscribe(
    // 	(response: HttpResponse<any>) => {
    // 		this.formatToPdf(response)
    // 	},
    // 	(err: any) => {
    // 		this.error = err.messages?.[0] || 'Ошибка на сервере'
    // 		this.changeDetector.detectChanges()
    // 	}
    // )
  }

  formatToPdf(response: HttpResponse<any>) {
    const a = document.createElement('a');
    const objURL = URL.createObjectURL(response.body);
    a.href = objURL;
    const fileName = `${this.translate.instant(
      'operations.default.accountStatement'
    )}.${this.selectedFormat}`;
    a.setAttribute('download', `${fileName}`);
    a.click();
    URL.revokeObjectURL(objURL);
    this.closeModal();
  }

  getDischarge() {
    const url = this.router.url.split('/');
    this.click = true;
    const params: any = {
      dateStart: moment(this.operationDate[0]).format(
        statementRequestDateFormat
      ),
      dateEnd: moment(this.operationDate[1]).format(statementRequestDateFormat),
      account: this.type === 'accounts' ? this.selectedAccount : this.iban,
      type: this.type,
      format: this.selectedFormat,
      countragent: this.countragent,
      contractId: url[url.length - 1],
      rootContractId: null,
      level: 1,
      currency: null,
      orderASC: false,
      url: reportUrl[this.type][this.selectedFormat],
    };
    // TODO закрыто скачивание депозитов
    if (params.account && this.type === 'account') {
      this.download(params);
    }
    if (params.contractId && this.type === 'card') {
      this.download(params);
    }
  }
}
