import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsLeftBarComponent } from './settings-left-bar.component';

describe('SettingsLeftBarComponent', () => {
  let component: SettingsLeftBarComponent;
  let fixture: ComponentFixture<SettingsLeftBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsLeftBarComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsLeftBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
