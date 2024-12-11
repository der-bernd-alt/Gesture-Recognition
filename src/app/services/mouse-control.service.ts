import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface MousePosition {
  x: number;
  y: number;
}

export interface ScreenInfo {
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class MouseControlService {
  private socket: WebSocket | null = null;
  private readonly SERVER_URL = 'ws://localhost:8765';

  private mousePosition = new BehaviorSubject<MousePosition | null>(null);
  private screenInfo = new BehaviorSubject<ScreenInfo | null>(null);
  private connectionStatus = new BehaviorSubject<boolean>(false);

  mousePosition$ = this.mousePosition.asObservable();
  screenInfo$ = this.screenInfo.asObservable();
  connectionStatus$ = this.connectionStatus.asObservable();

  constructor() {
    this.connect();
  }

  private connect(): void {
    this.socket = new WebSocket(this.SERVER_URL);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.connectionStatus.next(true);
      // Request screen info immediately after connection
      this.getScreenInfo();
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.connectionStatus.next(false);
      // Try to reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'position') {
        this.mousePosition.next({
          x: data.x,
          y: data.y
        });
      } else if (data.type === 'screen_info') {
        this.screenInfo.next({
          width: data.width,
          height: data.height
        });
      }
    };
  }

  moveMouse(x: number, y: number, isPercentage: boolean = false): void {
    console.log('Sending mouse move command:', { x, y, isPercentage });
    this.sendCommand({
      command: 'move',
      type: 'absolute',
      x,
      y,
      isPercentage
    });
  }

  moveMouseRelative(x: number, y: number, isPercentage: boolean = false): void {
    this.sendCommand({
      command: 'move',
      type: 'relative',
      x,
      y,
      isPercentage
    });
  }

  getScreenInfo(): void {
    this.sendCommand({
      command: 'get_screen_info'
    });
  }

  private sendCommand(data: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('Sending WebSocket command:', data);
      this.socket.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected. Ready state:', this.socket?.readyState);
    }
  }

  disconnect(): void {
    this.socket?.close();
  }
} 