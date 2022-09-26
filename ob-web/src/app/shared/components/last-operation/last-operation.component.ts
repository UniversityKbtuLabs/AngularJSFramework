import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { checkIsAnotherDay, getIn, transformDraft } from '@core/helpers';
import { ITableRows } from '@data/models/account-history-types';
import { ConstantTranslationsService } from '@core/services/constant-translations.service';
import { TableModalComponent } from '@modules/account-history/components/table-modal/table-modal.component';
import { AccountHistoryService } from '@core/services/account-history.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'ob-last-operation',
  templateUrl: './last-operation.component.html',
  styleUrls: ['./last-operation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LastOperationComponent extends SubscriptionAccumulator {
  @Input() operation: any = null;
  modalRef?: BsModalRef;

  constructor(
    private constantTranslationsService: ConstantTranslationsService,
    private accountHistoryService: AccountHistoryService,
    private modalService: BsModalService
  ) {
    super();
  }

  setRowOperationType(): string {
    if (
      this.operation.knpCode === '342' &&
      this.operation.documentType === 'PAY_ORDER_V2'
    ) {
      return this.constantTranslationsService.PAY_BETWEEN_ACCOUNTS;
    } else {
      switch (this.operation.documentType) {
        case 'ACCOUNT_CREATE':
          return this.constantTranslationsService.ACCOUNT_CREATE;
        case 'BLANK_GUARANTEE':
          return this.constantTranslationsService.BLANK_GUARANTEE;
        case 'CURRENCY_CONTRACT_CHANGE':
          return this.constantTranslationsService.CURRENCY_CONTRACT_CHANGE;
        case 'CURRENCY_CONTRACT_REGISTRATION':
          return this.constantTranslationsService
            .CURRENCY_CONTRACT_REGISTRATION;
        case 'CURRENCY_CONTROL_DOCUMENT':
          return this.constantTranslationsService.CURRENCY_CONTROL_DOCUMENT;
        case 'CURR_EXCHANGE_FX':
          return this.constantTranslationsService.CURR_EXCHANGE_FX;
        case 'CURR_EXCHANGE_V2':
          return this.constantTranslationsService.CURR_EXCHANGE_V2;
        case 'CURR_ORDER_RUBLE':
          return this.constantTranslationsService.CURR_ORDER_RUBLE;
        case 'CURR_ORDER_V2':
          return this.constantTranslationsService.CURR_ORDER_V2;
        case 'CORPORATE_CARDS_DEACTIVATE_RISK':
          return this.constantTranslationsService
            .CORPORATE_CARDS_DEACTIVATE_RISK;
        case 'CURRENCY_MAIL_TO_BANK':
          return this.constantTranslationsService.CURRENCY_MAIL_TO_BANK;
        case 'CREDIT_EARLY_REPAYMENT':
          return this.constantTranslationsService.CREDIT_EARLY_REPAYMENT;
        case 'CURR_EXCHANGE_FX_CASH':
          return this.constantTranslationsService.CURR_EXCHANGE_FX_CASH;
        case 'CURR_ORDER_INNER':
          return this.constantTranslationsService.CURR_ORDER_INNER;
        case 'CORP_CARD_ISSUE':
          return this.constantTranslationsService.CORP_CARD_ISSUE;
        case 'CURR_ORDER_CARDS':
          return this.constantTranslationsService.CURR_ORDER_CARDS;
        case 'CRED_LIMIT_REQUEST':
          return this.constantTranslationsService.CRED_LIMIT_REQUEST;
        case 'CASHOUT':
          return this.constantTranslationsService.CASHOUT;
        case 'DEPOSIT_OPEN':
          return this.constantTranslationsService.DEPOSIT_OPEN;
        case 'DEPOSIT_PARTRETURN':
          return this.constantTranslationsService.DEPOSIT_PARTRETURN;
        case 'DEPOSIT_REFILL':
          return this.constantTranslationsService.DEPOSIT_REFILL;
        case 'DEBT_INFO':
          return this.constantTranslationsService.DEBT_INFO;
        case 'DP_CRT':
          return this.constantTranslationsService.DP_CRT;
        case 'GUARANTEE_COVERED_HALYK':
          return this.constantTranslationsService.GUARANTEE_COVERED_HALYK;
        case 'PAY_BUDGET':
          return this.constantTranslationsService.PAY_BUDGET;
        case 'PAY_MEDICAL_INSURANCE':
          return this.constantTranslationsService.PAY_MEDICAL_INSURANCE;
        case 'PAY_ORDER_V2':
          return this.constantTranslationsService.PAY_ORDER_V2;
        case 'PAY_PENSION_V2':
          return this.constantTranslationsService.PAY_PENSION_V2;
        case 'PAY_SALARY_V2':
          return this.constantTranslationsService.PAY_SALARY_V2;
        case 'PAY_SOCIAL_V2':
          return this.constantTranslationsService.PAY_SOCIAL_V2;
        case 'PAY_INSURANCE':
          return this.constantTranslationsService.PAY_INSURANCE;
        case 'PAY_BY_PHONE':
          return this.constantTranslationsService.PAY_BY_PHONE;
        case 'PAY_ORDER_DAMU':
          return this.constantTranslationsService.PAY_ORDER_DAMU;
        case 'PAY_ORDER_CARDS':
          return this.constantTranslationsService.PAY_BETWEEN_ACCOUNTS;
        case 'MAIL_TO_BANK_V2':
          return this.constantTranslationsService.MAIL_TO_BANK_V2;
        case 'TCR':
          return this.constantTranslationsService.TCR;
        case 'TEMPLATE_PAY_ORDER_V2':
          return this.constantTranslationsService.TEMPLATE_PAY_ORDER_V2;
        case 'PAY_P2P':
          return this.constantTranslationsService.PAY_P2P;
        case 'PAY_TO_CARD':
          return this.constantTranslationsService.PAY_BETWEEN_ACCOUNTS;
        default:
          return this.operation.documentType;
      }
    }
  }
}
