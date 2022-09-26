import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TariffsConditionsComponent } from './tariffs-conditions.component';

describe('TariffsConditionsComponent', () => {
  let component: TariffsConditionsComponent;
  let fixture: ComponentFixture<TariffsConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TariffsConditionsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TariffsConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
