import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeDonComponent } from './demande-don.component';

describe('DemandeDonComponent', () => {
  let component: DemandeDonComponent;
  let fixture: ComponentFixture<DemandeDonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeDonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandeDonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
