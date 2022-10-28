import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CURRENCY_CONTROL,
  CURRENCY_CONTROL_CONTRACT_CREATE,
  HOME_OPERATIONS,
} from '@app/core/constants/pathnames';
import { HelperService } from '@app/core/services/helper.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationComponent implements OnInit {
  isSigned: boolean = false;
  constructor(private router: Router, private route: ActivatedRoute) {
    this.isSigned = JSON.parse(this.route.snapshot.paramMap.get('isSigned'));
  }

  ngOnInit(): void {}

  onNavigate() {
    this.router.navigate([HOME_OPERATIONS]);
  }

  onNavigateCurrencyControl() {
    this.router.navigate([CURRENCY_CONTROL]);
  }

  onCreateNewContract() {
    this.router.navigate([CURRENCY_CONTROL_CONTRACT_CREATE]);
  }
}
