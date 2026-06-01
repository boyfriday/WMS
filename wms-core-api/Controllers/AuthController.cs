using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WmsCoreApi.Data;
using WmsCoreApi.DTOs;
using WmsCoreApi.Models;
using WmsCoreApi.Services;

namespace WmsCoreApi.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController(AppDbContext db, JwtService jwtService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register(RegisterRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email))
            return BadRequest(ApiResponse<AuthResponse>.Fail("Email already registered"));

        var user = new User
        {
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            FullName = req.FullName,
            Role = "User"
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var token = jwtService.GenerateToken(user);
        var response = new AuthResponse(token, new UserDto(user.Id, user.Email, user.FullName, user.Role));
        return Ok(ApiResponse<AuthResponse>.Ok(response));
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login(LoginRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(ApiResponse<AuthResponse>.Fail("Invalid email or password"));

        var token = jwtService.GenerateToken(user);
        var response = new AuthResponse(token, new UserDto(user.Id, user.Email, user.FullName, user.Role));
        return Ok(ApiResponse<AuthResponse>.Ok(response));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserDto>>> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized(ApiResponse<UserDto>.Fail("Not authenticated"));

        var user = await db.Users.FindAsync(Guid.Parse(userId));
        if (user == null) return NotFound(ApiResponse<UserDto>.Fail("User not found"));

        return Ok(ApiResponse<UserDto>.Ok(new UserDto(user.Id, user.Email, user.FullName, user.Role)));
    }
}
