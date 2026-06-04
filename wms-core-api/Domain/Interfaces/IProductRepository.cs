using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WmsCoreApi.Domain.Entities;

namespace WmsCoreApi.Domain.Interfaces;

public interface IProductRepository : IRepository<Product>
{
    Task<IEnumerable<Product>> GetAllWithCategoryAsync();
    Task<Product?> GetByIdWithCategoryAsync(Guid id);
}
