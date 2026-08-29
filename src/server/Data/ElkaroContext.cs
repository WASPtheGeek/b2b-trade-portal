using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using server.Data.Entities;

namespace server.Data;

public partial class ElkaroContext : DbContext
{
    public ElkaroContext()
    {
    }

    public ElkaroContext(DbContextOptions<ElkaroContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AttributeDefinition> AttributeDefinitions { get; set; }

    public virtual DbSet<Brand> Brands { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<CompanyContact> CompanyContacts { get; set; }

    public virtual DbSet<ImportBatch> ImportBatches { get; set; }

    public virtual DbSet<ImportLog> ImportLogs { get; set; }

    public virtual DbSet<NotificationLog> NotificationLogs { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderAddress> OrderAddresses { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    public virtual DbSet<OrderStatusHistory> OrderStatusHistories { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<ProductAttributeValue> ProductAttributeValues { get; set; }

    public virtual DbSet<ProductCategory> ProductCategories { get; set; }

    public virtual DbSet<ProductImage> ProductImages { get; set; }

    public virtual DbSet<Promotion> Promotions { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserAddress> UserAddresses { get; set; }

    public virtual DbSet<VatRate> VatRates { get; set; }

    public virtual DbSet<WishlistItem> WishlistItems { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=elkaro_db;Username=postgres;Password=secret");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresExtension("pg_trgm")
            .HasPostgresExtension("pgcrypto");

        modelBuilder.Entity<AttributeDefinition>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("attribute_definitions_pkey");

            entity.ToTable("attribute_definitions");

            entity.HasIndex(e => new { e.CategoryId, e.Name }, "attribute_definitions_category_id_name_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.DataType)
                .HasDefaultValue((short)1)
                .HasColumnName("data_type");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.SortOrder).HasColumnName("sort_order");
            entity.Property(e => e.Unit)
                .HasMaxLength(30)
                .HasColumnName("unit");

            entity.HasOne(d => d.Category).WithMany(p => p.AttributeDefinitions)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("attribute_definitions_category_id_fkey");
        });

        modelBuilder.Entity<Brand>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("brands_pkey");

            entity.ToTable("brands");

            entity.HasIndex(e => e.ExternalId, "brands_external_id_key").IsUnique();

            entity.HasIndex(e => e.Name, "brands_name_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.ExternalId)
                .HasMaxLength(100)
                .HasColumnName("external_id");
            entity.Property(e => e.LogoFilename)
                .HasMaxLength(255)
                .HasColumnName("logo_filename");
            entity.Property(e => e.Name)
                .HasMaxLength(150)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("categories_pkey");

            entity.ToTable("categories");

            entity.HasIndex(e => e.ExternalId, "categories_external_id_key").IsUnique();

            entity.HasIndex(e => e.ShowInMenu, "idx_categories_menu").HasFilter("(show_in_menu = true)");

            entity.HasIndex(e => e.ParentId, "idx_categories_parent");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ActiveFrom).HasColumnName("active_from");
            entity.Property(e => e.ActiveTo).HasColumnName("active_to");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.ExternalId)
                .HasMaxLength(100)
                .HasColumnName("external_id");
            entity.Property(e => e.IsCustom).HasColumnName("is_custom");
            entity.Property(e => e.Name)
                .HasMaxLength(150)
                .HasColumnName("name");
            entity.Property(e => e.ParentId).HasColumnName("parent_id");
            entity.Property(e => e.ShowInMenu)
                .HasDefaultValue(true)
                .HasColumnName("show_in_menu");
            entity.Property(e => e.Slug)
                .HasMaxLength(160)
                .HasColumnName("slug");
            entity.Property(e => e.SortOrder).HasColumnName("sort_order");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent)
                .HasForeignKey(d => d.ParentId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("categories_parent_id_fkey");
        });

        modelBuilder.Entity<CompanyContact>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("company_contacts_pkey");

            entity.ToTable("company_contacts");

            entity.HasIndex(e => new { e.ContactType, e.IsActive }, "idx_company_contacts_type");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.City)
                .HasMaxLength(120)
                .HasColumnName("city");
            entity.Property(e => e.ContactType).HasColumnName("contact_type");
            entity.Property(e => e.CountryCode)
                .HasMaxLength(2)
                .IsFixedLength()
                .HasColumnName("country_code");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.IsPrimary).HasColumnName("is_primary");
            entity.Property(e => e.Label)
                .HasMaxLength(100)
                .HasColumnName("label");
            entity.Property(e => e.Line1)
                .HasMaxLength(255)
                .HasColumnName("line1");
            entity.Property(e => e.Line2)
                .HasMaxLength(255)
                .HasColumnName("line2");
            entity.Property(e => e.PostalCode)
                .HasMaxLength(20)
                .HasColumnName("postal_code");
            entity.Property(e => e.Region)
                .HasMaxLength(120)
                .HasColumnName("region");
            entity.Property(e => e.SortOrder).HasColumnName("sort_order");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            entity.Property(e => e.ValueText)
                .HasMaxLength(255)
                .HasColumnName("value_text");
        });

        modelBuilder.Entity<ImportBatch>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("import_batches_pkey");

            entity.ToTable("import_batches");

            entity.HasIndex(e => new { e.Status, e.StartedAt }, "idx_import_batches_status").IsDescending(false, true);

            entity.HasIndex(e => e.BatchUuid, "import_batches_batch_uuid_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BatchUuid)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("batch_uuid");
            entity.Property(e => e.EntityType)
                .HasMaxLength(50)
                .HasColumnName("entity_type");
            entity.Property(e => e.FailureCount).HasColumnName("failure_count");
            entity.Property(e => e.FinishedAt).HasColumnName("finished_at");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.SourceSystem)
                .HasMaxLength(100)
                .HasColumnName("source_system");
            entity.Property(e => e.StartedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("started_at");
            entity.Property(e => e.Status)
                .HasDefaultValue((short)1)
                .HasColumnName("status");
            entity.Property(e => e.SuccessCount).HasColumnName("success_count");
            entity.Property(e => e.TotalRecords).HasColumnName("total_records");
            entity.Property(e => e.TriggeredBy).HasColumnName("triggered_by");

            entity.HasOne(d => d.TriggeredByNavigation).WithMany(p => p.ImportBatches)
                .HasForeignKey(d => d.TriggeredBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("import_batches_triggered_by_fkey");
        });

        modelBuilder.Entity<ImportLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("import_logs_pkey");

            entity.ToTable("import_logs");

            entity.HasIndex(e => new { e.BatchId, e.Status }, "idx_import_logs_batch");

            entity.HasIndex(e => e.ExternalId, "idx_import_logs_external_id");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BatchId).HasColumnName("batch_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.EntityType)
                .HasMaxLength(50)
                .HasColumnName("entity_type");
            entity.Property(e => e.ErrorMessage)
                .HasMaxLength(1000)
                .HasColumnName("error_message");
            entity.Property(e => e.ExternalId)
                .HasMaxLength(100)
                .HasColumnName("external_id");
            entity.Property(e => e.InternalRecordId).HasColumnName("internal_record_id");
            entity.Property(e => e.Payload)
                .HasColumnType("jsonb")
                .HasColumnName("payload");
            entity.Property(e => e.Status).HasColumnName("status");

            entity.HasOne(d => d.Batch).WithMany(p => p.ImportLogs)
                .HasForeignKey(d => d.BatchId)
                .HasConstraintName("import_logs_batch_id_fkey");
        });

        modelBuilder.Entity<NotificationLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("notification_log_pkey");

            entity.ToTable("notification_log");

            entity.HasIndex(e => e.Status, "idx_notification_log_status");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.ErrorMessage)
                .HasMaxLength(500)
                .HasColumnName("error_message");
            entity.Property(e => e.NotificationType)
                .HasMaxLength(80)
                .HasColumnName("notification_type");
            entity.Property(e => e.RecipientEmail)
                .HasMaxLength(255)
                .HasColumnName("recipient_email");
            entity.Property(e => e.RelatedOrderId).HasColumnName("related_order_id");
            entity.Property(e => e.RelatedUserId).HasColumnName("related_user_id");
            entity.Property(e => e.SentAt).HasColumnName("sent_at");
            entity.Property(e => e.Status)
                .HasDefaultValue((short)1)
                .HasColumnName("status");

            entity.HasOne(d => d.RelatedOrder).WithMany(p => p.NotificationLogs)
                .HasForeignKey(d => d.RelatedOrderId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_notification_log_order");

            entity.HasOne(d => d.RelatedUser).WithMany(p => p.NotificationLogs)
                .HasForeignKey(d => d.RelatedUserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("notification_log_related_user_id_fkey");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("orders_pkey");

            entity.ToTable("orders");

            entity.HasIndex(e => e.Status, "idx_orders_status");

            entity.HasIndex(e => new { e.UserId, e.PlacedAt }, "idx_orders_user").IsDescending(false, true);

            entity.HasIndex(e => e.OrderNumber, "orders_order_number_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Currency)
                .HasMaxLength(3)
                .HasDefaultValueSql("'EUR'::bpchar")
                .IsFixedLength()
                .HasColumnName("currency");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.OrderNumber)
                .HasMaxLength(40)
                .HasColumnName("order_number");
            entity.Property(e => e.PlacedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("placed_at");
            entity.Property(e => e.Status)
                .HasDefaultValue((short)1)
                .HasColumnName("status");
            entity.Property(e => e.SubtotalAmount)
                .HasPrecision(12, 2)
                .HasColumnName("subtotal_amount");
            entity.Property(e => e.TotalAmount)
                .HasPrecision(12, 2)
                .HasColumnName("total_amount");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.VatAmount)
                .HasPrecision(12, 2)
                .HasColumnName("vat_amount");

            entity.HasOne(d => d.User).WithMany(p => p.Orders)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("orders_user_id_fkey");
        });

        modelBuilder.Entity<OrderAddress>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("order_addresses_pkey");

            entity.ToTable("order_addresses");

            entity.HasIndex(e => new { e.OrderId, e.AddressType }, "order_addresses_order_id_address_type_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AddressType).HasColumnName("address_type");
            entity.Property(e => e.BusinessName)
                .HasMaxLength(255)
                .HasColumnName("business_name");
            entity.Property(e => e.City)
                .HasMaxLength(120)
                .HasColumnName("city");
            entity.Property(e => e.ContactName)
                .HasMaxLength(150)
                .HasColumnName("contact_name");
            entity.Property(e => e.CountryCode)
                .HasMaxLength(2)
                .IsFixedLength()
                .HasColumnName("country_code");
            entity.Property(e => e.Line1)
                .HasMaxLength(255)
                .HasColumnName("line1");
            entity.Property(e => e.Line2)
                .HasMaxLength(255)
                .HasColumnName("line2");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.Phone)
                .HasMaxLength(30)
                .HasColumnName("phone");
            entity.Property(e => e.PostalCode)
                .HasMaxLength(20)
                .HasColumnName("postal_code");
            entity.Property(e => e.Region)
                .HasMaxLength(120)
                .HasColumnName("region");
            entity.Property(e => e.RegistrationNumber)
                .HasMaxLength(50)
                .HasColumnName("registration_number");
            entity.Property(e => e.SourceAddressId).HasColumnName("source_address_id");
            entity.Property(e => e.VatNumber)
                .HasMaxLength(50)
                .HasColumnName("vat_number");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderAddresses)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("order_addresses_order_id_fkey");

            entity.HasOne(d => d.SourceAddress).WithMany(p => p.OrderAddresses)
                .HasForeignKey(d => d.SourceAddressId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("order_addresses_source_address_id_fkey");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("order_items_pkey");

            entity.ToTable("order_items");

            entity.HasIndex(e => e.OrderId, "idx_order_items_order");

            entity.HasIndex(e => e.ProductId, "idx_order_items_product");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BrandSnapshot)
                .HasMaxLength(150)
                .HasColumnName("brand_snapshot");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.LineSubtotal)
                .HasPrecision(12, 2)
                .HasColumnName("line_subtotal");
            entity.Property(e => e.LineTotal)
                .HasPrecision(12, 2)
                .HasColumnName("line_total");
            entity.Property(e => e.LineVatAmount)
                .HasPrecision(12, 2)
                .HasColumnName("line_vat_amount");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.PackagingUnitUsed).HasColumnName("packaging_unit_used");
            entity.Property(e => e.PiecesPerUnitSnapshot)
                .HasDefaultValue(1)
                .HasColumnName("pieces_per_unit_snapshot");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.ProductNameSnapshot)
                .HasMaxLength(255)
                .HasColumnName("product_name_snapshot");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.SkuSnapshot)
                .HasMaxLength(80)
                .HasColumnName("sku_snapshot");
            entity.Property(e => e.UnitPriceSnapshot)
                .HasPrecision(12, 4)
                .HasColumnName("unit_price_snapshot");
            entity.Property(e => e.VatRateSnapshot)
                .HasPrecision(5, 2)
                .HasColumnName("vat_rate_snapshot");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("order_items_order_id_fkey");

            entity.HasOne(d => d.Product).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("order_items_product_id_fkey");
        });

        modelBuilder.Entity<OrderStatusHistory>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("order_status_history_pkey");

            entity.ToTable("order_status_history");

            entity.HasIndex(e => new { e.OrderId, e.ChangedAt }, "idx_order_status_history_order");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ChangedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("changed_at");
            entity.Property(e => e.ChangedBy).HasColumnName("changed_by");
            entity.Property(e => e.Note)
                .HasMaxLength(500)
                .HasColumnName("note");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.Status).HasColumnName("status");

            entity.HasOne(d => d.ChangedByNavigation).WithMany(p => p.OrderStatusHistories)
                .HasForeignKey(d => d.ChangedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("order_status_history_changed_by_fkey");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderStatusHistories)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("order_status_history_order_id_fkey");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("products_pkey");

            entity.ToTable("products");

            entity.HasIndex(e => e.IsActive, "idx_products_active").HasFilter("(is_active = true)");

            entity.HasIndex(e => e.BrandId, "idx_products_brand");

            entity.HasIndex(e => e.Ean, "idx_products_ean");

            entity.HasIndex(e => e.Name, "idx_products_name_trgm")
                .HasMethod("gin")
                .HasOperators(new[] { "gin_trgm_ops" });

            entity.HasIndex(e => e.ExternalId, "products_external_id_key").IsUnique();

            entity.HasIndex(e => e.Sku, "products_sku_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BasePrice)
                .HasPrecision(12, 4)
                .HasColumnName("base_price");
            entity.Property(e => e.BrandId).HasColumnName("brand_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.DateAdded)
                .HasDefaultValueSql("CURRENT_DATE")
                .HasColumnName("date_added");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Ean)
                .HasMaxLength(20)
                .HasColumnName("ean");
            entity.Property(e => e.ExternalId)
                .HasMaxLength(100)
                .HasColumnName("external_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.PiecesPerBox).HasColumnName("pieces_per_box");
            entity.Property(e => e.PiecesPerPackage).HasColumnName("pieces_per_package");
            entity.Property(e => e.Sku)
                .HasMaxLength(80)
                .HasColumnName("sku");
            entity.Property(e => e.SoldByPiece)
                .HasDefaultValue(true)
                .HasColumnName("sold_by_piece");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            entity.Property(e => e.VatRateId).HasColumnName("vat_rate_id");

            entity.HasOne(d => d.Brand).WithMany(p => p.Products)
                .HasForeignKey(d => d.BrandId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("products_brand_id_fkey");

            entity.HasOne(d => d.VatRate).WithMany(p => p.Products)
                .HasForeignKey(d => d.VatRateId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("products_vat_rate_id_fkey");
        });

        modelBuilder.Entity<ProductAttributeValue>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("product_attribute_values_pkey");

            entity.ToTable("product_attribute_values");

            entity.HasIndex(e => e.AttributeDefinitionId, "idx_pav_attribute");

            entity.HasIndex(e => new { e.ProductId, e.AttributeDefinitionId }, "product_attribute_values_product_id_attribute_definition_id_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AttributeDefinitionId).HasColumnName("attribute_definition_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.ValueText)
                .HasMaxLength(500)
                .HasColumnName("value_text");

            entity.HasOne(d => d.AttributeDefinition).WithMany(p => p.ProductAttributeValues)
                .HasForeignKey(d => d.AttributeDefinitionId)
                .HasConstraintName("product_attribute_values_attribute_definition_id_fkey");

            entity.HasOne(d => d.Product).WithMany(p => p.ProductAttributeValues)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("product_attribute_values_product_id_fkey");
        });

        modelBuilder.Entity<ProductCategory>(entity =>
        {
            entity.HasKey(e => new { e.ProductId, e.CategoryId }).HasName("product_categories_pkey");

            entity.ToTable("product_categories");

            entity.HasIndex(e => new { e.CategoryId, e.SortOrder }, "idx_product_categories_category");

            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.IsPrimary).HasColumnName("is_primary");
            entity.Property(e => e.SortOrder).HasColumnName("sort_order");

            entity.HasOne(d => d.Category).WithMany(p => p.ProductCategories)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("product_categories_category_id_fkey");

            entity.HasOne(d => d.Product).WithMany(p => p.ProductCategories)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("product_categories_product_id_fkey");
        });

        modelBuilder.Entity<ProductImage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("product_images_pkey");

            entity.ToTable("product_images");

            entity.HasIndex(e => new { e.ProductId, e.SortOrder }, "idx_product_images_product");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AltText)
                .HasMaxLength(255)
                .HasColumnName("alt_text");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.Filename)
                .HasMaxLength(255)
                .HasColumnName("filename");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.SortOrder).HasColumnName("sort_order");

            entity.HasOne(d => d.Product).WithMany(p => p.ProductImages)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("product_images_product_id_fkey");
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("promotions_pkey");

            entity.ToTable("promotions");

            entity.HasIndex(e => new { e.IsActive, e.StartsAt, e.EndsAt }, "idx_promotions_active_window");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.DiscountType).HasColumnName("discount_type");
            entity.Property(e => e.DiscountValue)
                .HasPrecision(10, 2)
                .HasColumnName("discount_value");
            entity.Property(e => e.EndsAt).HasColumnName("ends_at");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name)
                .HasMaxLength(150)
                .HasColumnName("name");
            entity.Property(e => e.StartsAt).HasColumnName("starts_at");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Promotions)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("promotions_created_by_fkey");

            entity.HasMany(d => d.Brands).WithMany(p => p.Promotions)
                .UsingEntity<Dictionary<string, object>>(
                    "PromotionBrand",
                    r => r.HasOne<Brand>().WithMany()
                        .HasForeignKey("BrandId")
                        .HasConstraintName("promotion_brands_brand_id_fkey"),
                    l => l.HasOne<Promotion>().WithMany()
                        .HasForeignKey("PromotionId")
                        .HasConstraintName("promotion_brands_promotion_id_fkey"),
                    j =>
                    {
                        j.HasKey("PromotionId", "BrandId").HasName("promotion_brands_pkey");
                        j.ToTable("promotion_brands");
                        j.IndexerProperty<long>("PromotionId").HasColumnName("promotion_id");
                        j.IndexerProperty<long>("BrandId").HasColumnName("brand_id");
                    });

            entity.HasMany(d => d.Categories).WithMany(p => p.Promotions)
                .UsingEntity<Dictionary<string, object>>(
                    "PromotionCategory",
                    r => r.HasOne<Category>().WithMany()
                        .HasForeignKey("CategoryId")
                        .HasConstraintName("promotion_categories_category_id_fkey"),
                    l => l.HasOne<Promotion>().WithMany()
                        .HasForeignKey("PromotionId")
                        .HasConstraintName("promotion_categories_promotion_id_fkey"),
                    j =>
                    {
                        j.HasKey("PromotionId", "CategoryId").HasName("promotion_categories_pkey");
                        j.ToTable("promotion_categories");
                        j.IndexerProperty<long>("PromotionId").HasColumnName("promotion_id");
                        j.IndexerProperty<long>("CategoryId").HasColumnName("category_id");
                    });

            entity.HasMany(d => d.Users).WithMany(p => p.PromotionsNavigation)
                .UsingEntity<Dictionary<string, object>>(
                    "PromotionClient",
                    r => r.HasOne<User>().WithMany()
                        .HasForeignKey("UserId")
                        .HasConstraintName("promotion_clients_user_id_fkey"),
                    l => l.HasOne<Promotion>().WithMany()
                        .HasForeignKey("PromotionId")
                        .HasConstraintName("promotion_clients_promotion_id_fkey"),
                    j =>
                    {
                        j.HasKey("PromotionId", "UserId").HasName("promotion_clients_pkey");
                        j.ToTable("promotion_clients");
                        j.HasIndex(new[] { "UserId" }, "idx_promotion_clients_user");
                        j.IndexerProperty<long>("PromotionId").HasColumnName("promotion_id");
                        j.IndexerProperty<long>("UserId").HasColumnName("user_id");
                    });
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("roles_pkey");

            entity.ToTable("roles");

            entity.HasIndex(e => e.Name, "roles_name_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(30)
                .HasColumnName("name");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "idx_users_email");

            entity.HasIndex(e => new { e.RoleId, e.Status }, "idx_users_role_status");

            entity.HasIndex(e => e.Email, "users_email_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ApprovedAt).HasColumnName("approved_at");
            entity.Property(e => e.ApprovedBy).HasColumnName("approved_by");
            entity.Property(e => e.BusinessName)
                .HasMaxLength(255)
                .HasColumnName("business_name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.FirstName)
                .HasMaxLength(100)
                .HasColumnName("first_name");
            entity.Property(e => e.IsVatExempt).HasColumnName("is_vat_exempt");
            entity.Property(e => e.LastName)
                .HasMaxLength(100)
                .HasColumnName("last_name");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .HasColumnName("password_hash");
            entity.Property(e => e.Phone)
                .HasMaxLength(30)
                .HasColumnName("phone");
            entity.Property(e => e.RegistrationNumber)
                .HasMaxLength(50)
                .HasColumnName("registration_number");
            entity.Property(e => e.RejectionReason)
                .HasMaxLength(500)
                .HasColumnName("rejection_reason");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.Status)
                .HasDefaultValue((short)1)
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            entity.Property(e => e.VatNumber)
                .HasMaxLength(50)
                .HasColumnName("vat_number");

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.InverseApprovedByNavigation)
                .HasForeignKey(d => d.ApprovedBy)
                .HasConstraintName("users_approved_by_fkey");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("users_role_id_fkey");
        });

        modelBuilder.Entity<UserAddress>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("user_addresses_pkey");

            entity.ToTable("user_addresses");

            entity.HasIndex(e => new { e.UserId, e.AddressType }, "idx_user_addresses_user");

            entity.HasIndex(e => new { e.UserId, e.AddressType }, "uq_user_default_address")
                .IsUnique()
                .HasFilter("(is_default = true)");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AddressType).HasColumnName("address_type");
            entity.Property(e => e.City)
                .HasMaxLength(120)
                .HasColumnName("city");
            entity.Property(e => e.ContactName)
                .HasMaxLength(150)
                .HasColumnName("contact_name");
            entity.Property(e => e.CountryCode)
                .HasMaxLength(2)
                .IsFixedLength()
                .HasColumnName("country_code");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.IsDefault).HasColumnName("is_default");
            entity.Property(e => e.Label)
                .HasMaxLength(100)
                .HasColumnName("label");
            entity.Property(e => e.Line1)
                .HasMaxLength(255)
                .HasColumnName("line1");
            entity.Property(e => e.Line2)
                .HasMaxLength(255)
                .HasColumnName("line2");
            entity.Property(e => e.Phone)
                .HasMaxLength(30)
                .HasColumnName("phone");
            entity.Property(e => e.PostalCode)
                .HasMaxLength(20)
                .HasColumnName("postal_code");
            entity.Property(e => e.Region)
                .HasMaxLength(120)
                .HasColumnName("region");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.UserAddresses)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("user_addresses_user_id_fkey");
        });

        modelBuilder.Entity<VatRate>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("vat_rates_pkey");

            entity.ToTable("vat_rates");

            entity.HasIndex(e => e.IsDefault, "uq_vat_rate_default")
                .IsUnique()
                .HasFilter("(is_default = true)");

            entity.HasIndex(e => e.Label, "vat_rates_label_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.IsDefault).HasColumnName("is_default");
            entity.Property(e => e.Label)
                .HasMaxLength(50)
                .HasColumnName("label");
            entity.Property(e => e.Rate)
                .HasPrecision(5, 2)
                .HasColumnName("rate");
            entity.Property(e => e.ValidFrom)
                .HasDefaultValueSql("CURRENT_DATE")
                .HasColumnName("valid_from");
            entity.Property(e => e.ValidTo).HasColumnName("valid_to");
        });

        modelBuilder.Entity<WishlistItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("wishlist_items_pkey");

            entity.ToTable("wishlist_items");

            entity.HasIndex(e => e.UserId, "idx_wishlist_user");

            entity.HasIndex(e => new { e.UserId, e.ProductId }, "wishlist_items_user_id_product_id_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AddedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("added_at");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Product).WithMany(p => p.WishlistItems)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("wishlist_items_product_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.WishlistItems)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("wishlist_items_user_id_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
