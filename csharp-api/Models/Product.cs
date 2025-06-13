using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProductFlow.Api.Models
{
    public class Product
    {
        public int Id { get; set; }

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

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public virtual ICollection<ProductOffering> ProductOfferings { get; set; } = new List<ProductOffering>();
    }

    public class ProductOffering
    {
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [StringLength(100)]
        public string? Brand { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? Price { get; set; }

        [StringLength(3)]
        public string? Currency { get; set; }

        [StringLength(200)]
        public string? DeliveryMethods { get; set; }

        [StringLength(200)]
        public string? Jurisdictions { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public virtual Product Product { get; set; } = null!;
    }

    public class Category
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(50)]
        public string? Color { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}