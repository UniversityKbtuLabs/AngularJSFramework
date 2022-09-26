import {
  Directive,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  Self,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AmountPipe } from '../pipes/amount-pipe.pipe';

@Directive({
  selector: '[obNewAmountMask]',
})
export class NewAmountMaskDirective implements OnInit, OnDestroy {
  private element: HTMLInputElement;
  public amountMaskPattern = '^[0-9 ]*(.[0-9]{1,2})?$';
  private subscription: Subscription;
  @Output() maskedAmount = new EventEmitter(); // get real value of amount without empty space and other characters

  constructor(
    // private amountPipe: AmountPipe,
    private el: ElementRef,
    @Self() private ngControl: NgControl
  ) {
    this.element = this.el.nativeElement;
    this.element.pattern = this.amountMaskPattern;
  }

  ngOnInit() {
    if (!this.ngControl.control || !this.ngControl.valueAccessor) {
      return;
    }
    this.subscription = this.ngControl.control.valueChanges
      .pipe(map(value => this.unmask(value || '')))
      .subscribe(value => {
        if (value.split('.')[1] && value.split('.')[1].length === 3) {
          value = value.substr(0, value.length - 1);
        }
        this.ngControl.control.setValue(+value, { emitEvent: false });
        this.element.value = this.formattedValue(value);
        this.maskedAmount.emit(this.formattedValue(value).replace(/\s/g, ''));
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private formattedValue(value: string) {
    // let formatted = this.amountPipe.transform(this.parseAmount(value));
    let formatted = this.parseAmount(value);
    return formatted.trim();
  }

  private unmask(value: string): string {
    return ('' + value)
      .replace(/[^0-9,.]+/g, '')
      .replace(/,/, '.')
      .trim();
  }

  private parseAmount(val: any) {
    let sVal;
    if (!val) {
      return '';
    }
    if (!val.replace) {
      sVal = val.toString();
    }
    sVal = val
      .replace(/ /g, '')
      .replace(/,/, '.')
      .replace(/[^0123456789.]/g, '');
    if (sVal.split('.').length === 3) {
      sVal = sVal.substr(0, sVal.length - 1);
    }
    let index = sVal.indexOf('.');

    return index > 0 ? sVal.substring(0, index + 3) : sVal;
  }
}
