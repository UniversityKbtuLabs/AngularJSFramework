import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperationsService } from '@app/core/services/operations.service';
import { SubscriptionAccumulator } from '@app/core/helpers/SubscriptionAccumulator';
import { errorMessage } from '@app/core/helpers';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ob-operation',
  templateUrl: './operation.component.html',
  styleUrls: ['./operation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationComponent
  extends SubscriptionAccumulator
  implements OnInit, OnDestroy
{
  public operationType: string = '';

  constructor(
    private route: ActivatedRoute,
    public changeDetector: ChangeDetectorRef,
    public operationsService: OperationsService,
    public toastr: ToastrService
  ) {
    super();
  }

  ngOnInit(): void {
    this.operationType = this.route.snapshot.params['operationType'];
    this.changeDetector.detectChanges();

    this.getUserRigths();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  getUserRigths() {
    this.addSubscriber(
      this.operationsService.checkRightsToSign().subscribe({
        next: (data: boolean) => {
          this.operationsService.userRightsToSign$.next(data);
          this.changeDetector.detectChanges();
        },
        error: (error: any) => {
          errorMessage(error, this.toastr);
        },
      })
    );
  }
}
