import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

import {AngularFireDatabase} from '@angular/fire/database';
import {GameEvent} from '../game-plan/game-event';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  game: any = {};
  events: GameEvent[] = [];

  get nextEventNumber(): number {
    return this.events.length + 1;
  }

  private _teamPlayerDict = {};
  private _playerDict = {};
  private _teamDict = {};

  private subscription: Subscription;
  private playerSubscription: Subscription;
  private teamSubscription: Subscription;
  private eventSubscription: Subscription;

  get homeGoals(): number {
    return this.events.filter(e => e.home && e.eventType === 'goals').length;
  }

  get awayGoals(): number {
    return this.events.filter(e => e.away && e.eventType === 'goals').length;
  }

  constructor(private db: AngularFireDatabase, private route: ActivatedRoute) {
  }

  ngOnInit() {
    const key = this.route.snapshot.params['key'];

    this.subscription = this.db.object('games/' + key).snapshotChanges()
      .subscribe(res => this.game = res.payload.val());

    this.playerSubscription = this.db.list('players').valueChanges().subscribe(
      players => {
        this.setPlayerDictionary(players);
      }
    );

    this.teamSubscription = this.db.list('teams').valueChanges().subscribe(
      teams => {
        this.setTeamDictionary(teams);
      }
    );

    this.eventSubscription = this.db.list('events').valueChanges().subscribe(
      events => {
        const ev: GameEvent[] = <GameEvent[]>events;
        this.events = ev.filter(e => e.gameId === this.game.id);

        for (const e of this.events) {
          e.date = isNaN(e.timestamp) ? null : new Date(e.timestamp);
        }
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.teamSubscription.unsubscribe();
    this.playerSubscription.unsubscribe();
    this.eventSubscription.unsubscribe();
  }

  getPlayers(team: string) {
    return this._teamPlayerDict[team] != null ? this._teamPlayerDict[team] : [];
  }

  getPlayer(id: string) {
    return this._playerDict[id];
  }

  getPlayerName(id: string) {
    const p = this.getPlayer(id);

    return p != null ? p.firstName + ' ' + p.lastName : '?' + id + '?';
  }

  getTeam(team: string) {
    return this._teamDict[team];
  }

  getTeamName(team: string) {
    const t = this.getTeam(team);

    return t != null ? t.name : team;
  }

  private setPlayerDictionary(players: any[]) {
    this._teamPlayerDict = {};
    this._playerDict = {};

    for (const p of players) {
      if (this._teamPlayerDict[p.team] == null) {
        this._teamPlayerDict[p.team] = [];
      }

      this._teamPlayerDict[p.team].push(p);

      this._playerDict[p.team + '_' + p.number] = p;
    }
  }

  private setTeamDictionary(teams: any[]) {
    this._teamDict = {};

    for (const t of teams) {
      this._teamDict[t.id] = t;
    }
  }

}
