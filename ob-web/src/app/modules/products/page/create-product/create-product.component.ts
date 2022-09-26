import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ob-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProductComponent implements OnInit {
  public productType: string = '';

  constructor(
    private route: ActivatedRoute,
    public changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productType = this.route.snapshot.params['productType'];
    this.changeDetector.detectChanges();
  }
}
