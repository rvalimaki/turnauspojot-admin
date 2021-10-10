import {Component, OnInit} from '@angular/core';

import {AngularFireDatabase} from '@angular/fire/compat/database';

@Component({
  selector: 'app-add-teams',
  templateUrl: './add-teams.component.html',
  styleUrls: ['./add-teams.component.scss']
})
export class AddTeamsComponent implements OnInit {

  team: any = {};

  constructor(private db: AngularFireDatabase) {

  }

  ngOnInit() {

  }

  onSubmit() {
    this.db.list('teams').set(this.team.id, this.team)
      .then(() => {
        this.team = {};
        console.log('success');
      });
  }
}
