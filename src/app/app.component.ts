import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SampleTextComponent } from "./sample-text/sample-text.component";
import { GestureRecognitionComponent } from './gesture-recognition/gesture-recognition.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SampleTextComponent, GestureRecognitionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gesture-recognition-app';
}
