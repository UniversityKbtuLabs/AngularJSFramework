import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FXPageComponent } from './fx-page.component';

describe('FXPageComponent', () => {
  let component: FXPageComponent;
  let fixture: ComponentFixture<FXPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FXPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FXPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
