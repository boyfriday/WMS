using System;
using System.Threading.Tasks;
using WmsCoreApi.Domain.Interfaces;
using WmsCoreApi.Infrastructure.Persistence;

namespace WmsCoreApi.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        Users = new UserRepository(_context);
        Products = new ProductRepository(_context);
        Categories = new CategoryRepository(_context);
        Customers = new CustomerRepository(_context);
    }

    public IUserRepository Users { get; }
    public IProductRepository Products { get; }
    public ICategoryRepository Categories { get; }
    public ICustomerRepository Customers { get; }

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}
