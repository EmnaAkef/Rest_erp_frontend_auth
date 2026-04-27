import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmSalesComponent  } from './crm-sales';

describe('CrmSalesComponent ', () => {
  let component: CrmSalesComponent ;
  let fixture: ComponentFixture<CrmSalesComponent >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrmSalesComponent ],
    }).compileComponents();

    fixture = TestBed.createComponent(CrmSalesComponent );
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
