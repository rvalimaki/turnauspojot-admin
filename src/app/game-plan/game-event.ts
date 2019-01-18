export class GameEvent {
  id: string;
  date: Date;
  timestamp: number;
  home: boolean;
  away: boolean;

  constructor(public team: string, public gameId: string, public number: string, public eventType: string, homeAway: string,
              public againstTeam: string) {
    this.date = new Date();
    this.timestamp = this.date.getTime();

    this.id = gameId + '_' + number;

    switch (homeAway) {
      case 'home':
        this.home = true;
        break;
      case 'away':
        this.away = true;
        break;
      default:
        break;
    }
  }
}

export class Goal extends GameEvent {
  player: string;
  assist1: string;
  assist2: string;

  score: string;
}

export class Penalty extends GameEvent {
  player: string;
  readable: string;
  minutes: number;
  reason: string;
}
