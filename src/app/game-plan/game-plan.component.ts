import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {GamePlanDatasource, GamePlanItem} from './game-plan-datasource';

import {AngularFireDatabase} from '@angular/fire/compat/database';

import {Subscription} from 'rxjs';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';

/*
current: boolean;
final: boolean;
homePenalties: number;
awayPenalties: number;
events: GameEvent[];

 */

@Component({
  selector: 'app-game-plan',
  template: `
    <div class="mat-elevation-z8">
      <table mat-table class="full-width-table" [dataSource]="dataSource" matSort aria-label="Elements">

        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>#</th>
          <td mat-cell *matCellDef="let row">{{row.id}}</td>
        </ng-container>

        <ng-container matColumnDef="gameType">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Tyyppi</th>
          <td mat-cell *matCellDef="let row">{{row.gameType}}</td>
        </ng-container>

        <ng-container matColumnDef="schedule">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Aika</th>
          <td mat-cell *matCellDef="let row">{{row.schedule}}</td>
        </ng-container>

        <ng-container matColumnDef="home">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Koti</th>
          <td mat-cell *matCellDef="let row">{{getTeam(row.home)?.name}}</td>
        </ng-container>

        <ng-container matColumnDef="goals">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Maalit</th>
          <td mat-cell *matCellDef="let row">{{row.homeGoals}} - {{row.awayGoals}}</td>
        </ng-container>

        <ng-container matColumnDef="away">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Vieras</th>
          <td mat-cell *matCellDef="let row">{{getTeam(row.away)?.name}}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Toiminnot</th>
          <td mat-cell *matCellDef="let row">
            <button mat-raised-button [routerLink]="['/add-game', row.id]">Muokkaa</button>
            &nbsp;
            <button mat-raised-button [routerLink]="['/game', row.id]">Pelaa</button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <!--suppress JSUnusedLocalSymbols -->
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      <mat-paginator #paginator
                     [length]="dataSource.data.length"
                     [pageIndex]="0"
                     [pageSize]="50"
                     [pageSizeOptions]="[25, 50, 100, 250]">
      </mat-paginator>

    </div>

    <mat-card>
      <mat-card-actions>
        <button mat-fab [routerLink]="['/add-game', nextGameId]">
          <mat-icon>add</mat-icon>
        </button>
      </mat-card-actions>
    </mat-card>`,
  styleUrls: ['./game-plan.component.scss'],
})
export class GamePlanComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort = new MatSort();
  dataSource: GamePlanDatasource;

  _teamPlayerDict = {};
  _playerDict = {};
  _teamDict = {};

  nextGameId = 1;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'gameType', 'schedule', 'home', 'goals', 'away', 'actions'];

  private subscription: Subscription;
  private playerSubscription: Subscription;
  private teamSubscription: Subscription;

  constructor(private db: AngularFireDatabase) {

  }

  ngOnInit() {
    this.dataSource = new GamePlanDatasource(this.paginator, this.sort);

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

    this.subscription = this.db.list<GamePlanItem>('games').valueChanges().subscribe(data => {
      console.log('data streaming');

      if (data.length > 0) {
        data.sort((a, b) => a.id.localeCompare(b.id, [], {numeric: true}));
        this.nextGameId = parseInt(data[data.length - 1].id, 10) + 1;
      }

      this.dataSource = new GamePlanDatasource(this.paginator, this.sort);
      this.dataSource.data = data;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.teamSubscription.unsubscribe();
    this.playerSubscription.unsubscribe();
  }

  getPlayers(team: string) {
    return this._teamPlayerDict[team] != null ? this._teamPlayerDict[team] : [];
  }

  getPlayer(team: string, number: string) {
    return this._playerDict[team + '_' + number];
  }

  getTeam(team: string) {
    return this._teamDict[team];
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
