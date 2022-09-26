import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ob-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent implements OnInit {
  public soon: string = '';

  @Input() type: string;
  @Input() className: string;
  @Input() id: string;

  constructor(
    public translate: TranslateService,
    private changeDetector: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.getTranslations();
  }
  getTranslations() {
    this.translate.get(['default.soon']).subscribe(translations => {
      this.soon = translations['default.soon'];
      this.changeDetector.detectChanges();
    });
  }
}
