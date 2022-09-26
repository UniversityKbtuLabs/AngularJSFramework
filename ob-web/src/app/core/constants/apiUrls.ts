export const OPERATIONS_PREFILL =
  '/document-gateway/documents/pay-order/pre-fill/default';
export const GET_KNP_BY_CODE = '/document-service/dictionaries/search-knp';
export const PAY_PENSION = '/document-service/documents/pay-pension/send';

export const GET_EXCHANGE = '/fx-gateway/rates/client/top';
export const GET_SALARY_UNICODES =
  '/document-gateway/documents/pay-salary/get-unicodes';

export const GET_ACCOUNT_BY_ID =
  '/account-gateway/accounts/current-account-with-balance';
export const GET_CARD_BY_ID =
  '/account-gateway/corp-cards/current-corp-contracts';
export const GET_DEPOSIT_BY_ID = '/account-gateway/accounts/savings-accounts'; // DEPOSIT
export const GET_LOAN_DETAILS =
  '/document-gateway/documents/credit/loan/detail';
export const GET_LOAN_PAYMENT_INFO =
  '/document-gateway/documents/credit/payments-info';
export const GET_LOAN_LINE = '/document-gateway/documents/credit/line/detail';
export const CONTRACTS_V2 =
  '/account-service/corp-cards/current-corp-contracts'; // not used
export const CURRENT_ACCOUNTS_BALANCED =
  '/account-gateway/accounts/current-accounts-with-balance-v2';
export const GET_SAVED_CARDS = '/document-service/p2p/get-saved-cards';

export const GET_DOCUMENTS_LIST =
  '/document-gateway/documents/sent-docs/get-all-documents';
export const DELETE_DOCUMENTS =
  '/document-gateway/documents/sent-docs/delete-document';
export const GET_PRODUCT_DOCUMENTS =
  '/document-gateway/documents/sent-docs/get-product-documents';
export const GET_CURRENCY_CONTRACTS =
  '/document-gateway/dictionaries/currcontrol/search-unk-contracts';
// export const DELETE_DOCUMENTS = '/document-gateway/documents/sent-docs/delete-document?idList={id}'
export const SIGN_DOCUMENTS =
  '/document-gateway/signatures/sign-by-app-or-sms-code';
export const GET_PAYMENT_DRAFT_LIST =
  '/document-gateway/documents/saved-docs/get-payments';
export const DELETE_DRAFT_DOCUMENTS =
  '/document-gateway/documents/saved-docs/delete-document';
export const GET_SIGN_DOCUMENTS_QUANTITY =
  '/document-gateway/documents/sent-docs/count-documents-for-sign';
export const GET_SIGNERS_INFO = '/oauth2-gateway/users/signers-info';
export const GET_SIGNING_HISTORY =
  '/document-gateway/documents/sent-docs/get-document-sign';

export const GET_BANK_BY_ISSUER_IDENTIFICATION_NUMBER =
  '/document-gateway/dictionaries/get-bank-by-issuer-identification-number';

export const SEND_BY_SMS_CODE = '/p2p/send-by-sms-code';
export const SEND_BY_APP_CODE = '/p2p/send-by-app-code';
export const SEND_SIGN_P2P = '/p2p-gateway/send-by-app-or-sms-code/async';
export const GET_SMS = '/oauth2-gateway/authentication/get-sms/';
export const GET_STAFF_LIST = '/document-gateway/dictionaries/staff/list';
export const ADD_NEW_STAFF = '/document-gateway/dictionaries/staff/save';
export const EDIT_STAFF = '/document-gateway/dictionaries/staff/update';
export const DELETE_STAFF = '/document-gateway/dictionaries/staff/delete';
export const DELETE_BY_ID_STAFF =
  '/document-gateway/dictionaries/staff/delete-by-id';
export const DELETE_BY_ID_STAFF_LIST =
  '/document-gateway/dictionaries/staff/delete-by-id-list';
export const UPLOAD_PAYMENT = '/document-gateway/documents/import-payment/1c';

export const GET_SOCIAL_PAYMENT_BY_ID =
  '/document-gateway/documents/pay-social/get-payment-by-id';
export const GET_SALARY_PAYMENT_BY_ID =
  '/document-gateway/documents/pay-salary/get-payment-by-id';
export const GET_PENSION_PAYMENT_BY_ID =
  '/document-gateway/documents/pay-pension/get-payment-by-id';
export const GET_ORDER_PAYMENT_BY_ID =
  '/document-gateway/documents/pay-order/get-payment-by-id';
export const GET_BUDGET_PAYMENT_BY_ID =
  '/document-gateway/documents/pay-budget/get-payment-by-id';
export const GET_EXCHANGE_BY_ID =
  '/document-gateway/documents/curr-exchange/fx/get-by-id';

export const GET_PAY_TO_CARD_BY_ID =
  '/document-gateway/documents/pay-to-card/get-payment-by-id';
export const GET_CURR_ORDER_V2_BY_ID =
  '/document-gateway/documents/curr_order_v2/get-payment-by-id';
export const GET_PAY_ORDER_CARDS_BY_ID =
  '/document-gateway/documents/pay-order-from-card/get-payment-by-id';
export const GET_PAY_TO_ACCOUNTS_BY_ID =
  '/document-gateway/documents/pay-order/get-payment-by-id';
export const GET_PAY_TO_PAY_BY_ID = '/document-gateway/p2p/get-payment-by-id?';

export const GET_SIGNERS =
  '/document-gateway/dictionaries/search-client-signers-accountant';
export const GET_ACCOUNT_STATEMENTS =
  '/account-gateway/statements/statements-by-account';
export const GET_ACCOUNT_BALANCE =
  '/account-gateway/accounts/search-statement-balance';
export const GET_CARD_STATEMENTS =
  '/account-gateway/statements/statements-by-corp-contract';
export const GET_DEPOSIT_STATEMENTS =
  '/account-gateway/statements/deposit-statements';

export const GET_FULL_INFO_BY_IIN_FROM_GBDFL =
  '/document-gateway/dictionaries/get-person-info-by-iin-from-kgd';

export const GET_SOCIAL_PAYMENT_PDF_REPORT =
  '/document-gateway/documents/pay-social/get-paymentreport-by-id';
export const GET_SALARY_PAYMENT_PDF_REPORT =
  '/document-gateway/documents/pay-salary/get-paymentreport-by-id';
export const GET_PENSION_PAYMENT_PDF_REPORT =
  '/document-gateway/documents/pay-pension/get-paymentreport-by-id';
export const GET_ORDER_PAYMENT_PDF_REPORT =
  '/document-gateway/documents/pay-order/get-paymentreport-by-id';
export const GET_BUDGET_PAYMENT_PDF_REPORT =
  '/document-gateway/documents/pay-budget/get-paymentreport-by-id';
export const GET_TRANSFER_ACCOUNT_PAYMENT_PDF_REPORT =
  '/document-gateway/documents/pay-local/get-paymentreport-by-id';
export const GET_TRANSFER_ACCOUNT_PAYMENT_CARD_PDF_REPORT =
  '/document-gateway/documents/pay-to-card/get-paymentreport-by-id';
export const GET_TRANSFER_CARD_ACCOUNT_PAYMENT_PDF_REPORT =
  '/document-gateway/documents/pay-order-from-card/get-paymentreport-by-id';
export const GET_TRANSFER_CARD_PAYMENT_PDF_REPORT =
  '/document-gateway/documents/p2p/get-paymentreport-by-id';
export const GET_FX_EXCHANGE_PDF_REPORT =
  '/document-gateway/documents/curr-exchange/fx/get-report-by-id';
export const GET_ACCOUNT_PDF_REPORT =
  '/account-gateway/statements/statement/report';

export const GET_ACCOUNTS =
  '/account-gateway/accounts/current-accounts-with-balance-v2';
export const GET_CARDS = '/account-gateway/corp-cards/current-corp-contracts';
export const GET_DEPOSITS = '/account-gateway/accounts/savings-accounts';
export const GET_LIMITED_DEPOSITS =
  '/account-gateway/accounts/savings-accounts-limit?pageSize=3';
export const GET_DEPOSITS_PREFILL =
  '/document-gateway/documents/deposit-request/pre-fill/default?version=1';
export const OPEN_DEPOSIT = '/document-gateway/documents/deposit-request/send';
export const GET_DEPOSIT_REWARD =
  '/document-gateway/documents/deposit-request/get-deposit-reward-info';
export const GET_LOANS = '/document-gateway/documents/credit/loans';
export const GET_LIMITED_LOANS =
  '/document-gateway/documents/credit/loans-limit?pageSize=3';

export const POST_STATEMENTS_REFRESH =
  '/account-gateway/statements/statements-by-account/refresh';

export const GET_ACCOUNT_STATEMENTS_PDF =
  '/account-gateway/statements/statements-by-account/report';
export const GET_ACCOUNT_STATEMENTS_XLS =
  '/account-gateway/statements/statements-by-account/report/xls';
export const GET_ACCOUNT_BLOCKED_INFO =
  '/account-gateway/accounts/account-blocked-info';
export const GET_DEPOSIT_STATEMENTS_PDF =
  '/account-gateway/statements/deposit-statements/report';
export const GET_ACCOUNT_STATEMENTS_C1 =
  '/account-gateway/statements/statements-by-account/report/1c';
export const GET_ACCOUNT_STATEMENTS_МТ940 =
  '/account-gateway/statements/statements-by-account/report/mt940';

export const GET_CARD_STATEMENTS_PDF =
  '/account-gateway/statements/statements-by-corp-contract/report';
export const GET_CARD_STATEMENTS_XLSX =
  '/account-gateway/statements/statements-by-corp-contract/report/xlsx';

export const GET_REQUISITES = '/account-gateway/accounts/accounts-info';
export const GET_REQUISITES_PDF =
  '/account-gateway/accounts/accounts-info/report';

export const GET_CARD_REQUISITES =
  '/account-gateway/corp-cards/get-root-corp-card-contract';
export const GET_CARD_REQUISITES_PDF =
  '/account-gateway/corp-cards/get-corp-card-requisites/report';

export const GET_HAS_RIGHTS_TO_SIGN =
  '/oauth2-gateway/users/has-rights-to-sign';

export const GET_SOCIAL_PAYMENT_BY_SAVED_ID =
  '/document-gateway/documents/pay-social/get-payment-by-saved-id';
export const GET_SALARY_PAYMENT_BY_SAVED_ID =
  '/document-gateway/documents/pay-salary/get-payment-by-saved-id';
export const GET_PENSION_PAYMENT_BY_SAVED_ID =
  '/document-gateway/documents/pay-pension/get-payment-by-saved-id';
export const GET_ORDER_PAYMENT_BY_SAVED_ID =
  '/document-gateway/documents/pay-order/get-payment-by-saved-id';
export const GET_BUDGET_PAYMENT_BY_SAVED_ID =
  '/document-gateway/documents/pay-budget/get-payment-by-saved-id';

export const GET_CREATE_ACCOUNT_PREFILL =
  '/document-gateway/account/create/pre-fill/default';
export const GET_CREATE_ACCOUNT_CURRENCIES =
  '/document-gateway/dictionaries/get-currencies-for-open-account';
export const GET_CREATE_ACCOUNT_DIVISIONS =
  '/document-gateway/dictionaries/get-all-dict-kkb-divisions';
export const SEND_CREATE_ACCOUNT = '/document-gateway/account/create/send';

export const GET_CONVERTATION_PREFILL =
  '/document-gateway/documents/curr-exchange/fx/pre-fill/default';

export const GET_EXCHANGE_PURPOSES =
  '/document-gateway/dictionaries/get-exchange-purposes';
export const GET_VALCON_CONTRACTS =
  '/document-gateway/dictionaries/get-valcon-contracts/all?types=CREDIT,CURRENCY';
export const GET_CURRENCY_CONTRACT_PARAMS =
  '/document-gateway/documents/curr-exchange/fx/get-currcontract-params';
export const CHECK_OPERDAY = '/fx-gateway/settings/check-operday';
export const VALIDATE_FX =
  '/document-gateway/documents/curr-exchange/fx/validate';
export const HANDSHAKE_CREATE = '/fx-gateway/handshake/create';
export const GET_DEPOSIT_INFORMATION_REPORT_BY_ID =
  '/document-gateway/documents/deposit-request/get-deposit-information-report-by-id';
export const GET_DEPOSIT_CONFROMATION_REPORT_BY_ID =
  '/document-gateway/documents/deposit-request/get-deposit-conformation-report-by-id';
export const GET_DEPOSIT_REQUEST_REPORT_BY_ID =
  '/document-gateway/documents/deposit-request/get-deposit-request-report-by-id';
export const GET_ACCOUNT_CREATE_BY_ID =
  '/document-gateway/account/create/get-report-by-id';

export const GET_DEPOSIT_REQUEST_BY_ID =
  '/document-gateway/documents/deposit-request/get-payment-by-id';
export const GET_DEPARTMENT_CITIES =
  '/document-gateway/dictionaries/department-cities';
export const GET_DEPARTMENT_ADDRESS_BY_CITY =
  '/document-gateway/dictionaries/department-address';
export const GET_DELIVERY_CITIES =
  '/document-gateway/dictionaries/delivery-cities';
export const SEND_CREATE_BUSINESS_CARD = '/document-gateway/corp-cards/issue';
export const GET_CORP_CARD_ISSUE_BY_ID =
  '/document-gateway/corp-cards/issue/get-by-id';
export const GET_CARD_ISSUE_APPLICATION =
  '/document-gateway/corp-cards/card-issue-doc-print';
export const GET_ACCOUNT_ISSUE_BY_ID =
  '/document-gateway/account/create/get-by-id';

// ECP signing URLS
export const GET_CHALLENGES = '/document-gateway/signatures/get-challenges';
export const GET_SIGN_BY_SIGNATURE =
  '/document-gateway/signatures/sign-by-signature';
// ECP login urls
export const GET_CHALLENGE = '/oauth2-gateway/authentication/get-challenge';
export const POST_VALIDATE_BY_SIGNATURE =
  '/oauth2-gateway/oauth2/auth/validate-by-signature';
export const GET_CURRENCY_TRANSFER_PREFILL =
  '/documents/curr-order/pre-fill/default';
export const GET_VALCON_CURRENCY_CONTRACTS =
  '/document-gateway/dictionaries/get-valcon-contracts/all?types=CURRENCY';
export const GET_OTP_PUSH = '/oauth2-gateway/authentication/send-otp-push';
// Сервеис проверки ОТП
export const POST_CHECK_OTP = '/oauth2-gateway/authentication/check-otp';

export const GET_TARIFFS_PACKAGE_CHARGE =
  '/account-gateway/tariffs/get-tariffs-package-charge-date';
export const GET_TARIFFS_PACKAGES_BY_CONTRACT_BY_GROUP =
  '/account-gateway/tariffs/get-tariffs-packages-by-contract-by-group';
export const GET_TARIFF_INFO_BY_ID =
  '/account-gateway/tariffs/get-tariff-additional-info-by-id';
export const SEND_CONNECT_TARIFF =
  '/account-gateway/tariffs/tariff-enable-with-account';
export const GET_TARIFF_STATISTICS =
  '/account-gateway/tariffs/get-tariffs-package-stat';

export const DISABLE_TARIFF = '/account-gateway/tariffs/tariff-disable';

// Currency contract registration
export const GET_CURRENCIES =
  '/document-gateway/dictionaries/currcontrol/search-currencies';
export const GET_CONTRACT_TYPES =
  '/document-gateway/dictionaries/currcontrol/transfer-contract-type';
export const GET_CONTRACT_SUBJECTS =
  '/document-gateway/dictionaries/currcontrol/transfer-contract-subject';
export const GET_FOREIGN_COUNTRIES =
  '/document-gateway/dictionaries/currcontrol/search-countries';
export const GET_THIRD_PARTY_COUNTRIES =
  '/document-gateway/dictionaries/currcontrol/contract-third-party';
export const GET_CONTRACT_FILIALS =
  '/document-gateway/dictionaries/get-all-dict-kkb-divisions';
export const POST_CURRENCY_CONTRACT =
  '/document-gateway/documents/curr-control/registration/send-with-files/v2';
export const GET_CURRENCY_CONTRACT_PREFILL =
  '/document-gateway/documents/curr-control/pre-fill/default';
