import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AddTeamsComponent} from './add-teams.component';

describe('AddEventComponent', () => {
  let component: AddTeamsComponent;
  let fixture: ComponentFixture<AddTeamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddTeamsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
