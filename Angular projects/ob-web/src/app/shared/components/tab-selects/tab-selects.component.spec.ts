import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabSelectsComponent } from './tab-selects.component';

describe('TabSelectsComponent', () => {
  let component: TabSelectsComponent;
  let fixture: ComponentFixture<TabSelectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TabSelectsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabSelectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
