import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequisitesModalComponent } from './requisites-modal.component';

describe('RequisitesModalComponent', () => {
  let component: RequisitesModalComponent;
  let fixture: ComponentFixture<RequisitesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequisitesModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequisitesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
