import {Component, OnDestroy, OnInit} from '@angular/core';

import {ViewTeamsItem} from '../view-teams/view-teams-datasource';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {AngularFireDatabase} from '@angular/fire/compat/database';

@Component({
  selector: 'app-add-player',
  templateUrl: './add-player.component.html',
  styleUrls: ['./add-player.component.scss']
})
export class AddPlayerComponent implements OnInit, OnDestroy {
  teams: any[] = [];
  player: any = {};

  private subscription: Subscription;
  private playerSubscription: Subscription;

  constructor(private db: AngularFireDatabase, private route: ActivatedRoute, private router: Router) {

  }

  ngOnInit() {
    this.player.team = this.route.snapshot.params['teamId'];

    const key = this.route.snapshot.params['key'];

    if (key != null && key !== '') {
      this.playerSubscription = this.db.object('players/' + key).snapshotChanges()
        .subscribe(res => this.player = res.payload.val());
    }

    this.subscription = this.db.list<ViewTeamsItem>('teams').valueChanges().subscribe(data => {
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
    this.db.list('players').set(this.player.team + '_' + this.player.number, this.player)
      .then(() => {
        this.router.navigateByUrl('/edit-team/' + this.player.team).then();
      });
  }
}
