using Microsoft.EntityFrameworkCore;
using ProductFlow.Api.Data;
using ProductFlow.Api.DTOs;
using ProductFlow.Api.Models;

namespace ProductFlow.Api.Services
{
    public class ProductService : IProductService
    {
        private readonly ProductFlowDbContext _context;

        public ProductService(ProductFlowDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductDto>> GetProductsAsync(string? productType = null, string? lifecycleStatus = null, string? format = null, string? search = null)
        {
            var query = _context.Products.Include(p => p.ProductOfferings).AsQueryable();

            if (!string.IsNullOrEmpty(productType))
                query = query.Where(p => p.ProductType == productType);

            if (!string.IsNullOrEmpty(lifecycleStatus))
                query = query.Where(p => p.LifecycleStatus == lifecycleStatus);

            if (!string.IsNullOrEmpty(format))
                query = query.Where(p => p.Format == format);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(p => p.Name.Contains(search) || (p.Description != null && p.Description.Contains(search)));

            var products = await query.ToListAsync();

            return products.Select(MapToDto);
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.ProductOfferings)
                .FirstOrDefaultAsync(p => p.Id == id);

            return product == null ? null : MapToDto(product);
        }

        public async Task<ProductDto?> GetProductBySkuAsync(string sku)
        {
            var product = await _context.Products
                .Include(p => p.ProductOfferings)
                .FirstOrDefaultAsync(p => p.Sku == sku);

            return product == null ? null : MapToDto(product);
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto createDto)
        {
            var product = new Product
            {
                Name = createDto.Name,
                Description = createDto.Description,
                Sku = createDto.Sku,
                ProductType = createDto.ProductType,
                Format = createDto.Format,
                LifecycleStatus = createDto.LifecycleStatus,
                Entitlements = createDto.Entitlements,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return MapToDto(product);
        }

        public async Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto updateDto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return null;

            if (updateDto.Name != null) product.Name = updateDto.Name;
            if (updateDto.Description != null) product.Description = updateDto.Description;
            if (updateDto.Sku != null) product.Sku = updateDto.Sku;
            if (updateDto.ProductType != null) product.ProductType = updateDto.ProductType;
            if (updateDto.Format != null) product.Format = updateDto.Format;
            if (updateDto.LifecycleStatus != null) product.LifecycleStatus = updateDto.LifecycleStatus;
            if (updateDto.Entitlements != null) product.Entitlements = updateDto.Entitlements;
            
            product.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _context.Entry(product)
                .Collection(p => p.ProductOfferings)
                .LoadAsync();

            return MapToDto(product);
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return false;

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return true;
        }

        private static ProductDto MapToDto(Product product)
        {
            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Sku = product.Sku,
                ProductType = product.ProductType,
                Format = product.Format,
                LifecycleStatus = product.LifecycleStatus,
                Entitlements = product.Entitlements,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt,
                ProductOfferings = product.ProductOfferings.Select(po => new ProductOfferingDto
                {
                    Id = po.Id,
                    ProductId = po.ProductId,
                    Brand = po.Brand,
                    Price = po.Price,
                    Currency = po.Currency,
                    DeliveryMethods = po.DeliveryMethods,
                    Jurisdictions = po.Jurisdictions,
                    CreatedAt = po.CreatedAt,
                    UpdatedAt = po.UpdatedAt
                }).ToList()
            };
        }
    }

    public class ProductOfferingService : IProductOfferingService
    {
        private readonly ProductFlowDbContext _context;

        public ProductOfferingService(ProductFlowDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductOfferingDto>> GetProductOfferingsAsync(int productId)
        {
            var offerings = await _context.ProductOfferings
                .Where(po => po.ProductId == productId)
                .ToListAsync();

            return offerings.Select(MapToDto);
        }

        public async Task<ProductOfferingDto?> GetProductOfferingByIdAsync(int id)
        {
            var offering = await _context.ProductOfferings.FindAsync(id);
            return offering == null ? null : MapToDto(offering);
        }

        public async Task<ProductOfferingDto> CreateProductOfferingAsync(CreateProductOfferingDto createDto)
        {
            var offering = new ProductOffering
            {
                ProductId = createDto.ProductId,
                Brand = createDto.Brand,
                Price = createDto.Price,
                Currency = createDto.Currency,
                DeliveryMethods = createDto.DeliveryMethods,
                Jurisdictions = createDto.Jurisdictions,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ProductOfferings.Add(offering);
            await _context.SaveChangesAsync();

            return MapToDto(offering);
        }

        public async Task<ProductOfferingDto?> UpdateProductOfferingAsync(int id, UpdateProductOfferingDto updateDto)
        {
            var offering = await _context.ProductOfferings.FindAsync(id);
            if (offering == null) return null;

            if (updateDto.Brand != null) offering.Brand = updateDto.Brand;
            if (updateDto.Price.HasValue) offering.Price = updateDto.Price;
            if (updateDto.Currency != null) offering.Currency = updateDto.Currency;
            if (updateDto.DeliveryMethods != null) offering.DeliveryMethods = updateDto.DeliveryMethods;
            if (updateDto.Jurisdictions != null) offering.Jurisdictions = updateDto.Jurisdictions;
            
            offering.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return MapToDto(offering);
        }

        public async Task<bool> DeleteProductOfferingAsync(int id)
        {
            var offering = await _context.ProductOfferings.FindAsync(id);
            if (offering == null) return false;

            _context.ProductOfferings.Remove(offering);
            await _context.SaveChangesAsync();
            return true;
        }

        private static ProductOfferingDto MapToDto(ProductOffering offering)
        {
            return new ProductOfferingDto
            {
                Id = offering.Id,
                ProductId = offering.ProductId,
                Brand = offering.Brand,
                Price = offering.Price,
                Currency = offering.Currency,
                DeliveryMethods = offering.DeliveryMethods,
                Jurisdictions = offering.Jurisdictions,
                CreatedAt = offering.CreatedAt,
                UpdatedAt = offering.UpdatedAt
            };
        }
    }

    public class CategoryService : ICategoryService
    {
        private readonly ProductFlowDbContext _context;

        public CategoryService(ProductFlowDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CategoryDto>> GetCategoriesAsync()
        {
            var categories = await _context.Categories.ToListAsync();
            return categories.Select(MapToDto);
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            return category == null ? null : MapToDto(category);
        }

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createDto)
        {
            var category = new Category
            {
                Name = createDto.Name,
                Description = createDto.Description,
                Color = createDto.Color,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return MapToDto(category);
        }

        public async Task<CategoryDto?> UpdateCategoryAsync(int id, UpdateCategoryDto updateDto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return null;

            if (updateDto.Name != null) category.Name = updateDto.Name;
            if (updateDto.Description != null) category.Description = updateDto.Description;
            if (updateDto.Color != null) category.Color = updateDto.Color;
            
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return MapToDto(category);
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return false;

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }

        private static CategoryDto MapToDto(Category category)
        {
            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Color = category.Color,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt
            };
        }
    }
}