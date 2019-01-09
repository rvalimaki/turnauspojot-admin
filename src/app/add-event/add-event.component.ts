import {Component, OnDestroy, OnInit} from '@angular/core';

import {ViewTeamsItem} from '../view-teams/view-teams-datasource';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {GameEvent, Goal, Penalty} from '../game-plan/game-event';
import {AngularFireDatabase} from '@angular/fire/database';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss']
})
export class AddEventComponent implements OnInit, OnDestroy {
  teams: any[] = [];
  event: GameEvent;

  minutes: { readable: string, minutes: number };

  get goal(): Goal {
    return this.event != null && this.event.eventType === 'goal' ? <Goal>this.event : null;
  }

  get penalty(): Penalty {
    return this.event != null && this.event.eventType === 'penalty' ? <Penalty>this.event : null;
  }

  private _teamPlayerDict = {};
  private _teamDict = {};

  private playerSubscription: Subscription;
  private teamSubscription: Subscription;
  private eventSubscription: Subscription;

  penaltyMinutes: { readable: string, minutes: number }[] = [
    {readable: '3 min', minutes: 3},
    {readable: '3 + 3 min', minutes: 6},
    {readable: '10 min (henkilökohtainen)', minutes: 10},
    {readable: '3 + 10 min (henkilökohtainen)', minutes: 13},
    {readable: '8 + 20 min (ulosajo)', minutes: 28}
  ];

  penaltyReasons: string[] = [
    'Käytösrangaistus',
    'PR Pelirangaistus',
    'OR Ottelurangaistus',
    'Varusteiden korjaaminen',
    'Laitataklaus',
    'Rikkoutunut maila',
    'Ryntäys',
    'Poikittainen maila',
    'Pelin viivyttäminen',
    'Kyynärpäätaklaus',
    'Väkivaltaisuus',
    'Nyrkkitappelu',
    'OR Kohtuuttoman kova peli',
    'Kiinnipitäminen',
    'Korkea maila',
    'Koukkaaminen',
    'Estäminen',
    'Huitominen',
    'Keihästäminen',
    'Mailan tai muun esineen heitto',
    'Kampitus',
    'JR Joukkuerangaistus',
    'Maalin tahallinen siirtäminen',
    'JR Liikaa pelaajia jäällä',
    'Kiekon peittäminen/sulkeminen',
    'Automaattinen käytösrangaistus',
    'Selästä taklaaminen',
    'Mailan päällä lyöminen',
    'JR Rikkeet aloituksessa / Liian myöh. al.kent.',
    'Polvitaklaus',
    'OR Päällä iskeminen',
    'Kiinnipitäminen vastustajan mailasta',
    'Leikkaaminen',
    'Vartalotaklaus',
    'JR Joukkuerangaistus toimihenkilölle',
    'PR Toimihenkilön pelirangaistus',
    'Sääntöjen vastainen varuste',
    'Sukeltaminen',
    'Pelin viivyttäminen kiekko katsomoon',
    'Vaarallinen varuste',
    'Päähän kohdistuva taklaus',
    'OR Toimihenkilön ottelurangaistus',
    'OR Potkaiseminen',
    'Pelaajan lähteminen pelaaja/rang. penkiltä',
    'PR Toimihenkilön lähteminen pelaajapenkiltä',
    'Maalivahdin muu pieni rangaistus',
    'JR Varusteiden aiheeton mittauspyyntö',
    'Veritartuntojen ehkäiseminen',
    'OR Yleisön estäminen',
    'PR Mailan tai muun esineen heitt. pelialueelta',
    'JR Kieltäytyminen pelin aloittamisesta',
    'JR Rikkeet vaihtotapahtumassa',
  ];

  constructor(private db: AngularFireDatabase, private route: ActivatedRoute, private router: Router) {
    this.penaltyReasons.sort((a, b) => a.localeCompare(b));
  }

  ngOnInit() {
    const params = this.route.snapshot.params;

    const team = params['team'];
    const eventType = params['eventType'];
    const gameId = params['gameId'];
    const number = params['number'];
    const homeAway = params['homeAway'];
    const add = params['add'];

    const key = gameId + '_' + number;

    this.eventSubscription = this.db.object<GameEvent>('events/' + key).snapshotChanges()
      .subscribe(res => {
        this.event = res.payload.val();

        if (this.event == null) {
          switch (eventType) {
            case 'goal':
              const goal = new Goal(team, gameId, number, eventType, homeAway);
              goal.score = add;
              this.event = goal;
              break;
            case 'penalty':
              this.event = new Penalty(team, gameId, number, eventType, homeAway);
              break;
            default:
              break;
          }
        }

        if (this.penalty != null) {
          this.minutes = {minutes: this.penalty.minutes, readable: this.penalty.readable};
        }

        console.log(this.event);
      });

    this.playerSubscription = this.db.list('players').valueChanges().subscribe(
      players => {
        this.setPlayerDictionary(players);
      }
    );

    this.teamSubscription = this.db.list<ViewTeamsItem>('teams').valueChanges().subscribe(
      teams => {
        this.setTeamDictionary(teams);
      }
    );
  }

  ngOnDestroy() {
    this.teamSubscription.unsubscribe();
    this.playerSubscription.unsubscribe();

    if (this.eventSubscription != null) {
      this.eventSubscription.unsubscribe();
    }
  }

  getPlayers(team: string) {
    return this._teamPlayerDict[team] != null ? this._teamPlayerDict[team] : [];
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

    for (const p of players) {
      if (this._teamPlayerDict[p.team] == null) {
        this._teamPlayerDict[p.team] = [];
      }

      this._teamPlayerDict[p.team].push(p);
    }
  }

  private setTeamDictionary(teams: any[]) {
    this._teamDict = {};

    for (const t of teams) {
      this._teamDict[t.id] = t;
    }
  }

  onSubmit() {
    if (this.penalty != null && this.minutes != null) {
      this.penalty.minutes = this.minutes.minutes;
      this.penalty.readable = this.minutes.readable;
    }

    this.db.list('events').set(this.event.id, this.event)
      .then(() => {
        this.router.navigateByUrl('/game/' + this.event.gameId).then();
      });
  }

}
