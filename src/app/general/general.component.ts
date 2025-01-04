import { Component, OnDestroy, OnInit } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/compat/database";
import { Observable, of, Subscription } from "rxjs";
import { catchError } from "rxjs/operators";

export interface GeneralData {
  title: string;
  date: Date | string; // Allow both types
}

@Component({
  selector: "app-general",
  template: `
    <div class="mat-elevation-z8">
      <h1>
        <mat-form-field>
          <input
            type="text"
            placeholder="Title"
            matInput
            [(ngModel)]="general.title"
            name="title"
          />
        </mat-form-field>
      </h1>

      <p>
        <mat-form-field>
          <mat-label>Date</mat-label>
          <input
            matInput
            [matDatepicker]="picker"
            [(ngModel)]="general.date"
            name="date"
          />
          <mat-datepicker-toggle
            matSuffix
            [for]="picker"
          ></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
      </p>

      <mat-card>
        <mat-card-actions>
          <button mat-fab (click)="save()">
            <mat-icon>save</mat-icon>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styleUrls: ["./general.component.scss"],
})
export class GeneralComponent implements OnInit, OnDestroy {
  generalData$: Observable<GeneralData>;
  general: GeneralData = { title: "", date: new Date() }; // Initialize with default values
  subscription: Subscription;

  constructor(private db: AngularFireDatabase) {}

  ngOnInit() {
    this.generalData$ = this.db
      .object<GeneralData>("general")
      .valueChanges()
      .pipe(
        catchError((error) => {
          console.error("Error fetching data:", error);
          return of(null); // Return null if the object doesn't exist
        })
      );

    this.subscription = this.generalData$.subscribe((data) => {
      if (data) {
        this.general = {
          ...data,
          date: data.date ? new Date(data.date) : new Date(), // Convert string to Date if necessary
        };
      } else {
        console.log("No general data found, using default values.");
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  save() {
    // Convert `date` back to a string before saving to Firebase
    const dataToSave: GeneralData = {
      ...this.general,
      date:
        this.general.date instanceof Date
          ? this.general.date.toISOString()
          : this.general.date,
    };

    this.db
      .object<GeneralData>("general")
      .set(dataToSave)
      .then(() => {
        console.log("Data saved successfully");
      })
      .catch((error) => {
        console.error("Error saving data:", error);
      });
  }
}
