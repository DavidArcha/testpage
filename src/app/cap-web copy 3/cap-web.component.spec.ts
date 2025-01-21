import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapWebComponent } from './cap-web.component';

describe('CapWebComponent', () => {
  let component: CapWebComponent;
  let fixture: ComponentFixture<CapWebComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CapWebComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CapWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
