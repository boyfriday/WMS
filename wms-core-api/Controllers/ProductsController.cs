using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WmsCoreApi.Data;
using WmsCoreApi.DTOs;
using WmsCoreApi.Models;

namespace WmsCoreApi.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class ProductsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ProductDto>>>> GetAll()
    {
        var products = await db.Products
            .Include(p => p.Category)
            .Select(p => new ProductDto(
                p.Id, p.Name, p.Description, p.Price, p.Stock, p.CategoryId,
                p.Category == null ? null : new CategoryDto(p.Category.Id, p.Category.Name, p.Category.Description)))
            .ToListAsync();
        return Ok(ApiResponse<List<ProductDto>>.Ok(products));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetById(Guid id)
    {
        var product = await db.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (product == null) return NotFound(ApiResponse<ProductDto>.Fail("Product not found"));

        var dto = new ProductDto(
            product.Id, product.Name, product.Description, product.Price, product.Stock, product.CategoryId,
            product.Category == null ? null : new CategoryDto(product.Category.Id, product.Category.Name, product.Category.Description));
        return Ok(ApiResponse<ProductDto>.Ok(dto));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> Create(CreateProductRequest req)
    {
        var product = new Product
        {
            Name = req.Name,
            Description = req.Description,
            Price = req.Price,
            Stock = req.Stock,
            CategoryId = req.CategoryId
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();

        product = await db.Products.Include(p => p.Category).FirstAsync(p => p.Id == product.Id);
        var dto = new ProductDto(
            product.Id, product.Name, product.Description, product.Price, product.Stock, product.CategoryId,
            product.Category == null ? null : new CategoryDto(product.Category.Id, product.Category.Name, product.Category.Description));
        return Ok(ApiResponse<ProductDto>.Ok(dto));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> Update(Guid id, UpdateProductRequest req)
    {
        var product = await db.Products.FindAsync(id);
        if (product == null) return NotFound(ApiResponse<ProductDto>.Fail("Product not found"));

        product.Name = req.Name;
        product.Description = req.Description;
        product.Price = req.Price;
        product.Stock = req.Stock;
        product.CategoryId = req.CategoryId;
        await db.SaveChangesAsync();

        product = await db.Products.Include(p => p.Category).FirstAsync(p => p.Id == product.Id);
        var dto = new ProductDto(
            product.Id, product.Name, product.Description, product.Price, product.Stock, product.CategoryId,
            product.Category == null ? null : new CategoryDto(product.Category.Id, product.Category.Name, product.Category.Description));
        return Ok(ApiResponse<ProductDto>.Ok(dto));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var product = await db.Products.FindAsync(id);
        if (product == null) return NotFound(ApiResponse<object>.Fail("Product not found"));

        db.Products.Remove(product);
        await db.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { }));
    }
}
