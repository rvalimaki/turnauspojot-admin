import { Component } from "@angular/core";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AuthService } from "../auth.service";

@Component({
  selector: "app-nav",
  templateUrl: "./nav.component.html",
  styleUrls: ["./nav.component.scss"],
})
export class NavComponent {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));

  user = this.authService.getUser();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService
  ) {}

  signOut() {
    this.authService.signOut();
  }
}
