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

        var refreshToken = jwtService.GenerateRefreshToken();
        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            Role = "User",
            RefreshToken = refreshToken,
            RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7)
        };

        await unitOfWork.Users.AddAsync(user);
        await unitOfWork.CompleteAsync();

        var token = jwtService.GenerateToken(user);
        var response = new AuthResponse(token, refreshToken, new UserDto(user.Id, user.Email, user.FullName, user.Role));
        return ApiResponse<AuthResponse>.Ok(response);
    }

    public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var user = await unitOfWork.Users.GetByEmailAsync(request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return ApiResponse<AuthResponse>.Fail("Invalid email or password");

        var token = jwtService.GenerateToken(user);
        var refreshToken = jwtService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        unitOfWork.Users.Update(user);
        await unitOfWork.CompleteAsync();

        var response = new AuthResponse(token, refreshToken, new UserDto(user.Id, user.Email, user.FullName, user.Role));
        return ApiResponse<AuthResponse>.Ok(response);
    }

    public async Task<ApiResponse<AuthResponse>> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var principal = jwtService.GetPrincipalFromExpiredToken(request.Token);
        if (principal == null)
            return ApiResponse<AuthResponse>.Fail("Invalid access token or refresh token");

        var userIdClaim = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid userId))
            return ApiResponse<AuthResponse>.Fail("Invalid access token claims");

        var user = await unitOfWork.Users.GetByIdAsync(userId);
        if (user == null || user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            return ApiResponse<AuthResponse>.Fail("Invalid or expired refresh token");

        var newAccessToken = jwtService.GenerateToken(user);
        var newRefreshToken = jwtService.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        unitOfWork.Users.Update(user);
        await unitOfWork.CompleteAsync();

        var response = new AuthResponse(newAccessToken, newRefreshToken, new UserDto(user.Id, user.Email, user.FullName, user.Role));
        return ApiResponse<AuthResponse>.Ok(response);
    }

    public async Task<ApiResponse<UserDto>> GetMeAsync(Guid userId)
    {
        var user = await unitOfWork.Users.GetByIdAsync(userId);
        if (user == null) return ApiResponse<UserDto>.Fail("User not found");

        return ApiResponse<UserDto>.Ok(new UserDto(user.Id, user.Email, user.FullName, user.Role));
    }
}
