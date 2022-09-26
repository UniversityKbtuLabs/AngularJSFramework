import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MainService } from '@core/services/main.service';
import { AccountsService } from '@core/services/accounts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';

@Component({
  selector: 'ob-credit',
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  public id: number = 0;
  public isSettingsOpen: boolean = false;
  public accInfoSubscription: Subscription;
  public data: any = null;
  public subscrList: any[] = [];
  public creditPaymentInfo: any = null;

  constructor(
    private changeDetector: ChangeDetectorRef,
    public mainService: MainService,
    public accountsService: AccountsService,
    public activatedRoute: ActivatedRoute,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.params['id'];

    this.accountsService.isAccountSettingsOpen.subscribe((value: boolean) => {
      this.isSettingsOpen = value;
    });

    this.addSubscriber(this.accountsService.getLoanPaymentInfo(this.id));

    this.addSubscriber(this.accountsService.getLoanDetails(this.id));

    this.accInfoSubscription =
      this.accountsService.observableAccountInfo$.subscribe({
        next: data => {
          this.data = data;
          this.changeDetector.detectChanges();
        },
      });

    this.addSubscriber(
      this.accountsService.creditPaymentInfo$.subscribe({
        next: data => {
          this.creditPaymentInfo = data;
          this.changeDetector.detectChanges();
        },
      })
    );
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
}
