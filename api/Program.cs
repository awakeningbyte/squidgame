using SquidGame.Api.Hubs;
const string FRONTEND = "frontend";

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(Options => {
    Options.AddPolicy(FRONTEND, builder => {
        builder
        .AllowAnyOrigin()
        //.WithOrigins("http://localhost:1234") 
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()
        ;
    });
});

builder.Services.AddSignalR();

var app = builder.Build();
app.UseRouting();
app.UseCors(FRONTEND);
app.UseEndpoints(endpoints =>endpoints.MapHub<GameHub>("/gameHub"));
app.Run();
