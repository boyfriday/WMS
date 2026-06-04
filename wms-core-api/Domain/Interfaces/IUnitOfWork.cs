using System;
using System.Threading.Tasks;

namespace WmsCoreApi.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IProductRepository Products { get; }
    ICategoryRepository Categories { get; }
    Task<int> CompleteAsync();
}
