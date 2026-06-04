using System.Security.Claims;
using WmsCoreApi.Domain.Entities;

namespace WmsCoreApi.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
