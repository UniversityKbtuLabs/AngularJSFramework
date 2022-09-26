import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  errorMessage,
  getNounByNumbers,
  getTariffColor,
  thousandsSeparator,
} from '@app/core/helpers';
import { SubscriptionAccumulator } from '@app/core/helpers/SubscriptionAccumulator';
import { AccountsService } from '@app/core/services/accounts.service';
import { HelperService } from '@app/core/services/helper.service';
import { LoginService } from '@app/core/services/login.service';
import { IAccountInfo } from '@app/data/models/account-types';
import { SmsModalComponent } from '@app/shared';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ob-connect-tariff',
  templateUrl: './connect-tariff.component.html',
  styleUrls: ['./connect-tariff.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectTariffComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  public connectTariffForm: FormGroup;
  public accountList: any[] = [];
  public tariffName: string;
  public tariffDetailsList: any;
  public tariffInfo: any;
  public mainInfo: any;
  public isAccountsLoading: boolean = false;
  public selectedInd = 0;
  public selectedItem: any;
  public isShowDescription: boolean = false;
  public emptyFieldsError = '';
  public rightsToSign: boolean = false;
  public modalRef?: BsModalRef;
  public isDetails: boolean = false;
  public tariffId: string;
  public isTariffGroupsLoading: boolean = false;
  public isDetailsLoading: boolean = false;
  public subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    public changeDetector: ChangeDetectorRef,
    public loginService: LoginService,
    private fb: FormBuilder,
    public toastr: ToastrService,
    public helperService: HelperService,
    public accountsService: AccountsService,
    private modalService: BsModalService,
    private router: Router,
    private translate: TranslateService
  ) {
    super();
    if (this.router.url.includes('details')) {
      this.isDetails = true;
    } else {
      this.isDetails = false;
    }
  }

  ngOnInit(): void {
    this.connectTariffForm = this.fb.group({
      selectedAccount: [null, Validators.required],
    });
    this.tariffName = this.route.snapshot.params['tariffName'];
    if (this.isDetails) {
      this.tariffId = this.route.snapshot.params['tariffId'];
    }
    this._getTariffsPackagesByContractByGroup();
    this.changeDetector.detectChanges();

    if (!this.isDetails) {
      this.addSubscriber(
        this.accountsService.accountsLoading$.subscribe({
          next: v => {
            this.isAccountsLoading = v;
            this.changeDetector.detectChanges();
          },
        })
      );
      this.accountsService.getAccountsList();
      this.addSubscriber(
        this.accountsService.currentAccounts.subscribe(
          (data: IAccountInfo[]) => {
            // Подписка на список тек счетов
            let kztAccounts = data.filter(
              acc => acc.currency === 'KZT' && acc.active === 'Y'
            ); // Фильтрация по Тенговым и Активынм счетам
            this.accountList = kztAccounts;
            this.selectAccount();
            this.changeDetector.detectChanges();
          }
        )
      );
    }
    this.getTranslations();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  _getTariffInfoById(id: number | string) {
    this.isDetailsLoading = true;
    this.changeDetector.detectChanges();
    this.subscriptions.push(
      this.loginService.getTariffInfoById(id).subscribe({
        next: (data: any) => {
          this.tariffDetailsList = data;
          this.isDetailsLoading = false;
          this.changeDetector.detectChanges();
        },
        error: (error: any) => {
          this.isDetailsLoading = false;
          this.changeDetector.detectChanges();
          errorMessage(error, this.toastr);
        },
      })
    );
  }

  _getTariffsPackagesByContractByGroup() {
    this.isTariffGroupsLoading = true;
    this.changeDetector.detectChanges();
    this.subscriptions.push(
      this.loginService.getTariffsPackagesByContractByGroup().subscribe({
        next: (data: any) => {
          this.mainInfo = data[this.tariffName][0];
          this.selectedItem = data[this.tariffName][0];
          if (this.isDetails) {
            this._getTariffInfoById(this.tariffId);
          } else {
            this.tariffInfo = [
              data[this.tariffName][0],
              ...data[this.tariffName]
                .slice(1)
                .sort((a: any, b: any) => b.period - a.period),
            ];
            this._getTariffInfoById(this.mainInfo.id);
          }
          this.isTariffGroupsLoading = false;
          this.changeDetector.detectChanges();
        },
        error: (error: any) => {
          this.isTariffGroupsLoading = false;
          this.changeDetector.detectChanges();
          errorMessage(error, this.toastr);
        },
      })
    );
  }

  getColor() {
    return getTariffColor(this.tariffName);
  }

  getDescriptionList() {
    return this.mainInfo?.description.split('\n');
  }

  getTextMonths(month: number) {
    return getNounByNumbers(month, ['месяц', 'месяца', 'месяцев']);
  }

  onPeriodSelect(ind: number, selectedItem: any) {
    this.selectedInd = ind;
    this.selectedItem = selectedItem;
    console.log(this.selectedInd);
    console.log(this.selectedItem);
    this._getTariffInfoById(selectedItem.id);
    this.changeDetector.detectChanges();
  }

  isFieldInvalid(field: string) {
    const formField = this.connectTariffForm.get(field);
    return (
      (!formField.valid && formField.touched && !formField.pristine) ||
      (!formField.valid && formField.dirty && !formField.pristine)
    );
  }

  displayFieldClass(field: string) {
    return { 'is-invalid': this.isFieldInvalid(field) };
  }

  getIcon(currency: string): string {
    return this.helperService.getAccountIcon(currency);
  }

  getFormattedAmount(amount: number) {
    if (amount && amount >= 0) {
      return thousandsSeparator(amount);
    } else {
      return '0,00';
    }
  }

  fieldsValidation() {
    const form = this.connectTariffForm;
    if (form.valid) {
      this.sendConnectTariff();
    } else {
      const allFields = Object.keys(form.controls);
      let emptyField: string;
      allFields.forEach(f => {
        if (!form.get(f).value && form.get(f).status === 'INVALID') {
          if (!emptyField) {
            emptyField = f;
          }
          form.get(f).markAsTouched();
          form.get(f).markAsDirty();
        }
      });
      if (emptyField) {
        document.getElementById(emptyField).focus();
        errorMessage({ message: this.emptyFieldsError }, this.toastr);
      }
    }
  }

  sendConnectTariff() {
    let body = {
      tariffId: this.selectedItem.id,
      accountId: this.connectTariffForm.controls.selectedAccount.value.dictId,
      source: 'WEB',
    };

    this.loginService.sendConnectTariff(body).subscribe({
      next: (data: any) => {
        if (data.body.status === 'OK') {
          this.confirmCreateAccount(true);
        } else {
          errorMessage({ message: data.body.message }, this.toastr);
        }
      },
      error: (error: any) => {
        errorMessage(error, this.toastr);
      },
    });
  }

  toDirectlySign(id: number): void {
    const initialState: any = { operationId: id, isDirectlySign: true };
    this.modalRef = this.modalService.show(SmsModalComponent, {
      class: 'modal_upper',
      initialState,
      id: 1,
    });
    this.modalRef.content.statusDirectlySign.subscribe((status: boolean) => {
      if (status) {
        this.confirmCreateAccount(true);
      }
    });
  }

  confirmCreateAccount(signed: boolean) {
    this.router.navigate([
      `settings/tariffs/connect/${this.tariffName}/confirm`,
    ]);
  }

  getTranslations() {
    this.translate
      .get(['error.empty_fields_present'])
      .subscribe(translations => {
        this.emptyFieldsError = translations['error.empty_fields_present'];
      });
  }

  selectAccount() {
    if (this.accountList.length === 1) {
      this.connectTariffForm
        .get('selectedAccount')
        .setValue(this.accountList[0]);
    } else if (this.accountList.length > 1) {
      console.log('many');
      let maxAmountAccount = this.accountList[0];
      for (let i = 0; i < this.accountList.length - 1; i++) {
        if (
          maxAmountAccount.actualBalance < this.accountList[i + 1].actualBalance
        ) {
          maxAmountAccount = this.accountList[i + 1];
        }
      }
      this.connectTariffForm.get('selectedAccount').setValue(maxAmountAccount);
    }
  }
}
