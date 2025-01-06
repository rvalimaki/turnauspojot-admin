import { Component, OnDestroy, OnInit } from "@angular/core";

import { ViewTeamsItem } from "../view-teams/view-teams-datasource";
import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { AngularFireDatabase } from "@angular/fire/compat/database";

@Component({
  selector: "app-add-player",
  templateUrl: "./add-player.component.html",
  styleUrls: ["./add-player.component.scss"],
})
export class AddPlayerComponent implements OnInit, OnDestroy {
  teams: any[] = [];
  positions: any[] = [
    { id: "", name: "?" },
    { id: "MV", name: "Maalivahti" },
    { id: "VP", name: "Vasen puolustaja" },
    { id: "OP", name: "Oikea puolustaja" },
    { id: "VH", name: "Vasen laitahyökkääjä" },
    { id: "KH", name: "Keskuhyökkääjä" },
    { id: "OH", name: "Oikea laitahyökkääjä" },
  ];
  lines: any[] = [
    { id: 1, name: "1." },
    { id: 2, name: "2." },
    { id: 3, name: "3." },
    { id: 4, name: "4." },
    { id: 0, name: "Vilttiketju" },
  ];
  player: any = {};

  private subscription: Subscription;
  private playerSubscription: Subscription;

  constructor(
    private db: AngularFireDatabase,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.player.team = this.route.snapshot.params["teamId"];

    const key = this.route.snapshot.params["key"];

    if (key != null && key !== "") {
      this.playerSubscription = this.db
        .object("players/" + key)
        .snapshotChanges()
        .subscribe((res) => (this.player = res.payload.val()));
    }

    this.subscription = this.db
      .list<ViewTeamsItem>("teams")
      .valueChanges()
      .subscribe((data) => {
        this.teams = data;

        if (this.player.team == null && this.teams.length > 0) {
          this.player.team = this.teams[0].id;
        }
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();

    if (this.playerSubscription != null) {
      this.playerSubscription.unsubscribe();
    }
  }

  onSubmit() {
    this.db
      .list("players")
      .set(this.player.team + "_" + this.player.number, this.player)
      .then(() => {
        this.router.navigateByUrl("/edit-team/" + this.player.team).then();
      });
  }
}
