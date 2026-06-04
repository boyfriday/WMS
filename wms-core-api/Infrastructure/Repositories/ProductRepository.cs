using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WmsCoreApi.Domain.Entities;
using WmsCoreApi.Domain.Interfaces;
using WmsCoreApi.Infrastructure.Persistence;

namespace WmsCoreApi.Infrastructure.Repositories;

public class ProductRepository : Repository<Product>, IProductRepository
{
    public ProductRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Product>> GetAllWithCategoryAsync()
    {
        return await Context.Products
            .Include(p => p.Category)
            .ToListAsync();
    }

    public async Task<Product?> GetByIdWithCategoryAsync(Guid id)
    {
        return await Context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);
    }
}
