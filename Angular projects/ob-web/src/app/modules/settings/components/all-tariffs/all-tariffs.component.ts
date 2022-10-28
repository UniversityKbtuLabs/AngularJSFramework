import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  compareTariffs,
  errorMessage,
  getTariffColor,
} from '@app/core/helpers';
import { LoginService } from '@app/core/services/login.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ob-all-tariffs',
  templateUrl: './all-tariffs.component.html',
  styleUrls: ['./all-tariffs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllTariffsComponent implements OnInit, OnDestroy {
  public tariffGroupList: any;
  public tariffGroupNameList: string[] = [];
  public tariffGroupSubscription: Subscription;

  constructor(
    private loginService: LoginService,
    private toastr: ToastrService,
    private changeDetector: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this._getTariffsPackagesByContractByGroup();
  }

  ngOnDestroy(): void {
    if (this.tariffGroupSubscription) {
      this.tariffGroupSubscription.unsubscribe();
    }
  }

  _getTariffsPackagesByContractByGroup() {
    this.tariffGroupSubscription = this.loginService
      .getTariffsPackagesByContractByGroup()
      .subscribe({
        next: (data: any) => {
          this.tariffGroupNameList = Object.keys(data).sort(
            (a: string, b: string) => compareTariffs(a, b)
          );
          let ind = this.tariffGroupNameList.indexOf('DEFAULT');
          this.tariffGroupList = data;
          if (ind !== -1) {
            this.tariffGroupNameList.splice(ind, 1);
            delete this.tariffGroupList['DEFAULT'];
          }
          this.changeDetector.detectChanges();
        },
        error: (error: any) => {
          errorMessage(error, this.toastr);
        },
      });
  }

  getLineColor(tariffName: string) {
    return getTariffColor(tariffName);
  }

  navigateToConnect(tariffName: string) {
    this.router.navigateByUrl(`settings/tariffs/connect/${tariffName}`);
  }
}
