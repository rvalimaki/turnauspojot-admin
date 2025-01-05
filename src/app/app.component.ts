import { Component } from "@angular/core";
import { AuthService } from "./auth.service";

@Component({
  selector: "app-root",
  template: `
    <router-outlet *ngIf="user | async as user; else signIn"></router-outlet>

    <ng-template #signIn>
      <button (click)="signInWithGoogle()">
        Kirjaudu sisään Google-tunnuksilla
      </button>
    </ng-template>
  `,
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "turnaus-admin";

  user = this.authService.getUser();

  constructor(private authService: AuthService) {}

  signInWithGoogle() {
    this.authService.googleSignIn();
  }
}
