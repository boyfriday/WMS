using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Moq;
using WmsCoreApi.Application.DTOs;
using WmsCoreApi.Application.Interfaces;
using WmsCoreApi.Application.Services;
using WmsCoreApi.Domain.Entities;
using WmsCoreApi.Domain.Interfaces;
using Xunit;

namespace WmsCoreApi.Tests;

public class AuthServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly Mock<IUserRepository> _mockUserRepo;
    private readonly Mock<ICustomerRepository> _mockCustomerRepo;
    private readonly Mock<IJwtService> _mockJwtService;
    private readonly AuthService _service;

    public AuthServiceTests()
    {
        _mockUow = new Mock<IUnitOfWork>();
        _mockUserRepo = new Mock<IUserRepository>();
        _mockCustomerRepo = new Mock<ICustomerRepository>();
        _mockJwtService = new Mock<IJwtService>();
        _mockUow.Setup(u => u.Users).Returns(_mockUserRepo.Object);
        _mockUow.Setup(u => u.Customers).Returns(_mockCustomerRepo.Object);
        _service = new AuthService(_mockUow.Object, _mockJwtService.Object);
    }

    [Fact]
    public async Task RegisterAsync_WhenUserAlreadyExists_ReturnsFail()
    {
        // Arrange
        var request = new RegisterRequest("test@test.com", "password", "Test User");
        _mockUserRepo.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync(new User());

        // Act
        var result = await _service.RegisterAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Email already registered", result.Message);
    }

    [Fact]
    public async Task RegisterAsync_WhenUserNew_CreatesAndReturnsTokens()
    {
        // Arrange
        var request = new RegisterRequest("test@test.com", "password", "Test User");
        _mockUserRepo.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync((User?)null);
        _mockJwtService.Setup(j => j.GenerateRefreshToken()).Returns("refresh-token-123");
        _mockJwtService.Setup(j => j.GenerateToken(It.IsAny<User>())).Returns("jwt-token-123");
        _mockUserRepo.Setup(r => r.AddAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
        _mockUow.Setup(u => u.CompleteAsync()).ReturnsAsync(1);

        // Act
        var result = await _service.RegisterAsync(request);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("jwt-token-123", result.Data.Token);
        Assert.Equal("refresh-token-123", result.Data.RefreshToken);
        Assert.Equal("test@test.com", result.Data.User.Email);
        _mockUserRepo.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
        _mockUow.Verify(u => u.CompleteAsync(), Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_WhenCustomerRoleRequested_LinksCustomer()
    {
        // Arrange
        var customerId = Guid.NewGuid();
        var customer = new Customer { Id = customerId, Name = "Acme Corp" };
        var request = new RegisterRequest("cust@test.com", "password", "Cust User", customerId);
        _mockUserRepo.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync((User?)null);
        _mockCustomerRepo.Setup(r => r.GetByIdAsync(customerId)).ReturnsAsync(customer);
        _mockJwtService.Setup(j => j.GenerateRefreshToken()).Returns("refresh-token-123");
        _mockJwtService.Setup(j => j.GenerateToken(It.IsAny<User>())).Returns("jwt-token-123");
        _mockUserRepo.Setup(r => r.AddAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
        _mockUow.Setup(u => u.CompleteAsync()).ReturnsAsync(1);

        // Act
        var result = await _service.RegisterAsync(request);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Customer", result.Data.User.Role);
        Assert.Equal(customerId, result.Data.User.CustomerId);
        Assert.Equal("Acme Corp", result.Data.User.CustomerName);
        _mockUserRepo.Verify(r => r.AddAsync(It.Is<User>(u => u.Role == "Customer" && u.CustomerId == customerId)), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_WhenInvalidCredentials_ReturnsFail()
    {
        // Arrange
        var request = new LoginRequest("test@test.com", "wrongpassword");
        _mockUserRepo.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync((User?)null);

        // Act
        var result = await _service.LoginAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Invalid email or password", result.Message);
    }

    [Fact]
    public async Task LoginAsync_WhenValidCredentials_ReturnsTokens()
    {
        // Arrange
        var request = new LoginRequest("test@test.com", "correctpassword");
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = "Test User",
            Role = "Admin"
        };
        _mockUserRepo.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync(user);
        _mockJwtService.Setup(j => j.GenerateToken(user)).Returns("jwt-token-abc");
        _mockJwtService.Setup(j => j.GenerateRefreshToken()).Returns("refresh-token-abc");
        _mockUow.Setup(u => u.CompleteAsync()).ReturnsAsync(1);

        // Act
        var result = await _service.LoginAsync(request);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("jwt-token-abc", result.Data.Token);
        Assert.Equal("refresh-token-abc", result.Data.RefreshToken);
        Assert.Equal("Admin", result.Data.User.Role);
        _mockUserRepo.Verify(r => r.Update(user), Times.Once);
        _mockUow.Verify(u => u.CompleteAsync(), Times.Once);
    }

    [Fact]
    public async Task RefreshTokenAsync_WhenInvalidTokenClaims_ReturnsFail()
    {
        // Arrange
        var request = new RefreshTokenRequest("expired-jwt", "refresh-123");
        _mockJwtService.Setup(j => j.GetPrincipalFromExpiredToken(request.Token)).Returns((ClaimsPrincipal?)null);

        // Act
        var result = await _service.RefreshTokenAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Invalid access token or refresh token", result.Message);
    }

    [Fact]
    public async Task RefreshTokenAsync_WhenValidRequest_RotatesTokens()
    {
        // Arrange
        var request = new RefreshTokenRequest("expired-jwt", "refresh-old");
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "test@test.com",
            Role = "Operator",
            RefreshToken = "refresh-old",
            RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(1)
        };

        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) };
        var identity = new ClaimsIdentity(claims);
        var principal = new ClaimsPrincipal(identity);

        _mockJwtService.Setup(j => j.GetPrincipalFromExpiredToken(request.Token)).Returns(principal);
        _mockUserRepo.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(user);
        _mockJwtService.Setup(j => j.GenerateToken(user)).Returns("jwt-new");
        _mockJwtService.Setup(j => j.GenerateRefreshToken()).Returns("refresh-new");
        _mockUow.Setup(u => u.CompleteAsync()).ReturnsAsync(1);

        // Act
        var result = await _service.RefreshTokenAsync(request);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("jwt-new", result.Data.Token);
        Assert.Equal("refresh-new", result.Data.RefreshToken);
        _mockUserRepo.Verify(r => r.Update(user), Times.Once);
        _mockUow.Verify(u => u.CompleteAsync(), Times.Once);
    }
}
