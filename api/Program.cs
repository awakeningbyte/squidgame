using SquidGame.Api.Hubs;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
builder.Services.AddSignalR();
app.MapGet("/", () => "Welcome to the Game!");
app.MapHub<GameHub>("/gameHub");
app.Run();
