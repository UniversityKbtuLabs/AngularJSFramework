import {
  Component,
  ChangeDetectionStrategy,
  Input,
  forwardRef,
  OnInit,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import { SubscriptionAccumulator } from '@core/helpers/SubscriptionAccumulator';
@Component({
  selector: 'ob-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent
  extends SubscriptionAccumulator
  implements ControlValueAccessor, OnInit
{
  @Input() type: string = '';
  @Input() required: boolean = false;
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() submitted: boolean = false;
  @Input() customValidation: boolean = false;
  @Input() formInvalid: boolean = false;
  public disabled: boolean = false;
  public inputForm = new FormControl();
  onChange: any;
  onTouch: any;

  constructor() {
    super();

    this.inputForm = new FormControl('', [Validators.required]);
  }
  ngOnInit(): void {
    this.addSubscriber(
      this.inputForm.valueChanges.subscribe(val => {
        if (this.onChange) {
          this.onChange(val);
        }
      })
    );
  }

  writeValue(obj: any): void {
    this.inputForm.setValue(obj);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
}
