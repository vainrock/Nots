using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Nots.Services;

public class DeepSeekService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public DeepSeekService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _apiKey = config["DeepSeek:ApiKey"] ?? throw new ArgumentNullException("DeepSeek API Key is missing in appsettings!");
        
        // Lock the authorization header for all requests
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
    }

    public async Task<string> GenerateNoteAsync(string keywords)
    {
        // 1. The payload matching DeepSeek's chat format
        var requestBody = new
        {
            model = "deepseek-chat",
            messages = new[]
            {
                // UPGRADE: Rewired the prompt to force Russian output and strict summarization behavior
                new { role = "system", content = "You are an elite AI assistant. The user will provide a messy, raw voice transcript from a meeting or thought dump. Your job is to extract the main points, structure them logically, and write a cohesive, professional summary. ALL OUTPUT MUST BE STRICTLY IN RUSSIAN. Format the response entirely in Markdown using clear headings and bullet points." },
                new { role = "user", content = $"Raw Transcript: {keywords}" }
            },
            temperature = 0.3 //
        };

        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        
        // 2. Fire the request to the official DeepSeek API
        var response = await _httpClient.PostAsync("https://api.deepseek.com/chat/completions", content);
        response.EnsureSuccessStatusCode();

        // 3. Decode the raw JSON response
        var responseString = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(responseString);
        
        // Drill down into the JSON to extract the actual text
        var generatedText = jsonDoc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        return generatedText ?? "> ERROR: Neural link severed. No data received.";
    }
}