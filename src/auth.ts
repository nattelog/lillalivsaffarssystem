export interface Auth {
  isAuthenticated: () => Promise<boolean>;
  authenticate: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

export class AuthStub implements Auth {
  private status: boolean;
  private username: string | undefined;

  constructor() {
    this.status = false;
    this.username = undefined;
  }

  public async isAuthenticated() {
    return this.status;
  }

  public async authenticate(username: string, password: string)  {
    this.status = username === "a@a" && password === "a";
    this.username = username;
    return this.isAuthenticated();
  }

  public async signOut() {
    this.status = false;
  }
}

export class FirebaseAuth implements Auth {
  private readonly firebaseAuth: firebase.auth.Auth;
  private user: firebase.User | null;

  constructor(firebaseAuth: firebase.auth.Auth) {
    this.firebaseAuth = firebaseAuth;
    this.user = this.firebaseAuth.currentUser;

    this.firebaseAuth.onAuthStateChanged(user => this.user = user);
  }

  public async isAuthenticated() {
    return this.user !== null;
  }

  public async authenticate(username: string, password: string)  {
    return this.firebaseAuth.signInWithEmailAndPassword(username, password)
      .then(() => true)
      .catch(() => false);
  }

  public async signOut() {
    return this.firebaseAuth.signOut();
  }
}
