using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using WmsCoreApi.Application.DTOs;
using WmsCoreApi.Application.Services;
using WmsCoreApi.Domain.Entities;
using WmsCoreApi.Domain.Interfaces;
using Xunit;

namespace WmsCoreApi.Tests;

public class ProductServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUow;
    private readonly Mock<IProductRepository> _mockProductRepo;
    private readonly ProductService _service;

    public ProductServiceTests()
    {
        _mockUow = new Mock<IUnitOfWork>();
        _mockProductRepo = new Mock<IProductRepository>();
        _mockUow.Setup(u => u.Products).Returns(_mockProductRepo.Object);
        _service = new ProductService(_mockUow.Object);
    }

    [Fact]
    public async Task GetAllProductsAsync_ReturnsAllProducts()
    {
        // Arrange
        var products = new List<Product>
        {
            new() { Id = Guid.NewGuid(), Name = "Product 1", Price = 10.0m, Stock = 50 },
            new() { Id = Guid.NewGuid(), Name = "Product 2", Price = 20.0m, Stock = 100 }
        };
        _mockProductRepo.Setup(r => r.GetAllWithCategoryAsync()).ReturnsAsync(products);

        // Act
        var result = await _service.GetAllProductsAsync();

        // Assert
        Assert.True(result.Success);
        Assert.Equal(2, result.Data.Count);
        Assert.Equal("Product 1", result.Data[0].Name);
    }

    [Fact]
    public async Task GetProductByIdAsync_WhenExists_ReturnsProduct()
    {
        // Arrange
        var id = Guid.NewGuid();
        var product = new Product { Id = id, Name = "Product 1", Price = 10.0m, Stock = 50 };
        _mockProductRepo.Setup(r => r.GetByIdWithCategoryAsync(id)).ReturnsAsync(product);

        // Act
        var result = await _service.GetProductByIdAsync(id);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("Product 1", result.Data.Name);
    }

    [Fact]
    public async Task GetProductByIdAsync_WhenNotExists_ReturnsFail()
    {
        // Arrange
        var id = Guid.NewGuid();
        _mockProductRepo.Setup(r => r.GetByIdWithCategoryAsync(id)).ReturnsAsync((Product?)null);

        // Act
        var result = await _service.GetProductByIdAsync(id);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Product not found", result.Message);
    }

    [Fact]
    public async Task CreateProductAsync_CreatesAndReturnsProduct()
    {
        // Arrange
        var request = new CreateProductRequest("New Product", "Desc", 15.0m, 10, Guid.NewGuid());
        var createdProduct = new Product
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Stock = request.Stock,
            CategoryId = request.CategoryId
        };

        _mockProductRepo.Setup(r => r.AddAsync(It.IsAny<Product>())).Returns(Task.CompletedTask);
        _mockProductRepo.Setup(r => r.GetByIdWithCategoryAsync(It.IsAny<Guid>())).ReturnsAsync(createdProduct);
        _mockUow.Setup(u => u.CompleteAsync()).ReturnsAsync(1);

        // Act
        var result = await _service.CreateProductAsync(request);

        // Assert
        Assert.True(result.Success);
        Assert.Equal("New Product", result.Data.Name);
        _mockProductRepo.Verify(r => r.AddAsync(It.IsAny<Product>()), Times.Once);
        _mockUow.Verify(u => u.CompleteAsync(), Times.Once);
    }

    [Fact]
    public async Task DeductStockAsync_DeductsCorrectly()
    {
        // Arrange
        var id = Guid.NewGuid();
        var product = new Product { Id = id, Name = "Product", Stock = 50 };
        _mockProductRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(product);
        _mockUow.Setup(u => u.CompleteAsync()).ReturnsAsync(1);

        // Act
        await _service.DeductStockAsync(id, 10);

        // Assert
        Assert.Equal(40, product.Stock);
        _mockProductRepo.Verify(r => r.Update(product), Times.Once);
        _mockUow.Verify(u => u.CompleteAsync(), Times.Once);
    }

    [Fact]
    public async Task AddStockAsync_AddsCorrectly()
    {
        // Arrange
        var id = Guid.NewGuid();
        var product = new Product { Id = id, Name = "Product", Stock = 50 };
        _mockProductRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(product);
        _mockUow.Setup(u => u.CompleteAsync()).ReturnsAsync(1);

        // Act
        await _service.AddStockAsync(id, 20);

        // Assert
        Assert.Equal(70, product.Stock);
        _mockProductRepo.Verify(r => r.Update(product), Times.Once);
        _mockUow.Verify(u => u.CompleteAsync(), Times.Once);
    }
}
