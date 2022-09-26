import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ConstantTranslationsService {
  public ACCOUNT_CREATE: string = 'operations.type.ACCOUNT_CREATE';
  public CURRENCY_CONTRACT_CHANGE: string =
    'operations.type.CURRENCY_CONTRACT_CHANGE';
  public CURRENCY_CONTRACT_REGISTRATION: string =
    'operations.type.CURRENCY_CONTRACT_REGISTRATION';
  public CURRENCY_CONTROL_DOCUMENT: string =
    'operations.type.CURRENCY_CONTROL_DOCUMENT';
  public CURR_EXCHANGE_FX: string = 'operations.type.CURR_EXCHANGE_FX';
  public CURR_EXCHANGE_V2: string = 'operations.type.CURR_EXCHANGE_V2';
  public CURR_ORDER_RUBLE: string = 'operations.type.CURR_ORDER_RUBLE';
  public CURR_ORDER_V2: string = 'operations.type.CURR_ORDER_V2';
  public CORPORATE_CARDS_DEACTIVATE_RISK: string =
    'operations.type.CORPORATE_CARDS_DEACTIVATE_RISK';
  public CURRENCY_MAIL_TO_BANK: string =
    'operations.type.CURRENCY_MAIL_TO_BANK';
  public CREDIT_EARLY_REPAYMENT: string =
    'operations.type.CREDIT_EARLY_REPAYMENT';
  public CURR_EXCHANGE_FX_CASH: string =
    'operations.type.CURR_EXCHANGE_FX_CASH';
  public CURR_ORDER_INNER: string = 'operations.type.CURR_ORDER_INNER';
  public CORP_CARD_ISSUE: string = 'operations.type.CORP_CARD_ISSUE';
  public CURR_ORDER_CARDS: string = 'operations.type.CURR_ORDER_CARDS';
  public CRED_LIMIT_REQUEST: string = 'operations.type.CRED_LIMIT_REQUEST';
  public CASHOUT: string = 'operations.type.CORPORATE_CARDS_DEACTIVATE_RISK';
  public DEPOSIT_OPEN: string = 'operations.type.DEPOSIT_OPEN';
  public DEPOSIT_PARTRETURN: string = 'operations.type.DEPOSIT_PARTRETURN';
  public DEPOSIT_REFILL: string = 'operations.type.DEPOSIT_REFILL';
  public DEBT_INFO: string = 'operations.type.DEBT_INFO';
  public DP_CRT: string = 'operations.type.DP_CRT';
  public GUARANTEE_COVERED_HALYK: string =
    'operations.type.GUARANTEE_COVERED_HALYK';
  public PAY_BUDGET: string = 'operations.type.PAY_BUDGET';
  public PAY_MEDICAL_INSURANCE: string =
    'operations.type.PAY_MEDICAL_INSURANCE';
  public PAY_ORDER_V2: string = 'operations.type.PAY_ORDER_V2';
  public PAY_PENSION_V2: string = 'operations.type.PAY_PENSION_V2';
  public PAY_SALARY_V2: string = 'operations.type.PAY_SALARY_V2';
  public PAY_SOCIAL_V2: string = 'operations.type.PAY_SOCIAL_V2';
  public PAY_INSURANCE: string = 'operations.type.PAY_INSURANCE';
  public PAY_BY_PHONE: string = 'operations.type.PAY_BY_PHONE';
  public PAY_ORDER_DAMU: string = 'operations.type.PAY_ORDER_DAMU';
  public PAY_ORDER_CARDS: string = 'operations.type.PAY_ORDER_CARDS';
  public MAIL_TO_BANK_V2: string = 'operations.type.MAIL_TO_BANK_V2';
  public TCR: string = 'operations.type.TCR';
  public TEMPLATE_PAY_ORDER_V2: string =
    'operations.type.TEMPLATE_PAY_ORDER_V2';
  public BLANK_GUARANTEE: string = 'operations.type.BLANK_GUARANTEE';
  public PAY_TO_ACCOUNT: string = 'operations.type.PAY_TO_ACCOUNT';
  public PAY_P2P: string = 'operations.type.PAY_P2P';
  public PAY_TO_CARD: string = 'operations.type.PAY_TO_CARD';
  public PAY_BETWEEN_ACCOUNTS: string = 'operations.type.PAY_BETWEEN_ACCOUNTS';

  public amount: string = 'operations.default.amount';
  public docNum: string = 'operations.payment-confirmation.doc-number';
  public date: string = 'operations.payment-confirmation.time';
  public accountSender: string = 'operations.default.withdrawal-account';
  public accountRecipient: string =
    'operations.payment-confirmation.receiver-account';

  //operation statuses
  public needSign: string = 'operations.status.needSign';
  public signed: string = 'operations.status.signed';

  constructor() {}
}
