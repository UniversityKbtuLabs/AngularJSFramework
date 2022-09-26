import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuaranteesMainComponent } from './guarantees-main.component';

describe('GuaranteesMainComponent', () => {
  let component: GuaranteesMainComponent;
  let fixture: ComponentFixture<GuaranteesMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GuaranteesMainComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GuaranteesMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
