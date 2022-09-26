import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
} from '@angular/core';

@Directive({
  selector: '[obSumLength]',
})
export class SumLengthDirective implements AfterViewInit {
  inputValue: string = '';
  regExp = /[0-9]/;
  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    const { value } = this.el.nativeElement;
    this.inputValue = value;
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    this.inputValue = value;
  }

  @HostListener('keydown', ['$event.code', '$event.key'])
  onKeyDown(code: string, key: string): boolean {
    const { length } = this.inputValue;

    let valid = this.regExp.test(key);
    let isMaxLength = length >= 24; //пробелы + ₸
    let isBackspace = key === 'Backspace';
    let isArrowLeft = key === 'ArrowLeft';
    let isArrowRight = key === 'ArrowRight';

    return (
      (valid && !isMaxLength) || isBackspace || isArrowLeft || isArrowRight
    );
  }
}
