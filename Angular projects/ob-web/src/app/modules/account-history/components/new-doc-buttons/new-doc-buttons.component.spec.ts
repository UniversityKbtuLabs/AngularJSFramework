import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDocButtonsComponent } from './new-doc-buttons.component';

describe('NewDocButtonsComponent', () => {
  let component: NewDocButtonsComponent;
  let fixture: ComponentFixture<NewDocButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewDocButtonsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDocButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
