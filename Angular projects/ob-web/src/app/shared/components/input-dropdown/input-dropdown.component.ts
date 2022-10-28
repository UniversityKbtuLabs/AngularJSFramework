import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  forwardRef,
  EventEmitter,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import { SubscriptionAccumulator } from '@app/core/helpers/SubscriptionAccumulator';

@Component({
  selector: 'ob-input-dropdown',
  templateUrl: './input-dropdown.component.html',
  styleUrls: ['./input-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputDropdownComponent),
      multi: true,
    },
  ],
})
export class InputDropdownComponent
  extends SubscriptionAccumulator
  implements OnInit, ControlValueAccessor
{
  @Input() value = '';
  @Input() searchTitle: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Output() getData = new EventEmitter<any>();
  @Output() removeData = new EventEmitter<any>();
  @Input() submitted: boolean = false;

  public inputEl = new FormControl();
  isBlur: boolean = false;

  onTouch: any;
  constructor() {
    super();

    this.inputEl = new FormControl('', [Validators.required]);
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
