import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PopupComponent } from './page-components/pop-up/pop-up.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PopupComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'pet-store-frontend';
}
