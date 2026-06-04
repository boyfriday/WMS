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

    public override async Task<User?> GetByIdAsync(Guid id)
    {
        return await Context.Users.Include(u => u.Customer).FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await Context.Users.Include(u => u.Customer).FirstOrDefaultAsync(u => u.Email == email);
    }
}
