import * as signalR from '@microsoft/signalr'
import * as service from './service'
let infoBar = document.getElementById("info")

const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7091/gamehub")
    .configureLogging(signalR.LogLevel.Information)
    .build();

async function start() {
    try {
        await connection.start();
        //console.log("SignalR Connected.");
        infoBar.textContent = "game room connected."
        //await service()
    } catch (err) {
        console.log(err);
        setTimeout(start, 5000);
    }
};

connection.onclose(async () => {
    infoBar.textContent = "game room disconnected."
    await start();
});

// Start the connection.
start();
service.run();