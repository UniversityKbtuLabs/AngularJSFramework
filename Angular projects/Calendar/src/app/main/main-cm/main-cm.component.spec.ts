import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainCMComponent } from './main-cm.component';

describe('MainCMComponent', () => {
  let component: MainCMComponent;
  let fixture: ComponentFixture<MainCMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MainCMComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainCMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
