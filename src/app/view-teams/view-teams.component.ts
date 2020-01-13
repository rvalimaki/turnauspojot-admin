import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ViewTeamsDataSource, ViewTeamsItem} from './view-teams-datasource';

import {AngularFireDatabase} from '@angular/fire/database';

import {Subscription} from 'rxjs';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-view-teams',
  templateUrl: './view-teams.component.html',
  styleUrls: ['./view-teams.component.scss'],
})
export class ViewTeamsComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: ViewTeamsDataSource;

  _playerDict = {};

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'name', 'record', 'players', 'actions'];

  private subscription: Subscription;
  private playerSubscription: Subscription;

  constructor(private db: AngularFireDatabase) {

  }

  ngOnInit() {
    this.dataSource = new ViewTeamsDataSource(this.paginator, this.sort);

    this.playerSubscription = this.db.list('players').valueChanges().subscribe(
      players => {
        this.setPlayerDictionary(players);
      }
    );

    this.subscription = this.db.list<ViewTeamsItem>('teams').valueChanges().subscribe(data => {
      console.log('data streaming');
      this.dataSource = new ViewTeamsDataSource(this.paginator, this.sort);
      this.dataSource.data = data;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.playerSubscription.unsubscribe();
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
    }
  }

  getRecord(row: any) {
    if (row == null || row.wins == null || row.draws == null || row.losses == null) {
      return '-';
    }

    return row.wins + '-' + row.draws + '-' + row.losses;
  }
}
