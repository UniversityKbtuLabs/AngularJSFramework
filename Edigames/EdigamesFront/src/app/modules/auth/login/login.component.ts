import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HelperService} from "../../../core/services/helper.service";
import {SubscriptionAccumulator} from "../../../core/helpers/SubscriptionAccumulator";
import {AuthService} from "../../../core/services/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends SubscriptionAccumulator implements OnInit {
  loginForm: FormGroup;
  backPath: string = ''

  constructor(private router: Router,
              private fb: FormBuilder,
              private helperService: HelperService,
              private authService: AuthService
  ) {
    super();
    this.loginForm = this.fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.addSubscriber(
      this.helperService.backfromAuth$.subscribe(value => {
        this.backPath = value
      })
    )
  }

  moveToRegister() {
    this.router.navigate(['auth/register'])
  }

  back() {
    this.router.navigate([this.backPath])
  }

  login() {
    this.authService.login(this.loginForm.getRawValue()).subscribe(value => {
      alert("Вы успешно вошли")
      this.router.navigate([''])
    }, error => {
      alert("ошибка")
    })
  }
}
