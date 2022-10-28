import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastEventsComponent } from './last-events.component';

describe('LastEventsComponent', () => {
  let component: LastEventsComponent;
  let fixture: ComponentFixture<LastEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LastEventsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LastEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
