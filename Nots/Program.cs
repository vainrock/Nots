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

// <-- NEW: This forces C# to build the physical database file before starting
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.EnsureCreated();
}

app.UseCors("AllowAngular");
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.Run();