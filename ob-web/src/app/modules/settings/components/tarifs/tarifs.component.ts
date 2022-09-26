import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  TemplateRef,
  OnDestroy,
} from '@angular/core';
import { ICurrentContract, IUser } from '@data/models/auth-types';
import { LoginService } from '@core/services/login.service';
import { take } from 'rxjs/operators';
import {
  compareTariffs,
  errorMessage,
  getNounByNumbers,
  getTariffColor,
  successMessage,
  thousandsSeparator,
} from '@app/core/helpers';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import moment from 'moment';
import { periodFormat } from '@app/core/constants';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalComponent } from '@app/shared';
import { Subscription } from 'rxjs';
import { environment } from '@env/environment';

@Component({
  selector: 'ob-tarifs',
  templateUrl: './tarifs.component.html',
  styleUrls: ['./tarifs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarifsComponent implements OnInit, OnDestroy {
  public btnList: any[] = [];
  public user: IUser;
  public currentContract: ICurrentContract;
  public phoneAuthorized: boolean = true;
  public chargeDate: any;
  public tariffGroupList: any;
  public tariffGroupNameList: string[] = [];
  public tariffInfoList: any = [];
  modalRef?: BsModalRef;
  public remainderDate: any;
  public statisticsList: any[] = [];
  public isStatisticsLoading: boolean = false;
  public isActiveTariffLoading: boolean = false;
  public isTariffGroupsLoading: boolean = false;
  public activeTariff: any;
  public tariffDisableWarning = '';
  public tariffDisabledNotification: string = '';
  public deleteLabel: string = '';
  public cancelLabel: string = '';
  public dateNotSetLabel: string = '';
  public subscriptions: Subscription[] = [];
  public isCorpClient: boolean = true;
  public corpClientCheckLoading: boolean = false;
  public isProduction: boolean = environment.production;

  constructor(
    private loginService: LoginService,
    private changeDetector: ChangeDetectorRef,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this._getTariffsPackagesByContractByGroup();
    this.getTranslations();
    this.remainderDate = moment(new Date()).format(periodFormat);
    this.isCorpClientCheck();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  _getTariffPackageCharge() {
    this.subscriptions.push(
      this.loginService.getTariffPackageCharge().subscribe(data => {
        this.chargeDate = data;
        this.changeDetector.detectChanges();
      })
    );
  }

  _getTariffsPackagesByContractByGroup() {
    this.isTariffGroupsLoading = true;
    this.changeDetector.detectChanges();
    this.loginService.getTariffsPackagesByContractByGroup().subscribe({
      next: (data: any) => {
        this.tariffGroupNameList = Object.keys(data).sort(
          (a: string, b: string) => compareTariffs(a, b)
        );
        this.tariffGroupList = data;
        for (let group of this.tariffGroupNameList) {
          this.activeTariff = this.tariffGroupList[group].find(
            (tariff: any) => tariff.status === 'ACTIVE'
          );
          if (this.activeTariff) {
            this._getTariffStatistics();
            this._getTariffPackageCharge();
            break;
          }
        }
        this.isTariffGroupsLoading = false;
        this.changeDetector.detectChanges();
      },
      error: (error: any) => {
        this.isTariffGroupsLoading = false;
        this.changeDetector.detectChanges();
        errorMessage(error, this.toastr);
      },
    });
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: 'modal-w-536 modal-mt-160',
    });
  }

  getLineColor(tariff: string) {
    return getTariffColor(tariff);
  }

  navigateToConnect(tariffName: string) {
    this.router.navigateByUrl(`settings/tariffs/connect/${tariffName}`);
  }

  navigateToAll() {
    this.router.navigateByUrl(`settings/tariffs/all`);
  }

  navigateToDetails() {
    if (this.activeTariff) {
      this.router.navigateByUrl(
        `settings/tariffs/details/${this.activeTariff.group}/${this.activeTariff.id}`
      );
    }
  }

  _getTariffStatistics() {
    this.isStatisticsLoading = true;
    this.changeDetector.detectChanges();
    this.subscriptions.push(
      this.loginService.getTariffStatistics().subscribe({
        next: (data: any) => {
          this.statisticsList = data;
          this.isStatisticsLoading = false;
          this.changeDetector.detectChanges();
        },
        error: (error: any) => {
          errorMessage(error, this.toastr);
          this.isStatisticsLoading = false;
          this.changeDetector.detectChanges();
        },
      })
    );
  }

  formatDate(date: string) {
    if (date) {
      if (date === 'DATE_NOT_SET') {
        return this.dateNotSetLabel;
      } else {
        return moment(date, 'YYYY-MM-DD').format('LL');
      }
    } else {
      return date;
    }
  }

  _disableTariff() {
    this.loginService.disableTariff(this.activeTariff.id).subscribe({
      next: (data: any) => {
        if (data.body.status === 'OK') {
          successMessage(this.tariffDisabledNotification, this.toastr);
        } else {
          errorMessage({ message: data.body.message }, this.toastr);
        }
      },
      error: (error: any) => {
        errorMessage(error, this.toastr);
      },
    });
  }

  getTextMonths(month: number) {
    return getNounByNumbers(month, ['месяц', 'месяца', 'месяцев']);
  }

  getFormattedAmount(amount: number) {
    if (amount && amount >= 0) {
      return thousandsSeparator(amount);
    } else {
      return '0,00';
    }
  }

  getTranslations() {
    this.translate
      .get([
        'toast-messages.warning.tariff-disable',
        'operations.default.delete',
        'general.actions.cancel',
        'toast-messages.success.tariff-disabled',
        'default.dateNotSet',
      ])
      .subscribe(translations => {
        this.tariffDisableWarning =
          translations['toast-messages.warning.tariff-disable'];
        this.tariffDisabledNotification =
          translations['toast-messages.success.tariff-disabled'];
        this.deleteLabel = translations['general.actions.yes'];
        this.cancelLabel = translations['general.actions.no'];
        this.dateNotSetLabel = translations['default.dateNotSet'];
      });
  }

  openDisableConfirmation() {
    let initialState = {
      text: this.tariffDisableWarning + '?',
      btnConfirm: this.deleteLabel,
      btnCancel: this.cancelLabel,
    };
    this.modalRef = this.modalService.show(ConfirmModalComponent, {
      initialState,
      class: 'modal-dialog-centered',
      id: 5,
    });

    this.modalRef.content.onClose.subscribe((result: boolean) => {
      if (result) {
        this._disableTariff();
      }
    });
  }

  getGreenLineWidth(count: number, left: number) {
    if (left === 0) {
      return 100;
    } else {
      return (count / left) * 100;
    }
  }

  isCorpClientCheck() {
    this.corpClientCheckLoading = true;
    this.subscriptions.push(
      this.loginService.userInfoObject$.subscribe({
        next: v => {
          this.corpClientCheckLoading = false;
          if (v.currentContract) {
            if (Number(v.currentContract.bin[4]) >= 4) {
              this.isCorpClient = true;
            } else {
              this.isCorpClient = false;
            }
          }
          this.changeDetector.detectChanges();
        },
        error: err => {
          this.corpClientCheckLoading = false;
          errorMessage(err, this.toastr);
          this.changeDetector.detectChanges();
        },
      })
    );
  }
}
