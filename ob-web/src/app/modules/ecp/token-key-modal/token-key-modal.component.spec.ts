import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenKeyModalComponent } from './token-key-modal.component';

describe('TokenKeyModalComponent', () => {
  let component: TokenKeyModalComponent;
  let fixture: ComponentFixture<TokenKeyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TokenKeyModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenKeyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
