import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestureRecognitionComponent } from './gesture-recognition.component';

describe('GestureRecognitionComponent', () => {
  let component: GestureRecognitionComponent;
  let fixture: ComponentFixture<GestureRecognitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestureRecognitionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestureRecognitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
