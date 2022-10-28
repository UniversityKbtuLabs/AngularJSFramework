import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyControlDescriptionComponent } from './currency-control-description.component';

describe('CurrencyControlDescriptionComponent', () => {
  let component: CurrencyControlDescriptionComponent;
  let fixture: ComponentFixture<CurrencyControlDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurrencyControlDescriptionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencyControlDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
