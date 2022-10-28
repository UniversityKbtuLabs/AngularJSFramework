import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
} from '@angular/core';

@Directive({
  selector: '[obAccount]',
})
export class AccountV2Directive implements AfterViewInit {
  inputValue: string = '';

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    const { value } = this.el.nativeElement;
    this.inputValue = value;
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    this.inputValue = value;
  }

  @HostListener('keydown', ['$event.key'])
  onKeyDown(key: string): boolean {
    const { length } = this.inputValue;

    let isBackspace = key === 'Backspace';
    let isArrowLeft = key === 'ArrowLeft';
    let isArrowRight = key === 'ArrowRight';
    let invalidLength = length >= 20;

    return !invalidLength || isBackspace || isArrowLeft || isArrowRight;
  }
}
