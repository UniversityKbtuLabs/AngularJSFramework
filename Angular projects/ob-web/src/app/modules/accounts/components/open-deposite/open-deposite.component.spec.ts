import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenDepositeComponent } from './open-deposite.component';

describe('OpenDepositeComponent', () => {
  let component: OpenDepositeComponent;
  let fixture: ComponentFixture<OpenDepositeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OpenDepositeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenDepositeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
