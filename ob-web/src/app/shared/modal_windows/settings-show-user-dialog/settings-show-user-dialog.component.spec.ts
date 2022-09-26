import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsShowUserDialogComponent } from './settings-show-user-dialog.component';

describe('SettingsShowUserDialogComponent', () => {
  let component: SettingsShowUserDialogComponent;
  let fixture: ComponentFixture<SettingsShowUserDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsShowUserDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsShowUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
