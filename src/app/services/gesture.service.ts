import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MouseControlService } from './mouse-control.service';

export type GestureType = 'thumbs_up' | 'thumbs_down' | 'stop' | 'ok';
export interface Coordinate {
  x: number;
  y: number;
}

@Injectable({
  providedIn: 'root'
})
export class GestureService {
  private currentGesture = new BehaviorSubject<GestureType | null>(null);
  private allLandmarks = new BehaviorSubject<Coordinate[] | null>(null);
  private pointerCoordinates = new BehaviorSubject<Coordinate | null>(null);

  currentGesture$ = this.currentGesture.asObservable();
  allLandmarks$ = this.allLandmarks.asObservable();
  pointerCoordinates$ = this.pointerCoordinates.asObservable();

  // Canvas dimensions for percentage calculations
  private readonly CANVAS_WIDTH = 640;
  private readonly CANVAS_HEIGHT = 480;
  private readonly MIRRORED = true;

  private readonly SENSITIVITY = 3; // 1 to 10, which part of the package to send

  private sensitivity_counter = 1;

  constructor(private mouseControl: MouseControlService) {
    // Subscribe to connection status
    this.mouseControl.connectionStatus$.subscribe(status => {
      console.log('WebSocket connection status:', status);
    });
  }

  updateLandmarks(landmarks: any[] | null): void {
    if (!landmarks) {
      this.allLandmarks.next(null);
      this.pointerCoordinates.next(null);
      this.currentGesture.next(null);
      return;
    }

    // Update all landmarks
    const formattedLandmarks = landmarks.map(point => ({
      x: point.x,
      y: point.y
    }));
    this.allLandmarks.next(formattedLandmarks);

    // Update pointer coordinates (index finger tip - landmark 8)
    const pointerCoord = {
      x: landmarks[8].x,
      y: landmarks[8].y
    };
    this.pointerCoordinates.next(pointerCoord);

    // Detect gesture first
    this.detectGesture(landmarks);

    // Convert canvas coordinates to percentage
    let xPercentage = (pointerCoord.x / this.CANVAS_WIDTH) * 100;
    let yPercentage = (pointerCoord.y / this.CANVAS_HEIGHT) * 100;

    if (this.MIRRORED) {
      pointerCoord.x = this.CANVAS_WIDTH - pointerCoord.x;
      xPercentage = 100 - xPercentage;
    }

    console.log('Moving cursor to:', {
      x: xPercentage,
      y: yPercentage,
      gesture: this.currentGesture.value
    });


    this.sensitivity_counter++;
    if (this.sensitivity_counter > this.SENSITIVITY) {
      this.mouseControl.moveMouse(xPercentage, yPercentage, true);
      this.sensitivity_counter = 1;
    }
  }

  private detectGesture(landmarks: any[]): void {
    const previousGesture = this.currentGesture.value;

    if (this.isThumbsUp(landmarks)) {
      this.currentGesture.next('thumbs_up');
    }
    else if (this.isThumbsDown(landmarks)) {
      this.currentGesture.next('thumbs_down');
    }
    else if (this.isStopSign(landmarks)) {
      this.currentGesture.next('stop');
    }
    else if (this.isOkSign(landmarks)) {
      this.currentGesture.next('ok');
    }
    else {
      this.currentGesture.next(null);
    }

    if (previousGesture !== this.currentGesture.value) {
      console.log('Gesture changed to:', this.currentGesture.value);
    }
  }

  private isThumbsUp(landmarks: any[]): boolean {
    if (!landmarks || landmarks.length < 21) return false;

    // Thumb should be pointing up
    const thumbTip = landmarks[4];
    const thumbBase = landmarks[2];

    // Other fingers should be closed (lower y position than their base)
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const indexBase = landmarks[5];
    const middleBase = landmarks[9];
    const ringBase = landmarks[13];
    const pinkyBase = landmarks[17];

    return (
      thumbTip.y < thumbBase.y - 30 && // Thumb pointing up
      indexTip.y > indexBase.y &&   // Other fingers closed
      middleTip.y > middleBase.y &&
      ringTip.y > ringBase.y &&
      pinkyTip.y > pinkyBase.y
    );
  }

  private isThumbsDown(landmarks: any[]): boolean {
    if (!landmarks || landmarks.length < 21) return false;

    const thumbTip = landmarks[4];
    const thumbBase = landmarks[2];

    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const indexBase = landmarks[5];
    const middleBase = landmarks[9];
    const ringBase = landmarks[13];
    const pinkyBase = landmarks[17];

    return (
      thumbTip.y > thumbBase.y + 30 && // Thumb pointing down
      indexTip.y > indexBase.y &&   // Other fingers closed
      middleTip.y > middleBase.y &&
      ringTip.y > ringBase.y &&
      pinkyTip.y > pinkyBase.y
    );
  }

  private isStopSign(landmarks: any[]): boolean {
    if (!landmarks || landmarks.length < 21) return false;

    const fingerTips = [
      landmarks[8],  // Index tip
      landmarks[12], // Middle tip
      landmarks[16], // Ring tip
      landmarks[20], // Pinky tip
    ];

    const fingerBases = [
      landmarks[5],  // Index base
      landmarks[9],  // Middle base
      landmarks[13], // Ring base
      landmarks[17], // Pinky base
    ];

    // All fingers should be extended (tips above bases)
    const allFingersExtended = fingerTips.every((tip, i) =>
      tip.y < fingerBases[i].y - 30
    );

    // Fingers should be relatively straight and parallel
    const yPositions = fingerTips.map(tip => tip.y);
    const maxYDiff = Math.max(...yPositions) - Math.min(...yPositions);

    return allFingersExtended && maxYDiff < 50;
  }

  private isOkSign(landmarks: any[]): boolean {
    if (!landmarks || landmarks.length < 21) return false;

    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];

    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const middleBase = landmarks[9];
    const ringBase = landmarks[13];
    const pinkyBase = landmarks[17];

    // Calculate distance between thumb and index finger
    const distance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) +
      Math.pow(thumbTip.y - indexTip.y, 2)
    );

    // Thumb and index should be close together
    const isCircleMade = distance < 30;

    // Other fingers should be extended
    const otherFingersExtended =
      middleTip.y < middleBase.y - 30 &&
      ringTip.y < ringBase.y - 30 &&
      pinkyTip.y < pinkyBase.y - 30;

    return isCircleMade && otherFingersExtended;
  }
} 