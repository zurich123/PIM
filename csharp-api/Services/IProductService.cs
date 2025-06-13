using ProductFlow.Api.DTOs;
using ProductFlow.Api.Models;

namespace ProductFlow.Api.Services
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetProductsAsync(string? productType = null, string? lifecycleStatus = null, string? format = null, string? search = null);
        Task<ProductDto?> GetProductByIdAsync(int id);
        Task<ProductDto?> GetProductBySkuAsync(string sku);
        Task<ProductDto> CreateProductAsync(CreateProductDto createDto);
        Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto updateDto);
        Task<bool> DeleteProductAsync(int id);
    }

    public interface IProductOfferingService
    {
        Task<IEnumerable<ProductOfferingDto>> GetProductOfferingsAsync(int productId);
        Task<ProductOfferingDto?> GetProductOfferingByIdAsync(int id);
        Task<ProductOfferingDto> CreateProductOfferingAsync(CreateProductOfferingDto createDto);
        Task<ProductOfferingDto?> UpdateProductOfferingAsync(int id, UpdateProductOfferingDto updateDto);
        Task<bool> DeleteProductOfferingAsync(int id);
    }

    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetCategoriesAsync();
        Task<CategoryDto?> GetCategoryByIdAsync(int id);
        Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createDto);
        Task<CategoryDto?> UpdateCategoryAsync(int id, UpdateCategoryDto updateDto);
        Task<bool> DeleteCategoryAsync(int id);
    }
}