import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, UserCredential } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth) {}

  async register({ email, password }): Promise<UserCredential | null> {
    if (!this.validateEmail(email) || !this.validatePassword(password)) {
      console.error('Invalid email or password format');
      return null;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('User registered');
      return userCredential;
    } catch (error) {
      this.handleAuthError(error);
      return null;
    }
  }

  async login({ email, password }): Promise<UserCredential | null> {
    if (!this.validateEmail(email) || !this.validatePassword(password)) {
      console.error('Invalid email or password format');
      return null;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential;
    } catch (error) {
      this.handleAuthError(error);
      return null;
    }
  }

  logout(): void {
    signOut(this.auth).catch(error => {
      console.error('Logout error:', error);
    });
  }

  getUser() {
    return this.auth.currentUser;
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePassword(password: string): boolean {
    return password.length >= 6; // Example: Minimum 6 characters
  }

  private handleAuthError(error: any): void {
    switch (error.code) {
      case 'auth/email-already-in-use':
        console.error('Email already in use');
        break;
      case 'auth/invalid-email':
        console.error('Invalid email');
        break;
      case 'auth/operation-not-allowed':
        console.error('Operation not allowed');
        break;
      case 'auth/weak-password':
        console.error('Weak password');
        break;
      case 'auth/user-disabled':
        console.error('User disabled');
        break;
      case 'auth/user-not-found':
        console.error('User not found');
        break;
      case 'auth/wrong-password':
        console.error('Wrong password');
        break;
      default:
        console.error('Authentication error:', error);
    }
  }
}
