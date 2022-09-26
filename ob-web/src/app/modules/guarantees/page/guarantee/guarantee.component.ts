import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '@env/environment';
import { IGuaranteeTypes } from '@modules/guarantees/guarantees..types';
import { GUARANTEES_STATUSES } from '../../dictionaries/guarantees-statuses';
import { GUARANTEES } from '@core/constants/pathnames';

@Component({
  selector: 'ob-guarantee',
  templateUrl: './guarantee.component.html',
  styleUrls: ['./guarantee.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuaranteeComponent implements OnInit {
  environment = environment;
  access_token = this.cookieService.get('access_token');
  status?: IGuaranteeTypes;
  id?: string;
  GUARANTEES_STATUSES = GUARANTEES_STATUSES;
  GUARANTEES = GUARANTEES;

  constructor(
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.status = this.route.snapshot.params['status'];
    this.id =
      this.status == GUARANTEES_STATUSES.existing
        ? this.route.snapshot.params['id']
        : '';
    this.changeDetector.detectChanges();
  }
}
