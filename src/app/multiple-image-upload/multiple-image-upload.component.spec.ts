import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleImageUploadComponent } from './multiple-image-upload.component';

describe('MultipleImageUploadComponent', () => {
  let component: MultipleImageUploadComponent;
  let fixture: ComponentFixture<MultipleImageUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultipleImageUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultipleImageUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
