import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { successMessage, thousandsSeparator } from '@app/core/helpers';
import { HelperService } from '@app/core/services/helper.service';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ob-modal-savings-info',
  templateUrl: './modal-savings-info.component.html',
  styleUrls: ['./modal-savings-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalSavingsInfoComponent implements OnInit {
  @Input() data: any;
  public type = 'credit';
  public infoCopy = '';
  public copyNotification = '';

  namingLabel = '';
  openDateLabel = '';
  contractNumLabel = '';
  creditAmountLabel = '';
  rewardRateLabel = '';
  currencyLabel = '';
  endDateLabel = '';

  public smsGreetings: string;
  public smsTheme: string;
  public sending_requisites: string;

  constructor(
    private modalOptions: ModalOptions,
    private bsModalService: BsModalService,
    public helperService: HelperService,
    private toastr: ToastrService,
    public translate: TranslateService
  ) {
    this.data = modalOptions?.initialState?.data;
    this.copy = this.copy.bind(this);
    this.openMail = this.openMail.bind(this);
  }

  ngOnInit(): void {
    this.getTranslation();
    this.infoCopy = this.copyInfoText(this.type);
  }

  getTranslation() {
    this.translate
      .get([
        'requisites.greeting',
        'requisites.my-requisites',
        'requisites.action_sending_requisites',
        'toast-messages.success.copiedToBuffer',
        'default.naming',
        'products.default.open-date',
        'products.default.contract-number',
        'products.default.credit-amount',
        'acccountSavings.deposit.rewardRate',
        'default.currency',
        'products.default.end-date',
      ])
      .subscribe(translations => {
        this.smsGreetings = translations['requisites.greeting'];
        this.smsTheme = translations['requisites.my-requisites'];
        this.sending_requisites =
          translations['requisites.action_sending_requisites'];
        (this.copyNotification =
          translations['toast-messages.success.copiedToBuffer']),
          (this.namingLabel = translations['default.naming']),
          (this.openDateLabel = translations['products.default.open-date']),
          (this.contractNumLabel =
            translations['products.default.contract-number']),
          (this.creditAmountLabel =
            translations['products.default.credit-amount']),
          (this.rewardRateLabel =
            translations['acccountSavings.deposit.rewardRate']),
          (this.currencyLabel = translations['default.currency']),
          (this.endDateLabel = translations['products.default.end-date']);
      });
  }

  closeModal() {
    this.bsModalService.hide(1);
  }

  copy() {
    navigator.clipboard
      .writeText(this.infoCopy)
      .then(() => successMessage(this.copyNotification, this.toastr));
  }

  copyInfoText(type: string): string {
    const data = this.data;
    if (type === 'credit') {
      return `${data.purName ? `${this.namingLabel}: ${data.purName} \n` : ''}${
        data.fromDate ? `${this.openDateLabel}: ${data.fromDate} \n` : ''
      }${data.number ? `${this.contractNumLabel}: ${data.number} \n` : ''}${
        data.sdok ? `${this.creditAmountLabel}: ${data.sdok} \n` : ''
      }${data.gesv ? `${this.rewardRateLabel}: ${data.gesv}% \n` : ''}${
        data.valCode ? `${this.currencyLabel}: ${data.valCode} \n` : ''
      }${data.toDate ? `${this.endDateLabel}: ${data.toDate} \n` : ''}`;
    } else {
      return '';
    }
  }

  formatDate(date: string) {
    let newDate = date.split('.');
    let yyyy = Number(newDate[2]);
    let mm = Number(newDate[1]) - 1;
    let dd = Number(newDate[0]);

    let formattedDate = moment(new Date(yyyy, mm, dd)).format('LL');
    return formattedDate;
  }

  formatAmount(amount: any) {
    if (amount) {
      return thousandsSeparator(amount);
    } else {
      return '0';
    }
  }

  capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  openMail() {
    window.location.href = `mailto:?subject=${encodeURIComponent(
      `${this.smsTheme}`
    )}
		&body=${encodeURIComponent(`${this.smsGreetings}.`)}${encodeURIComponent(
      `\n\n${this.sending_requisites}.\n\n`
    )}${encodeURIComponent(this.infoCopy)}`;
  }
}
