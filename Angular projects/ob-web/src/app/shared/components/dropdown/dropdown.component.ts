import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { DropDownList } from '@data/models/common-types';
import { MainService } from '@core/services/main.service';
import { Router } from '@angular/router';

@Component({
  selector: 'ob-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent {
  @Input() list: DropDownList[] | any;
  @Input() onClick: (type: string) => void = () => {};
  public isActive: boolean = false;

  constructor(
    private changeDetector: ChangeDetectorRef,
    public mainService: MainService,
    public router: Router
  ) {
    document.addEventListener('click', () => {
      this.isActive = false;
      this.changeDetector.detectChanges();
    });
  }

  clickButton(event: any) {
    event.stopPropagation();
    this.isActive = !this.isActive;
  }

  onChange(el: DropDownList) {
    this.onClick(el.code);
    this.isActive = false;
  }
}
