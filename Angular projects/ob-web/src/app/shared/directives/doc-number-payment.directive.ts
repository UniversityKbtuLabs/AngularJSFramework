import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';

@Directive({
  selector: '[obDocNumberPayment]',
})
export class DocNumberPaymentDirective implements AfterViewInit {
  inputValue: string = '';
  regExp = /[a-zA-Z0-9_.-]*$/;
  @Output() docNumChange: EventEmitter<any> = new EventEmitter();

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    const { value } = this.el.nativeElement;
    this.inputValue = value;
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    this.inputValue = value;
    this.el.nativeElement.value = this.el.nativeElement.value.toUpperCase();
    this.docNumChange.emit(this.el.nativeElement.value);
  }

  @HostListener('keydown', ['$event.code', '$event.key'])
  onKeyDown(code: string, key: string): boolean {
    const { length } = this.inputValue;
    //let isDigit = code.includes('Digit') || code.includes('Numpad')
    let valid = this.regExp.test(key);
    let isMaxLength = length >= 10;
    let isBackspace = key === 'Backspace';
    let isArrowLeft = key === 'ArrowLeft';
    let isArrowRight = key === 'ArrowRight';
    let isTab = key === 'Tab';

    return (
      (valid && !isMaxLength) ||
      isBackspace ||
      isArrowLeft ||
      isArrowRight ||
      isTab
    );
  }
}
