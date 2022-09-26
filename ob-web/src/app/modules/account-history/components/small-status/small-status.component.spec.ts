import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallStatusComponent } from './small-status.component';

describe('SmallStatusComponent', () => {
  let component: SmallStatusComponent;
  let fixture: ComponentFixture<SmallStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SmallStatusComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmallStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
