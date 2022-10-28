import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StgSwitchComponent } from './stg-switch.component';

describe('StgSwitchComponent', () => {
  let component: StgSwitchComponent;
  let fixture: ComponentFixture<StgSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StgSwitchComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StgSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
