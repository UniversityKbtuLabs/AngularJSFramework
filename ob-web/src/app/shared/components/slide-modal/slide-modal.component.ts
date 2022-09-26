import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { MainService } from '@core/services/main.service';
import { AccountsService } from '@core/services/accounts.service';

@Component({
  selector: 'ob-slide-modal',
  templateUrl: './slide-modal.component.html',
  styleUrls: ['./slide-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlideModalComponent {
  public isActive: boolean = false;
  public type: any;

  constructor(
    public mainService: MainService,
    private changeDetector: ChangeDetectorRef,
    public accountsService: AccountsService
  ) {}

  closeModal() {
    this.mainService.closeModal();
  }
}
