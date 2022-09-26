import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  forwardRef,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import { SubscriptionAccumulator } from '@app/core/helpers/SubscriptionAccumulator';
import { CustomvalidationService } from '@app/core/services/customvalidation.service';

@Component({
  selector: 'ob-bin-iin-dropdown',
  templateUrl: './bin-iin-dropdown.component.html',
  styleUrls: ['./bin-iin-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BinIinDropdownComponent),
      multi: true,
    },
  ],
})
export class BinIinDropdownComponent
  extends SubscriptionAccumulator
  implements OnInit, ControlValueAccessor
{
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Output() getData = new EventEmitter<any>();
  @Output() removeData = new EventEmitter<any>();
  @Input() submitted: boolean = false;

  public inputEl = new FormControl();
  isBlur: boolean = false;

  onTouch: any;
  constructor(private customValidator: CustomvalidationService) {
    super();

    this.inputEl = new FormControl(
      '',
      Validators.compose([
        Validators.required,
        Validators.minLength(12),
        this.customValidator.symbolValidator,
      ])
    );
  }

  ngOnInit(): void {
    this.addSubscriber(
      this.inputEl.valueChanges.subscribe(val => {
        if (this.onChange) {
          this.onChange(val);
        }
      })
    );
  }

  onInputChange() {
    if (this.inputEl.value === '') {
      this.removeData.emit(true);
    } else {
      this.getData.emit(true);
    }
  }
  getAllData() {
    this.getData.emit(true);
  }

  writeValue(obj: any): void {
    if (obj) {
      this.inputEl.setValue(obj);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  onChange(_: any) {}
  onTouched: any = () => {};
}
