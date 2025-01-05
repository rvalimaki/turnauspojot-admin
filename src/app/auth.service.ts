import { Injectable } from "@angular/core";
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";
import { BehaviorSubject, Observable } from "rxjs";
import { firebaseConfig } from "./firebaseConfig";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private firebaseApp;
  private userSubject = new BehaviorSubject<User | null>(null);

  constructor() {
    if (!getApps().length) {
      this.firebaseApp = initializeApp(firebaseConfig);
    } else {
      this.firebaseApp = getApp();
    }

    const auth = getAuth(this.firebaseApp);
    auth.onAuthStateChanged((user) => {
      this.userSubject.next(user);
    });
  }

  async googleSignIn() {
    const auth = getAuth(this.firebaseApp);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("User Info:", result.user);
      this.userSubject.next(result.user);
      return result.user;
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  }

  async signOut() {
    const auth = getAuth(this.firebaseApp);
    await auth.signOut();
    this.userSubject.next(null);
  }

  getUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }
}
