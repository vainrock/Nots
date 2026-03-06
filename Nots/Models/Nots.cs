namespace Nots.Models;

public class Note
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int Id { get; set; }
    public DateTime Created { get; set; } = DateTime.UtcNow;
}