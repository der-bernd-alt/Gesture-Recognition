import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestureService, Coordinate } from '../services/gesture.service';

@Component({
  selector: 'app-coordinates-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coordinates-display.component.html',
  styleUrl: './coordinates-display.component.scss'
})
export class CoordinatesDisplayComponent implements OnInit {
  coordinates: Coordinate | null | undefined = null;

  constructor(private gestureService: GestureService) {}

  ngOnInit() {
    this.gestureService.pointerCoordinates$.subscribe(coords => {
      this.coordinates = coords?.relative;
    });
  }
} 