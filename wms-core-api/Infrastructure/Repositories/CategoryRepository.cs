using WmsCoreApi.Domain.Entities;
using WmsCoreApi.Domain.Interfaces;
using WmsCoreApi.Infrastructure.Persistence;

namespace WmsCoreApi.Infrastructure.Repositories;

public class CategoryRepository : Repository<Category>, ICategoryRepository
{
    public CategoryRepository(AppDbContext context) : base(context)
    {
    }
}
