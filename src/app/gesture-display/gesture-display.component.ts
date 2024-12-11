import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestureType } from '../services/gesture.service';

@Component({
  selector: 'app-gesture-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gesture-display.component.html',
  styleUrl: './gesture-display.component.scss'
})
export class GestureDisplayComponent {
  @Input() currentGesture: GestureType | null = null;

  getGestureEmoji(): string {
    switch (this.currentGesture) {
      case 'thumbs_up':
        return '👍';
      case 'thumbs_down':
        return '👎';
      case 'stop':
        return '✋';
      case 'ok':
        return '👌';
      default:
        return '🤚';
    }
  }

  getGestureText(): string {
    switch (this.currentGesture) {
      case 'thumbs_up':
        return 'Thumbs Up';
      case 'thumbs_down':
        return 'Thumbs Down';
      case 'stop':
        return 'Stop Sign';
      case 'ok':
        return 'OK Sign';
      default:
        return 'No Gesture Detected';
    }
  }
} 