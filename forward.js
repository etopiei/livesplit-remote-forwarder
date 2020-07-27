// Here is where we need to start the websocket server.
const WebSocket = require('ws');
const Net = require('net');

const wss = new WebSocket.Server({ port: 8055 });

const port = 16834;
const remoteServer = new Net.Server();

let STARTED = false;

function mapRemoteRequestToOne(req) {
	console.log(`Mapping request: ${req} while STARTED = ${STARTED}`);
	if (req.indexOf('starttimer') > -1 && !STARTED) {
		console.log("STARTING RUN!");
		STARTED = true;
		return 'start';
	} else if (req.indexOf('starttimer') > -1) {
		// Here we want to split, because the button has been pressed again.
		console.log("Split instead of start");
		return 'split';
	} else if (req.indexOf('split') > -1) {
		return 'split';
	}
}

wss.on("connection", (socket, req) => {

	console.log("Live Split connected!");
	console.log("Starting remote server");

	remoteServer.listen(port, () => {
		console.log(`Listening on: ${port}`);
	});

	remoteServer.on('connection', (remoteSocket) => {
		console.log("Remote and LiveSplit are Connected");

		remoteSocket.on('data', (data) => {

			console.log(`Got data from remote: ${data}`);

			if (data.indexOf('getcurrenttimerphase') > -1) {
				console.log("Handling message one.livesplit can't yet");
				remoteSocket.write(`NotRunning\r\n`);
			} else if (data.indexOf('getcurrenttime') > -1) {
				console.log("Handling message one.livesplit can't yet");
				remoteSocket.write(`00:00.00\r\n`);
			} else {
				socket.send(mapRemoteRequestToOne(data));
			}

		});

		socket.onmessage = (ev) => {
			console.log(`Got data from livesplit: ${ev.data}`);
			remoteSocket.write(ev.data);
		};
	});

});

