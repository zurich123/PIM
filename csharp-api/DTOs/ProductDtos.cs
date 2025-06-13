using System.ComponentModel.DataAnnotations;

namespace ProductFlow.Api.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Sku { get; set; } = string.Empty;
        public string ProductType { get; set; } = string.Empty;
        public string? Format { get; set; }
        public string? LifecycleStatus { get; set; }
        public string? Entitlements { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<ProductOfferingDto> ProductOfferings { get; set; } = new();
    }

    public class CreateProductDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [StringLength(50)]
        public string Sku { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string ProductType { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Format { get; set; }

        [StringLength(50)]
        public string? LifecycleStatus { get; set; }

        [StringLength(500)]
        public string? Entitlements { get; set; }
    }

    public class UpdateProductDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(50)]
        public string? Sku { get; set; }

        [StringLength(50)]
        public string? ProductType { get; set; }

        [StringLength(50)]
        public string? Format { get; set; }

        [StringLength(50)]
        public string? LifecycleStatus { get; set; }

        [StringLength(500)]
        public string? Entitlements { get; set; }
    }

    public class ProductOfferingDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? Brand { get; set; }
        public decimal? Price { get; set; }
        public string? Currency { get; set; }
        public string? DeliveryMethods { get; set; }
        public string? Jurisdictions { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateProductOfferingDto
    {
        [Required]
        public int ProductId { get; set; }

        [StringLength(100)]
        public string? Brand { get; set; }

        public decimal? Price { get; set; }

        [StringLength(3)]
        public string? Currency { get; set; }

        [StringLength(200)]
        public string? DeliveryMethods { get; set; }

        [StringLength(200)]
        public string? Jurisdictions { get; set; }
    }

    public class UpdateProductOfferingDto
    {
        [StringLength(100)]
        public string? Brand { get; set; }

        public decimal? Price { get; set; }

        [StringLength(3)]
        public string? Currency { get; set; }

        [StringLength(200)]
        public string? DeliveryMethods { get; set; }

        [StringLength(200)]
        public string? Jurisdictions { get; set; }
    }

    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Color { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateCategoryDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(50)]
        public string? Color { get; set; }
    }

    public class UpdateCategoryDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(50)]
        public string? Color { get; set; }
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }
        public int? Count { get; set; }
    }
}