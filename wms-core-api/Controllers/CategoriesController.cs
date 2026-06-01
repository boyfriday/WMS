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
public class CategoriesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetAll()
    {
        var categories = await db.Categories
            .Select(c => new CategoryDto(c.Id, c.Name, c.Description))
            .ToListAsync();
        return Ok(ApiResponse<List<CategoryDto>>.Ok(categories));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetById(Guid id)
    {
        var category = await db.Categories.FindAsync(id);
        if (category == null) return NotFound(ApiResponse<CategoryDto>.Fail("Category not found"));
        return Ok(ApiResponse<CategoryDto>.Ok(new CategoryDto(category.Id, category.Name, category.Description)));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Create(CreateCategoryRequest req)
    {
        var category = new Category { Name = req.Name, Description = req.Description };
        db.Categories.Add(category);
        await db.SaveChangesAsync();
        return Ok(ApiResponse<CategoryDto>.Ok(new CategoryDto(category.Id, category.Name, category.Description)));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Update(Guid id, UpdateCategoryRequest req)
    {
        var category = await db.Categories.FindAsync(id);
        if (category == null) return NotFound(ApiResponse<CategoryDto>.Fail("Category not found"));

        category.Name = req.Name;
        category.Description = req.Description;
        await db.SaveChangesAsync();
        return Ok(ApiResponse<CategoryDto>.Ok(new CategoryDto(category.Id, category.Name, category.Description)));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var category = await db.Categories.FindAsync(id);
        if (category == null) return NotFound(ApiResponse<object>.Fail("Category not found"));

        db.Categories.Remove(category);
        await db.SaveChangesAsync();
        return Ok(ApiResponse<object>.Ok(new { }));
    }
}
