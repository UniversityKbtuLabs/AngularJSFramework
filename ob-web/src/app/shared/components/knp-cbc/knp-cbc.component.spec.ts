import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnpCbcComponent } from './knp-cbc.component';

describe('KnpCbcComponent', () => {
  let component: KnpCbcComponent;
  let fixture: ComponentFixture<KnpCbcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KnpCbcComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnpCbcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
