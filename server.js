const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 8080;

// Eğer istersen HTML/CSS/JS dosyalarını burada sunabilirsin
app.use(express.static('public'));

const server = http.createServer(app); // Express tabanlı HTTP sunucusu
const wss = new WebSocket.Server({ server }); // WebSocket sunucusunu HTTP'ye bağla

const clients = new Map();
const clientUsernames = new Map();
const voiceClients = new Set();
let voiceUsernames = [];

wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substring(2, 9);
    clients.set(id, ws);

    ws.send(JSON.stringify({ type: 'id', id }));
    broadcast(id, JSON.stringify({ type: 'new-user', id }));

    ws.on('message', (message) => {
        const msg = JSON.parse(message);

        if (msg.type === 'offer-created') {
            const targetWS = clients.get(msg.target);
            if (targetWS) {
                targetWS.send(JSON.stringify({
                    type: 'answer-req',
                    target: msg.target,
                    from: msg.from,
                    offer: msg.offer
                }));
            }
        }

        else if (msg.type === 'answer-created') {
            const targetWS = clients.get(msg.target);
            if (targetWS) {
                targetWS.send(JSON.stringify({
                    type: 'answer-created',
                    target: msg.target,
                    from: msg.from,
                    answer: msg.answer
                }));
            }
        }

        else if (msg.type === 'ice-candidate') {
            const targetWS = clients.get(msg.target);
            if (targetWS) {
                targetWS.send(JSON.stringify(msg));
            }
        }

        else if (msg.type === 'username-created') {
            clientUsernames.set(msg.id, msg.username);
        }

        else if (msg.type === 'voice-joined') {
            voiceClients.add(msg.id);
            for (let otherId of voiceClients) {
                if (otherId !== msg.id) {
                    const target = clients.get(otherId);
                    target.send(JSON.stringify({
                        type: 'voice-joined',
                        target: msg.id
                    }));
                }
            }
        }

        else if (msg.type === 'voice-users') {
            const update = voiceUsernames.find(username => username === msg.username);
            if (!update) {
                voiceUsernames.push(msg.username);
                broadcastA(JSON.stringify({
                    type: 'voice-users-update',
                    usernames: voiceUsernames,
                    muted: false
                }));
            }
        }

        else if (msg.type === 'voice-disconnected') {
            voiceClients.delete(msg.id);
            const username = clientUsernames.get(msg.id);
            const index = voiceUsernames.indexOf(username);
            if (index > -1) voiceUsernames.splice(index, 1);
            broadcastA(JSON.stringify({
                type: 'voice-users-update',
                usernames: voiceUsernames
            }));
        }

        else if (msg.type === 'voice-users-update') {
            broadcastA(JSON.stringify({
                type: 'voice-users-update',
                usernames: voiceUsernames,
                muted: msg.muted
            }));
        }

        else if (msg.type === 'voice-mic-update') {
            broadcastA(JSON.stringify({
                type: 'voice-users-update',
                usernames: voiceUsernames,
                spanElement: msg.spanElement
            }));
        }
    });

    // TODO: ws.on("close") eklenebilir
});

function broadcast(exceptId, message) {
    for (const [id, client] of clients) {
        if (id !== exceptId && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}

function broadcastA(message) {
    for (const [, client] of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
