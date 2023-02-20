import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SubscriptionAccumulator} from "../../../core/helpers/SubscriptionAccumulator";
import {HelperService} from "../../../core/services/helper.service";

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent extends SubscriptionAccumulator implements OnInit {
  registerForm: FormGroup;
  backPath: string = ''

  constructor(private router: Router,
              private fb: FormBuilder,
              private helperService: HelperService) {
    super();
    this.registerForm = this.fb.group({
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

  moveToLogin() {
    this.router.navigate(['auth/login'])
  }

  back() {
    this.router.navigate([this.backPath])
  }

  register() {
    
  }
}
