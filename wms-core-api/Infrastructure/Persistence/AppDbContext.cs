using Microsoft.EntityFrameworkCore;
using WmsCoreApi.Domain.Entities;

namespace WmsCoreApi.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Customer> Customers => Set<Customer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<Category>().HasIndex(c => c.Name).IsUnique();
        modelBuilder.Entity<Customer>().HasIndex(c => c.Email).IsUnique();
        modelBuilder.Entity<Product>().Property(p => p.Price).HasPrecision(18, 2);
    }
}
