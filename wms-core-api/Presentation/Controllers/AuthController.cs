using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WmsCoreApi.Application.DTOs;
using WmsCoreApi.Application.Interfaces;

namespace WmsCoreApi.Presentation.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register(RegisterRequest req)
    {
        var res = await authService.RegisterAsync(req);
        if (!res.Success) return BadRequest(res);
        return Ok(res);
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login(LoginRequest req)
    {
        var res = await authService.LoginAsync(req);
        if (!res.Success) return Unauthorized(res);
        return Ok(res);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<UserDto>>> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized(ApiResponse<UserDto>.Fail("Not authenticated"));

        var res = await authService.GetMeAsync(Guid.Parse(userId));
        if (!res.Success) return NotFound(res);
        return Ok(res);
    }
}
