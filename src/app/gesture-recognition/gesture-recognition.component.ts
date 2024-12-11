import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var handPoseDetection: any;

@Component({
  selector: 'app-gesture-recognition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gesture-recognition.component.html',
  styleUrl: './gesture-recognition.component.scss'
})
export class GestureRecognitionComponent implements OnInit {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  private detector: any;
  private ctx!: CanvasRenderingContext2D;
  isWebcamActive = false;
  isModelLoaded = false;

  async ngOnInit() {
    try {
      // Wait for TensorFlow.js and MediaPipe to be fully loaded
      await this.waitForTFJS();
      
      // Initialize the detector
      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detectorConfig = {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
        modelType: 'lite' // Changed to 'lite' for better performance
      };
      
      this.detector = await handPoseDetection.createDetector(model, detectorConfig);
      this.isModelLoaded = true;
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error initializing model:', error);
    }
  }

  private waitForTFJS(): Promise<void> {
    return new Promise((resolve) => {
      const checkTFJS = () => {
        if (window.hasOwnProperty('handPoseDetection')) {
          resolve();
        } else {
          setTimeout(checkTFJS, 100);
        }
      };
      checkTFJS();
    });
  }

  async startWebcam() {
    if (!this.isModelLoaded) {
      console.error('Model not loaded yet');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        }
      });

      this.video.nativeElement.srcObject = stream;
      await new Promise((resolve) => {
        this.video.nativeElement.onloadedmetadata = () => {
          resolve(true);
        };
      });

      this.video.nativeElement.play();
      this.isWebcamActive = true;
      this.ctx = this.canvas.nativeElement.getContext('2d')!;
      this.detectHands();
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  }

  async detectHands() {
    if (!this.isWebcamActive || !this.detector) return;

    try {
      // Detect hands
      const hands = await this.detector.estimateHands(this.video.nativeElement);

      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

      // Draw video frame
      this.ctx.drawImage(
        this.video.nativeElement,
        0, 0,
        this.canvas.nativeElement.width,
        this.canvas.nativeElement.height
      );

      // Draw hand landmarks
      hands.forEach((hand: any) => {
        const keypoints = hand.keypoints;
        
        // Draw dots for each keypoint
        keypoints.forEach((keypoint: any) => {
          this.ctx.beginPath();
          this.ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
          this.ctx.fillStyle = 'red';
          this.ctx.fill();
        });

        // Connect keypoints with lines
        this.ctx.beginPath();
        this.ctx.moveTo(keypoints[0].x, keypoints[0].y);
        keypoints.forEach((keypoint: any) => {
          this.ctx.lineTo(keypoint.x, keypoint.y);
        });
        this.ctx.strokeStyle = 'blue';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      });

      // Continue detection
      requestAnimationFrame(() => this.detectHands());
    } catch (error) {
      console.error('Error in hand detection:', error);
      // Try to continue despite error
      requestAnimationFrame(() => this.detectHands());
    }
  }
}
