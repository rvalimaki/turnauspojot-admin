import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {NavComponent} from './nav/nav.component';
import {LayoutModule} from '@angular/cdk/layout';
import {
  MatButtonModule,
  MatCardModule,
  MatDatepickerModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatNativeDateModule,
  MatOptionModule,
  MatPaginatorModule,
  MatSelectModule,
  MatSidenavModule,
  MatSortModule,
  MatTableModule,
  MatToolbarModule
} from '@angular/material';
import {AddTeamsComponent} from './add-teams/add-teams.component';
import {ViewTeamsComponent} from './view-teams/view-teams.component';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {EditTeamComponent} from './edit-team/edit-team.component';
import {AddPlayerComponent} from './add-player/add-player.component';
import {GameComponent} from './game/game.component';
import {GamePlanComponent} from './game-plan/game-plan.component';
import {AddGameComponent} from './add-game/add-game.component';
import {AddEventComponent} from './add-event/add-event.component';
import {firebaseConfig} from './firebaseConfig';
import {AngularFireModule} from '@angular/fire';
import {AngularFireDatabaseModule} from '@angular/fire/database';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    AddTeamsComponent,
    ViewTeamsComponent,
    EditTeamComponent,
    AddPlayerComponent,
    GameComponent,
    GamePlanComponent,
    AddGameComponent,
    AddEventComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,

    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,

    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,

    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,

    MatSelectModule,
    MatOptionModule,

    MatGridListModule,

    RouterModule.forRoot([
      {
        path: '', component: NavComponent, children: [
          {path: 'add-teams', component: AddTeamsComponent},
          {path: 'add-game/:key', component: AddGameComponent},
          {path: 'view-teams', component: ViewTeamsComponent},
          {path: 'edit-team/:key', component: EditTeamComponent},
          {path: 'add-player/:teamId/:key', component: AddPlayerComponent},
          {path: 'game-plan', component: GamePlanComponent},
          {path: 'game/:key', component: GameComponent},
          {path: 'add-event/:eventType/:gameId/:number/:team/:homeAway/:add', component: AddEventComponent}
        ]
      }])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
