import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DishtailComponent } from './dishtail.component';

describe('DishtailComponent', () => {
  let component: DishtailComponent;
  let fixture: ComponentFixture<DishtailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DishtailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DishtailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
