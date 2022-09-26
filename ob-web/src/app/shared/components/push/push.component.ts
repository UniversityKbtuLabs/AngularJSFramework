import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterViewChecked,
  ChangeDetectorRef,
} from '@angular/core';
import { IPushNotification } from '@app/data/models/common-types';
import { Toast, ToastPackage, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ob-push',
  templateUrl: './push.component.html',
  styleUrls: ['./push.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PushComponent extends Toast implements AfterViewChecked {
  @Input() notification: IPushNotification;
  @ViewChild('toastrElement') toastrElement: ElementRef;
  isMaxheight: boolean = false;
  public height: number = 0;
  public initialHeight: number = 0;
  constructor(
    protected toastrService: ToastrService,
    public toastPackage: ToastPackage,
    public changeDetector: ChangeDetectorRef
  ) {
    super(toastrService, toastPackage);
  }
  ngAfterViewChecked(): void {
    this.height = this.toastrElement.nativeElement.offsetHeight;
    if (this.height > 200 && this.initialHeight !== this.height) {
      this.initialHeight = this.height;
      this.isMaxheight = true;
    }
    this.changeDetector.detectChanges();
  }

  onShowAll() {
    this.isMaxheight = false;
    this.changeDetector.detectChanges();
  }

  closeNotification() {
    this.toastrService.clear();
  }
}
