import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectTariffComponent } from './connect-tariff.component';

describe('ConnectTariffComponent', () => {
  let component: ConnectTariffComponent;
  let fixture: ComponentFixture<ConnectTariffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConnectTariffComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectTariffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
