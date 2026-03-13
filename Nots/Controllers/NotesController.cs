using Microsoft.EntityFrameworkCore;
using Nots.Data;
using Nots.Models;
using Microsoft.AspNetCore.Mvc;

namespace Nots.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotesController : ControllerBase
{
    private readonly AppDbContext _context;
    public NotesController(AppDbContext context)
    {
        _context = context;
    }

    // <-- THIS WAS MISSING! (Gets ALL notes for the Gallery)
    [HttpGet]
    public async Task<IActionResult> GetNotes()
    {
        var notes = await _context.Notes.ToListAsync();
        return Ok(notes);
    }

    // <-- Your new method! (Gets ONE note for the View page)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetNote(int id)
    {
        var note = await _context.Notes.FindAsync(id);
        if (note == null) { return NotFound(); }
        return Ok(note);
    }

    [HttpPost]
    public async Task<IActionResult> PostNote(Note newNote)
    {
        _context.Notes.Add(newNote);
        await _context.SaveChangesAsync();
        return Ok(newNote);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNote(int id)
    {
        var note = await _context.Notes.FindAsync(id);
        if (note == null) { return NotFound(); }
        _context.Notes.Remove(note);
        await _context.SaveChangesAsync();
        return Ok(note);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutNote(int id, Note incomingNote)
    {
        var existingNote = await _context.Notes.FindAsync(id);
        if (existingNote == null) { return NotFound(); }

        existingNote.Title = incomingNote.Title;
        existingNote.Content = incomingNote.Content;
        await _context.SaveChangesAsync();
        return Ok(existingNote);
    }
}