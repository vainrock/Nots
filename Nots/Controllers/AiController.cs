using Microsoft.AspNetCore.Mvc;
using Nots.Services;

namespace Nots.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AiController : ControllerBase
{
    private readonly DeepSeekService _aiService;

    public AiController(DeepSeekService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate([FromBody] GenerateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Keywords)) 
            return BadRequest("Data stream empty. Keywords required.");
        
        try 
        {
            var result = await _aiService.GenerateNoteAsync(request.Keywords);
            return Ok(new { generatedContent = result });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"AI Engine Failure: {ex.Message}");
        }
    }
}

// A simple DTO (Data Transfer Object) to catch the incoming keywords
public class GenerateRequest
{
    public string Keywords { get; set; } = string.Empty;
}