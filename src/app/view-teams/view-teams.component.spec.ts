import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

import { ViewTeamsComponent } from "./view-teams.component";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";

describe("ViewTeamsComponent", () => {
  let component: ViewTeamsComponent;
  let fixture: ComponentFixture<ViewTeamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewTeamsComponent],
      imports: [
        NoopAnimationsModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should compile", () => {
    expect(component).toBeTruthy();
  });
});
