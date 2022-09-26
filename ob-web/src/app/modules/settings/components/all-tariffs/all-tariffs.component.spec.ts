import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllTariffsComponent } from './all-tariffs.component';

describe('AllTariffsComponent', () => {
  let component: AllTariffsComponent;
  let fixture: ComponentFixture<AllTariffsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AllTariffsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllTariffsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
