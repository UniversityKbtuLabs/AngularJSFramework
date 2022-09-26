import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
import { DropdownService } from '@core/services/dropdown.service';

@Component({
  selector: 'ob-dropdown-button',
  templateUrl: './dropdown-button.component.html',
  styleUrls: ['./dropdown-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownButtonComponent extends SubscriptionAccumulator {
  @Input() data: any = [];
  @Input() value: string = '';
  @Output() selectedValue = new EventEmitter();
  @Output() clicked = new EventEmitter();
  defaultValue = '';
  constructor(
    private dropdownService: DropdownService,
    private changeDetector: ChangeDetectorRef
  ) {
    super();

    setTimeout(() => {
      this.addSubscriber(
        this.dropdownService.dropdownSelectedValue.subscribe(item => {
          this.defaultValue = item;
          this.changeDetector.detectChanges();
        })
      );
    }, 1000);
  }

  onClick() {
    this.clicked.emit(true);
  }

  selectedItem(contractNum: any) {
    this.selectedValue.emit(contractNum);
  }
}
