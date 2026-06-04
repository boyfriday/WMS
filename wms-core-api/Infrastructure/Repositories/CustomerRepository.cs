using WmsCoreApi.Domain.Entities;
using WmsCoreApi.Domain.Interfaces;
using WmsCoreApi.Infrastructure.Persistence;

namespace WmsCoreApi.Infrastructure.Repositories;

public class CustomerRepository : Repository<Customer>, ICustomerRepository
{
    public CustomerRepository(AppDbContext context) : base(context)
    {
    }
}
