import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[obCheckIcon]',
})
export class CheckIconDirective implements OnChanges {
  public dom: HTMLInputElement;
  @Input() bankBic: string;

  constructor(private renderer: Renderer2, private elem: ElementRef) {}

  ngOnChanges(): void {
    this.dom = this.elem.nativeElement;
    const value = getComputedStyle(this.dom).getPropertyValue(
      'background-image'
    );
    if (value === 'none' || !value || value === '') {
      this.renderer.setStyle(this.dom, 'display', 'none');
    } else {
      this.renderer.setStyle(this.dom, 'display', 'block');
    }
  }
}
