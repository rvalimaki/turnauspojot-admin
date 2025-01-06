import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { AngularFireDatabase } from "@angular/fire/compat/database";

import { Subscription } from "rxjs";

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: "app-edit-team",
  templateUrl: "./edit-team.component.html",
  styleUrls: ["./edit-team.component.scss"],
})
export class EditTeamComponent implements OnInit, OnDestroy {
  team: any = {};

  subscription: Subscription;
  playerSubscription: Subscription;
  private _playerDict: any = {};

  constructor(
    private db: AngularFireDatabase,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const key = this.route.snapshot.params["key"];

    this.subscription = this.db
      .object("teams/" + key)
      .snapshotChanges()
      .subscribe((res) => (this.team = res.payload.val()));

    this.playerSubscription = this.db
      .list("players")
      .valueChanges()
      .subscribe((players) => {
        this.setPlayerDictionary(players);
      });

    setTimeout(() => console.log(this.team), 2000);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.playerSubscription.unsubscribe();
  }

  onSubmit() {
    this.db
      .list("teams")
      .set(this.team.id, this.team)
      .then(() => {
        console.log("success");
        this.router.navigateByUrl("/view-teams");
      });
  }

  getPlayers(team: string) {
    return this._playerDict[team] != null ? this._playerDict[team] : [];
  }

  private setPlayerDictionary(players: any[]) {
    this._playerDict = {};

    for (const p of players) {
      if (this._playerDict[p.team] == null) {
        this._playerDict[p.team] = [];
      }

      this._playerDict[p.team].push(p);
      this._playerDict[p.team].sort((a, b) =>
        a.number.localeCompare(b.number, [], { numeric: true })
      );
    }
  }

  removePlayer(key: string) {
    this.db
      .object("players/" + key)
      .remove()
      .then();
  }

  confirmRemovePlayer(key: string) {
    const confirmation = confirm(
      "Haluatko varmasti poistaa pelaajan " + key + "?"
    );

    if (confirmation) {
      this.removePlayer(key);
    }
  }
}
