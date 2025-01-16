import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptureImgComponent } from './capture-img.component';

describe('CaptureImgComponent', () => {
  let component: CaptureImgComponent;
  let fixture: ComponentFixture<CaptureImgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaptureImgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaptureImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
