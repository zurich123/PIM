using Microsoft.EntityFrameworkCore;
using ProductFlow.Api.Models;

namespace ProductFlow.Api.Data
{
    public class ProductFlowDbContext : DbContext
    {
        public ProductFlowDbContext(DbContextOptions<ProductFlowDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<ProductOffering> ProductOfferings { get; set; }
        public DbSet<Category> Categories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Product entity
            modelBuilder.Entity<Product>(entity =>
            {
                entity.ToTable("products");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.Sku).HasColumnName("sku");
                entity.Property(e => e.ProductType).HasColumnName("product_type");
                entity.Property(e => e.Format).HasColumnName("format");
                entity.Property(e => e.LifecycleStatus).HasColumnName("lifecycle_status");
                entity.Property(e => e.Entitlements).HasColumnName("entitlements");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasIndex(e => e.Sku).IsUnique();
            });

            // Configure ProductOffering entity
            modelBuilder.Entity<ProductOffering>(entity =>
            {
                entity.ToTable("product_offerings");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ProductId).HasColumnName("product_id");
                entity.Property(e => e.Brand).HasColumnName("brand");
                entity.Property(e => e.Price).HasColumnName("price");
                entity.Property(e => e.Currency).HasColumnName("currency");
                entity.Property(e => e.DeliveryMethods).HasColumnName("delivery_methods");
                entity.Property(e => e.Jurisdictions).HasColumnName("jurisdictions");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(po => po.Product)
                      .WithMany(p => p.ProductOfferings)
                      .HasForeignKey(po => po.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Category entity
            modelBuilder.Entity<Category>(entity =>
            {
                entity.ToTable("categories");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name");
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.Color).HasColumnName("color");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            });
        }
    }
}