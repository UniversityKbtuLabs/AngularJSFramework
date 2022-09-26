import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContragentsComponent } from './contragents.component';

describe('ContragentsComponent', () => {
  let component: ContragentsComponent;
  let fixture: ComponentFixture<ContragentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContragentsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContragentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
