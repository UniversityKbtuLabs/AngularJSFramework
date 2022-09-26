import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'ob-collapse',
  templateUrl: './collapse.component.html',
  styleUrls: ['./collapse.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapseComponent implements OnInit {
  @Input() title: string = '';
  @Input() defaultInactive: boolean = false;
  @Input() type: string = '';
  @Output() clicked: EventEmitter<any> = new EventEmitter();
  public active: boolean = true;

  constructor(public changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.defaultInactive) {
      this.active = false;
    }
  }

  toggleActive() {
    this.active = !this.active;
    this.changeDetector.detectChanges();
  }

  onClick(event: any) {
    this.clicked.emit(event);
  }
}
