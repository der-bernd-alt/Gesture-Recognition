import asyncio
import websockets
import json
import pyautogui
from screeninfo import get_monitors
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get primary monitor resolution
monitor = get_monitors()[0]
SCREEN_WIDTH = monitor.width
SCREEN_HEIGHT = monitor.height

class MouseControlServer:
    def __init__(self, host="localhost", port=8765):
        self.host = host
        self.port = port
        # Prevent pyautogui from raising exceptions when reaching screen borders
        pyautogui.FAILSAFE = False

    async def handle_message(self, websocket):
        async for message in websocket:
            print(f"Received message: {message}") 
            try:
                data = json.loads(message)
                command = data.get('command')
                
                if command == 'move':
                    movement_type = data.get('type', 'absolute')
                    x = data.get('x', 0)
                    y = data.get('y', 0)
                    
                    if movement_type == 'absolute':
                        if data.get('isPercentage', False):
                            # Convert percentage to pixels
                            x = int(SCREEN_WIDTH * (x / 100))
                            y = int(SCREEN_HEIGHT * (y / 100))
                        pyautogui.moveTo(x, y)
                    
                    elif movement_type == 'relative':
                        if data.get('isPercentage', False):
                            # Convert percentage to pixels
                            x = int(SCREEN_WIDTH * (x / 100))
                            y = int(SCREEN_HEIGHT * (y / 100))
                        pyautogui.moveRel(x, y)
                    
                    # Send back current mouse position
                    current_pos = pyautogui.position()
                    await websocket.send(json.dumps({
                        'type': 'position',
                        'x': current_pos.x,
                        'y': current_pos.y,
                        'screenWidth': SCREEN_WIDTH,
                        'screenHeight': SCREEN_HEIGHT
                    }))
                
                elif command == 'get_screen_info':
                    await websocket.send(json.dumps({
                        'type': 'screen_info',
                        'width': SCREEN_WIDTH,
                        'height': SCREEN_HEIGHT
                    }))

            except json.JSONDecodeError:
                logger.error("Invalid JSON received")
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")

    async def start(self):
        async with websockets.serve(self.handle_message, self.host, self.port):
            logger.info(f"Mouse Control Server running on ws://{self.host}:{self.port}")
            await asyncio.Future()  # run forever

if __name__ == "__main__":
    server = MouseControlServer()
    asyncio.run(server.start()) 