using System;
using System.Threading.Tasks;
using BCrypt.Net;
using WmsCoreApi.Application.DTOs;
using WmsCoreApi.Application.Interfaces;
using WmsCoreApi.Domain.Entities;
using WmsCoreApi.Domain.Interfaces;

namespace WmsCoreApi.Application.Services;

public class AuthService(IUnitOfWork unitOfWork, IJwtService jwtService) : IAuthService
{
    public async Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await unitOfWork.Users.GetByEmailAsync(request.Email);
        if (existingUser != null)
            return ApiResponse<AuthResponse>.Fail("Email already registered");

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            Role = "User"
        };

        await unitOfWork.Users.AddAsync(user);
        await unitOfWork.CompleteAsync();

        var token = jwtService.GenerateToken(user);
        var response = new AuthResponse(token, new UserDto(user.Id, user.Email, user.FullName, user.Role));
        return ApiResponse<AuthResponse>.Ok(response);
    }

    public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var user = await unitOfWork.Users.GetByEmailAsync(request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return ApiResponse<AuthResponse>.Fail("Invalid email or password");

        var token = jwtService.GenerateToken(user);
        var response = new AuthResponse(token, new UserDto(user.Id, user.Email, user.FullName, user.Role));
        return ApiResponse<AuthResponse>.Ok(response);
    }

    public async Task<ApiResponse<UserDto>> GetMeAsync(Guid userId)
    {
        var user = await unitOfWork.Users.GetByIdAsync(userId);
        if (user == null) return ApiResponse<UserDto>.Fail("User not found");

        return ApiResponse<UserDto>.Ok(new UserDto(user.Id, user.Email, user.FullName, user.Role));
    }
}
