import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

import {AngularFireDatabase} from '@angular/fire/database';
import {GameEvent, Goal, Penalty} from '../game-plan/game-event';
import { MatDialog } from '@angular/material/dialog';
import {AddEventComponent} from '../add-event/add-event.component';


export const GOAL = 'goal';
export const PENALTY = 'penalty';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {

  get nextEventNumber(): number {
    return this.events.length + 1;
  }

  constructor(private db: AngularFireDatabase, private route: ActivatedRoute, private dialogs: MatDialog) {
  }
  game: any = {};

  allEvents: GameEvent[] = [];
  events: GameEvent[] = [];
  private games: any[] = [];
  private allGamesSubscription: Subscription;

  private _teamPlayerDict = {};
  private _playerDict = {};
  private _teamDict = {};

  private subscription: Subscription;
  private playerSubscription: Subscription;
  private teamSubscription: Subscription;
  private eventSubscription: Subscription;

  private static getPlayerId(p) {
    if (p == null) {
      return null;
    }

    return p.team + '_' + p.number;
  }

  ngOnInit() {
    const key = this.route.snapshot.params['key'];

    this.subscription = this.db.object('games/' + key).snapshotChanges()
      .subscribe(res => {
        this.game = res.payload.val();

        if (this.game.homeGoals < 0) {
          this.game.homeGoals = 0;
        }
        if (this.game.awayGoals < 0) {
          this.game.awayGoals = 0;
        }
      });

    this.allGamesSubscription = this.db.list('games').valueChanges().subscribe(
      games => {
        this.games = games;
      });

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

        this.allEvents = ev;

        this.events = ev.filter(e => e.gameId === this.game.id);

        this.events.sort((a, b) => a.id.localeCompare(b.id, [], {numeric: true}));

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
    this.allGamesSubscription.unsubscribe();
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

  addEvent(eventType: string, id: any, number: string | number, team: string, homeAway: string, add: string, againstTeam: againstTeam) {
    const ref = this.dialogs.open(AddEventComponent, {
      data: {
        eventType: eventType, id: id, number: number, team: team, homeAway: homeAway, add: add,
        players: this.getPlayers(team), againstTeam: againstTeam
      }
    });

    ref.afterClosed().subscribe(() => {
      setTimeout(() => this.updateStats(team), 100);
    });
  }

  private updateTeamStats(team: string) {
    const t = this.getTeam(team);

    t.goalsFor = this.allEvents.filter(e => e.team === team && e.eventType === GOAL).length;
    t.goalsAgainst = this.allEvents.filter(e => e.againstTeam === team && e.eventType === GOAL).length;

    t.penaltiesTaken = this.allEvents.filter(e => e.team === team && e.eventType === PENALTY)
      .map(e => (<Penalty>e).minutes)
      .reduce((acc, current) => acc + current, 0);
    t.penaltiesDrawn = this.allEvents.filter(e => e.againstTeam === team && e.eventType === PENALTY)
      .map(e => (<Penalty>e).minutes)
      .reduce((acc, current) => acc + current, 0);

    const startedGames = this.games.filter(g => g.started && (g.home === team || g.away === team));

    t.draws = startedGames.filter(g => g.homeGoals === g.awayGoals).length;

    const homeWins = startedGames.filter(g => g.homeGoals > g.awayGoals);
    const awayWins = startedGames.filter(g => g.awayGoals > g.homeGoals);

    t.homeWins = homeWins.filter(g => g.home === team).length;
    t.awayLosses = homeWins.filter(g => g.away === team).length;

    t.awayWins = awayWins.filter(g => g.away === team).length;
    t.homeLosses = awayWins.filter(g => g.home === team).length;

    t.wins = t.homeWins + t.awayWins;
    t.losses = t.homeLosses + t.awayLosses;

    t.points = t.wins * 2 + t.draws;

    this.db.list('teams').set(t.id, t).then();
  }

  private updateStats(primaryTeam: string) {
    this.game.homeGoals = this.events.filter(e => e.home && e.eventType === GOAL).length;
    this.game.awayGoals = this.events.filter(e => e.away && e.eventType === GOAL).length;

    this.game.started = true;

    this.db.list('games').set(this.game.id, this.game).then();

    setTimeout(() => {
      this.updateTeamStats(this.game.home);
      this.updateTeamStats(this.game.away);

      this.updateTeamPlayerStats(primaryTeam);
    }, 1000);
  }

  private updateTeamPlayerStats(team: string) {
    const players = this.getPlayers(team);
    const teamEvents = this.allEvents.filter(e => e.team === team);
    const teamGoals: Goal[] = <Goal[]>teamEvents.filter(e => e.eventType === GOAL);
    const teamPenalties: Penalty[] = <Penalty[]>teamEvents.filter(e => e.eventType === PENALTY);

    for (const player of players) {
      const id = GameComponent.getPlayerId(player);

      player.goals = teamGoals.filter(g => g.player === id).length;
      player.primaryAssists = teamGoals.filter(g => g.assist1 === id).length;
      player.secondaryAssists = teamGoals.filter(g => g.assist2 === id).length;

      player.assists = player.primaryAssists + player.secondaryAssists;

      player.points = player.goals + player.assists;

      player.penalties = teamPenalties.filter(p => p.player === id)
        .map(p => p.minutes)
        .reduce((acc, curr) => acc + curr, 0);

      this.db.list('players').set(id, player).then();
    }
  }
}
