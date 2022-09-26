import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BinIinDropdownComponent } from './bin-iin-dropdown.component';

describe('BinIinDropdownComponent', () => {
  let component: BinIinDropdownComponent;
  let fixture: ComponentFixture<BinIinDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BinIinDropdownComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BinIinDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
