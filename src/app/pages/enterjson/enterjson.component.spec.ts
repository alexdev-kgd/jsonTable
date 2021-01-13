import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterjsonComponent } from './enterjson.component';

describe('EnterjsonComponent', () => {
  let component: EnterjsonComponent;
  let fixture: ComponentFixture<EnterjsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnterjsonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterjsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
