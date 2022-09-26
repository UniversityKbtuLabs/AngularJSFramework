import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnpComponent } from './knp.component';

describe('KnpComponent', () => {
  let component: KnpComponent;
  let fixture: ComponentFixture<KnpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KnpComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
