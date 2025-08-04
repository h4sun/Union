# Union

Union is a real-time text and voice chat application built using WebSocket and WebRTC technologies. It uses a **mesh topology** for peer-to-peer voice connections, allowing users to join voice channels and communicate directly.

## Features

- Real-time text chat via WebSocket
- Voice chat using WebRTC mesh topology
- User login with username prompt
- Mute/unmute functionality for users
- Simple and clean UI built with Vanilla JS, HTML, and CSS
- Uses Google's public STUN server (`stun:stun.l.google.com:19302`)

## Technologies Used

- Node.js with the `ws` WebSocket library (server-side)
- WebRTC browser APIs (client-side)
- HTML, CSS, JavaScript for frontend
- Google STUN server for NAT traversal

## Installation and Running

1. Make sure Node.js is installed.

2. Install dependencies:

```bash
npm install ws
```

3. Run the server

```bash
node server/server.js
```

4. Open index.html in your browser to start using the app.
Microphone access permission is required for voice chat.

## Notes

- This project uses a **mesh topology** for WebRTC connections, meaning each peer connects directly to every other peer in the voice channel.
- This setup is intended for development and local use.
- For production environments, you should implement HTTPS, TURN servers, and other security measures.
- User authentication, message persistence, and other advanced features are not implemented yet.

## Future Improvements

- User avatars and profile management  
- Dynamic channel creation and management  
- Message history storage (e.g., database or local storage)  
- Responsive design and mobile support  
