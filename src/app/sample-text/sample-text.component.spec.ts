import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleTextComponent } from './sample-text.component';

describe('SampleTextComponent', () => {
  let component: SampleTextComponent;
  let fixture: ComponentFixture<SampleTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SampleTextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SampleTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
