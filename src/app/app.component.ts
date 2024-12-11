import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SampleTextComponent } from "./sample-text/sample-text.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SampleTextComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gesture-recognition-app';
}
