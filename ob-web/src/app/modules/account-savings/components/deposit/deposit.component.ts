import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { MainService } from '@core/services/main.service';
import { AccountsService } from '@core/services/accounts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { Subscription } from 'rxjs';
import { AccountHistoryService } from '@core/services/account-history.service';
import moment from 'moment';
import { HelperService } from '@core/services/helper.service';
import { successMessage } from '@core/helpers';
import { LoginService } from '@core/services/login.service';

@Component({
  selector: 'ob-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepositComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  public id: number = 0;
  public isSettingsOpen: boolean = false;
  public accInfoSubscription: Subscription;
  public data: any = null;
  public subscrList: any[] = [];
  // public depositStatements: any;
  // public endDate: Date = new Date();
  // public startDate: Date = new Date();

  constructor(
    private changeDetector: ChangeDetectorRef,
    public mainService: MainService,
    public accountsService: AccountsService,
    public activatedRoute: ActivatedRoute,
    private modalService: BsModalService
  ) {
    super();
  }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];

    this.accountsService.isAccountSettingsOpen.subscribe((value: boolean) => {
      this.isSettingsOpen = value;
    });

    this.getAccountById();

    this.accInfoSubscription =
      this.accountsService.observableAccountInfo$.subscribe({
        next: data => {
          this.data = data;
          this.changeDetector.detectChanges();
        },
      });

    // if(this.endDate.getMonth() === 1){
    //     this.startDate.setMonth(12)
    // }else {
    //     this.startDate.setMonth(this.endDate.getMonth() - 1)
    // }
    // let sd = moment(this.startDate).format('YYYY-MM-DD')
    // let ed = moment(this.endDate).format('YYYY-MM-DD')
    // this.addSubscriber(
    //     this.accountHistoryService.getDepositStatements(String(this.id), sd, ed).subscribe(value => {
    //         this.depositStatements = value.content
    //     })
    // )
  }

  ngOnDestroy(): void {
    if (this.subscrList.length) {
      this.subscrList.forEach(i => i.unsubscribe());
    }
    if (this.accInfoSubscription) {
      this.accInfoSubscription.unsubscribe();
    }
    this.accountsService.setAccountInfo([]);
    this.modalService.hide(1);
    this.accountsService.changeAccountSettingsStatus(false); //закрывает настройки при выходе со страницы
  }

  getAccountById() {
    let clientIdRef;
    this.subscrList.push(
      this.accountsService.getAccounById2(
        this.id,
        'deposit',
        clientIdRef,
        () => {
          if (this.subscrList.length) {
            this.subscrList.forEach(i => i.unsubscribe());
          }
        }
      )
    );
  }
}
