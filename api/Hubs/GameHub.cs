using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;
namespace SquidGame.Api.Hubs;

[EnableCors("frontend")]
public class GameHub : Hub {
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
}