import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewMainComponent } from './new-main.component';

describe('NewMainComponent', () => {
  let component: NewMainComponent;
  let fixture: ComponentFixture<NewMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewMainComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
