import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  private pointerCoordinates = new BehaviorSubject<{
    absolute: Coordinate | null,
    relative: Coordinate | null
  } | null>(null);

  canvasWidth = 640;
  canvasHeight = 480;

  currentGesture$ = this.currentGesture.asObservable();
  allLandmarks$ = this.allLandmarks.asObservable();
  pointerCoordinates$ = this.pointerCoordinates.asObservable();

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
    const absolute = {
      x: landmarks[8].x,
      y: landmarks[8].y
    };
    
    const relative = {
      x: (landmarks[8].x / this.canvasWidth) * 100,
      y: (landmarks[8].y / this.canvasHeight) * 100
    };

    this.pointerCoordinates.next({
      absolute,
      relative
    });



    // Detect gesture
    this.detectGesture(landmarks);
  }

  private detectGesture(landmarks: any[]): void {
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