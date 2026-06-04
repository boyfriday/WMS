using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WmsCoreApi.Domain.Entities;
using WmsCoreApi.Domain.Interfaces;
using WmsCoreApi.Infrastructure.Persistence;

namespace WmsCoreApi.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await Context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }
}
