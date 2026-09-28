import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <!-- TODO étape 1 : supprimer ce message une fois les routes en place -->
    <p style="padding: 2rem; font-size: 1.2rem">🍔 YummyComponents — à vous de jouer ! (voir ENONCE.md)</p>

    <router-outlet />
  `,
})
export class App {}
