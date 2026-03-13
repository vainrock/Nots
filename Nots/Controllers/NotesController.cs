using Microsoft.EntityFrameworkCore;
using Nots.Data;
using Nots.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QuestPDF.Markdown;
using Markdig;

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
[HttpGet("{id}/export/pdf")]
    public async Task<IActionResult> ExportPdf(int id)
    {
        var note = await _context.Notes.FindAsync(id);
        if (note == null) return NotFound();

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                
                // FIXED: Swapped to Times New Roman
                page.DefaultTextStyle(x => x.FontFamily(Fonts.TimesNewRoman).FontSize(14).Weight(QuestPDF.Infrastructure.FontWeight.Normal));

                page.Header().Text(note.Title).FontFamily(Fonts.TimesNewRoman).SemiBold().FontSize(24).FontColor(Colors.Black);
                
                page.Content().PaddingVertical(1, Unit.Centimetre).Markdown(note.Content);
                
                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span($"Official Record | Generated: {DateTime.UtcNow:yyyy-MM-dd} | Page ");
                    x.CurrentPageNumber();
                });
            });
        });

        var pdfBytes = document.GeneratePdf();
        return File(pdfBytes, "application/pdf", $"{note.Title}.pdf");
    }

    [HttpGet("{id}/export/doc")]
    public async Task<IActionResult> ExportWord(int id)
    {
        var note = await _context.Notes.FindAsync(id);
        if (note == null) return NotFound();

        var pipeline = new MarkdownPipelineBuilder().UseAdvancedExtensions().Build();
        var parsedHtml = Markdown.ToHtml(note.Content, pipeline);

        // FIXED: Swapped the CSS body font to Times New Roman
        var htmlContent = $@"
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>{note.Title}</title>
                <style>
                    body {{ font-family: 'Times New Roman', serif; }}
                    p, span, div, li {{ font-weight: normal !important; font-size: 14pt; color: #000000; margin-bottom: 10pt; }}
                    h1, h2, h3 {{ font-weight: bold !important; color: #000000; }}
                    h1 {{ font-size: 24pt; margin-bottom: 15pt; }}
                </style>
            </head>
            <body>
                <h1>{note.Title}</h1>
                <hr/>
                {parsedHtml}
            </body>
            </html>";
            
        var bytes = Encoding.UTF8.GetBytes(htmlContent);
        return File(bytes, "application/msword", $"{note.Title}.doc");
    }

    [HttpGet("{id}/export/md")]
    public async Task<IActionResult> ExportMarkdown(int id)
    {
        var note = await _context.Notes.FindAsync(id);
        if (note == null) return NotFound();

        var mdContent = $"# {note.Title}\n\n*Logged: {note.Created:f}*\n\n---\n\n{note.Content}";
        var bytes = Encoding.UTF8.GetBytes(mdContent);
        
        return File(bytes, "text/markdown", $"{note.Title}.md");
    }
}