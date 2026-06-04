using System.Threading.Tasks;
using WmsCoreApi.Domain.Entities;

namespace WmsCoreApi.Domain.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
}
