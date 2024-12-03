import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  showPassword = false;

  credentials: FormGroup;
  auth = getAuth();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private authService: AuthService,

  ) {}
  // Easy access for form fields
  get email() {
    return this.credentials.get('email');
  }

  get password() {
    return this.credentials.get('password');
  }

  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async register() {
    const loading = await this.loadingController.create();
    await loading.present();

    const user = await this.authService.register(this.credentials.value);
    await loading.dismiss();

    if (user) {
      this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
    } else {
      this.showAlert('Registro Fallido', 'Intenta de nuevo');
    }
  }

  async login() {
    const loading = await this.loadingController.create();
    await loading.present();

    const user = await this.authService.login(this.credentials.value);
    await loading.dismiss();

    if (user) {
      this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
    } else {
      this.showAlert('Inicio de Sesión Fallido', 'Intenta de Nuevo');
    }
  }

  async resetPassword() {
    const email = this.credentials.get('email')?.value;
    if (!email) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo enviar el correo de restablecimiento. Verifica el email y vuelve a intentarlo.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }
  
    try {
      await sendPasswordResetEmail(this.auth, email);
      const alert = await this.alertController.create({
        header: 'Correo enviado',
        message: 'Hemos enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.',
        buttons: ['OK'],
      });
      await alert.present();
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo enviar el correo de restablecimiento. Verifica el email y vuelve a intentarlo.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }
  

  async showAlert(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();

    


  }
}
