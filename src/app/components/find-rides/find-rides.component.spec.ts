import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindRidesComponent } from './find-rides.component';

describe('FindRidesComponent', () => {
  let component: FindRidesComponent;
  let fixture: ComponentFixture<FindRidesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FindRidesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FindRidesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
