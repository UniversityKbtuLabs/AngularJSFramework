import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';

@Component({
  selector: 'ob-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() cardContent: any;
  @Input() className: string = '';
  @Input() disabled: boolean = false;
  public isProduction = environment.production;

  constructor(private router: Router) {}

  setCardStyle() {
    let style: any = {};
    if (this.className.includes('bg-img')) {
      style[
        'backgroundImage'
      ] = `url('./assets/icons/${this.cardContent.image}.png')`;
    }
    if (this.className.includes('banner') && this.cardContent.backgroundColor) {
      style['backgroundColor'] = `${this.cardContent.backgroundColor}`;
    }

    return style;
  }

  navigateTo(path: string) {
    this.router.navigateByUrl(path);
  }
}
