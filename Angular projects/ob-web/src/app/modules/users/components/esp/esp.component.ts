import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ob-esp',
  templateUrl: './esp.component.html',
  styleUrls: ['./esp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EspComponent {
  public accountType: any;
  public accountType2: any;
  public loginForm: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    public route: ActivatedRoute,
    public router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      esp: [],
    });
  }

  uploadEsp() {
    this.router.navigate(['main']);
  }
}
