using WmsCoreApi.Domain.Entities;

namespace WmsCoreApi.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}
