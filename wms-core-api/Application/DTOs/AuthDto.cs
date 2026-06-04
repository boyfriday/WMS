using System;

namespace WmsCoreApi.Application.DTOs;

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Email, string Password, string FullName);
public record AuthResponse(string Token, string RefreshToken, UserDto User);
public record RefreshTokenRequest(string Token, string RefreshToken);
public record UserDto(Guid Id, string Email, string FullName, string Role);
