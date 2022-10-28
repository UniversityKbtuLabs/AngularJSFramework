import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OPERATIONS } from '@core/constants/pathnames';

@Component({
  selector: 'ob-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferComponent implements OnInit {
  transferType = '';
  operations = OPERATIONS;

  constructor(
    private route: ActivatedRoute,
    public changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.transferType = this.route.snapshot.params['type'];
  }
}
