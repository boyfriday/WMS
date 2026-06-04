using System;
using System.Threading.Tasks;
using WmsCoreApi.Application.DTOs;

namespace WmsCoreApi.Application.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request);
    Task<ApiResponse<UserDto>> GetMeAsync(Guid userId);
}
