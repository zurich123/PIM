using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

// Simple C# client to test the ProductFlow API
public class ProductFlowApiClient
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _baseUrl;

    public ProductFlowApiClient(string baseUrl, string apiKey)
    {
        _httpClient = new HttpClient();
        _apiKey = apiKey;
        _baseUrl = baseUrl;
        _httpClient.DefaultRequestHeaders.Add("x-api-key", apiKey);
    }

    public async Task<string> GetCategoriesAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync($"{_baseUrl}/api/external/categories");
            return await response.Content.ReadAsStringAsync();
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }

    public async Task<string> GetProductsAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync($"{_baseUrl}/api/external/products");
            return await response.Content.ReadAsStringAsync();
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }

    public async Task<string> CreateCategoryAsync(string name, string description, string color)
    {
        try
        {
            var category = new
            {
                name = name,
                description = description,
                color = color
            };

            var json = JsonSerializer.Serialize(category);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            var response = await _httpClient.PostAsync($"{_baseUrl}/api/external/categories", content);
            return await response.Content.ReadAsStringAsync();
        }
        catch (Exception ex)
        {
            return $"Error: {ex.Message}";
        }
    }
}

// Simple test program
public class Program
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("ProductFlow C# API Client Test");
        Console.WriteLine("==============================");

        var client = new ProductFlowApiClient("http://localhost:6000", "test-api-key-12345");

        Console.WriteLine("Testing Categories endpoint...");
        var categories = await client.GetCategoriesAsync();
        Console.WriteLine($"Categories: {categories}");
        Console.WriteLine();

        Console.WriteLine("Testing Products endpoint...");
        var products = await client.GetProductsAsync();
        Console.WriteLine($"Products: {products}");
        Console.WriteLine();

        Console.WriteLine("Testing Create Category...");
        var newCategory = await client.CreateCategoryAsync("Test Category", "Created from C# client", "orange");
        Console.WriteLine($"New Category: {newCategory}");
    }
}