import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoTableCard } from './info-table-card';

describe('InfoTableCard', () => {
  let component: InfoTableCard;
  let fixture: ComponentFixture<InfoTableCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoTableCard],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoTableCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
