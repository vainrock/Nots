using Microsoft.EntityFrameworkCore;
using Nots.Data;
using Nots.Models;
using QuestPDF.Infrastructure;
QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// <-- NEW: Swapped In-Memory for a real SQLite file!
builder.Services.AddDbContext<AppDbContext>(options => 
    options.UseSqlite("Data Source=neural_notes.db")); 

builder.Services.AddHttpClient<Nots.Services.DeepSeekService>();

builder.Services.AddCors(options => 
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.AllowAnyOrigin()  // <-- Заменили WithOrigins на AllowAnyOrigin
            .AllowAnyHeader()
            .AllowAnyMethod();
    }));


var app = builder.Build();


app.UseCors("AllowAngular");
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.Run();