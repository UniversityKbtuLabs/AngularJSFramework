import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { errorMessage } from '@app/core/helpers';
import { WELCOME } from '@core/constants/pathnames';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { LoginService } from '@core/services/login.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ob-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent extends SubscriptionAccumulator implements OnInit {
  public loadSms = true;
  public id: any;
  public isLoading: boolean = false;
  public isCodeComponent: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public loginService: LoginService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    public toastr: ToastrService
  ) {
    super();
    this.getBack = this.getBack.bind(this);
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    // this.addSubscriber(
    this.loginService.isSmsLoading$.subscribe({
      next: (v: any) => {
        if (this.isLoading !== v) {
          this.isLoading = v;
          this.changeDetector.detectChanges();
        }
      },
      error: err => {
        console.info(err);
        errorMessage(err, this.toastr);
        this.changeDetector.detectChanges();
      },
      complete: () => {
        console.info('completed');
      },
    });
    // )

    if (this.loginService.isAuthenticated()) {
      this.router.navigate([WELCOME]);
    }

    this.addSubscriber(
      this.loginService.isCodeComponent.subscribe((val: boolean) => {
        this.isCodeComponent = val;
      })
    );
  }

  onClient(): void {}

  getBack() {
    this.loginService.changeSmsStatus(false);
    this.loginService.changeLoginError('');
    this.loginService.changeCodeComponentVisible(false);
    this.changeDetector.detectChanges();
  }
}
