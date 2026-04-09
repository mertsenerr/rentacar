using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

public class EmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiToken;

    public EmailService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiToken = configuration["Resend:ApiToken"]
            ?? throw new InvalidOperationException("Resend:ApiToken is not configured.");
    }

    public async Task SendPasswordResetAsync(string toEmail, string resetLink)
    {
        var payload = new
        {
            from = "onboarding@resend.dev",
            to = new[] { toEmail },
            subject = "Şifre Sıfırlama - Corporate Elite",
            html = $@"
                <h2>Şifre Sıfırlama</h2>
                <p>Aşağıdaki butona tıklayarak şifrenizi sıfırlayabilirsiniz.</p>
                <a href='{resetLink}' style='padding:12px 24px; background:#000; color:#fff; text-decoration:none; border-radius:6px;'>
                    Şifremi Sıfırla
                </a>
                <p>Bu link <b>1 saat</b> geçerlidir.</p>
                <p>Bu talebi siz yapmadıysanız emaili görmezden gelin.</p>
            "
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiToken);

        var response = await _httpClient.SendAsync(request);
        var body = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException($"Resend API error {(int)response.StatusCode}: {body}");
    }
}
