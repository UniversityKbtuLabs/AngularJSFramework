import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ICurrentContract, IUser } from '@data/models/auth-types';
import { LoginService } from '@core/services/login.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'ob-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent implements OnInit {
  public btnList: any[] = [];
  public user: IUser;
  public currentContract: ICurrentContract;
  public phoneAuthorized: boolean = true;

  constructor(
    private loginService: LoginService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getUserInfo();
  }

  getUserInfo() {
    this.loginService.userInfoObject$
      .pipe(take(2)) // TODO FIX
      .subscribe({
        next: v => {
          if (v.user) {
            this.user = v.user;
            this.currentContract = v.currentContract;
            this.changeDetector.detectChanges();
          }
        },
      });
  }
}
