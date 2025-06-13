using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace ProductFlow.Api.Middleware
{
    public class ApiKeyAuthenticationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly string _apiKey;

        public ApiKeyAuthenticationMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _apiKey = configuration["ApiKey"] ?? throw new InvalidOperationException("API Key not configured");
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Skip authentication for Swagger and health endpoints
            if (context.Request.Path.StartsWithSegments("/swagger") ||
                context.Request.Path.StartsWithSegments("/api/docs") ||
                context.Request.Path.StartsWithSegments("/health") ||
                context.Request.Method == "OPTIONS")
            {
                await _next(context);
                return;
            }

            // Only authenticate external API routes
            if (!context.Request.Path.StartsWithSegments("/api/external"))
            {
                await _next(context);
                return;
            }

            if (!context.Request.Headers.TryGetValue("x-api-key", out var extractedApiKey))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("API Key missing");
                return;
            }

            if (!string.Equals(extractedApiKey, _apiKey, StringComparison.Ordinal))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsync("Invalid API Key");
                return;
            }

            await _next(context);
        }
    }
}