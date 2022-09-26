import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductStatementsComponent } from './product-statements.component';

describe('ProductStatementsComponent', () => {
  let component: ProductStatementsComponent;
  let fixture: ComponentFixture<ProductStatementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductStatementsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductStatementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
