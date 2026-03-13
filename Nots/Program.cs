using Microsoft.EntityFrameworkCore;
using Nots.Data;
using Nots.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// <-- NEW: Swapped In-Memory for a real SQLite file!
builder.Services.AddDbContext<AppDbContext>(options => 
    options.UseSqlite("Data Source=neural_notes.db")); 

builder.Services.AddCors(options => 
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
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