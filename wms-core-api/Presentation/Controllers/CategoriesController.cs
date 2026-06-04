using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WmsCoreApi.Application.DTOs;
using WmsCoreApi.Application.Interfaces;

namespace WmsCoreApi.Presentation.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class CategoriesController(ICategoryService categoryService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetAll()
    {
        var res = await categoryService.GetAllCategoriesAsync();
        return Ok(res);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetById(Guid id)
    {
        var res = await categoryService.GetCategoryByIdAsync(id);
        if (!res.Success) return NotFound(res);
        return Ok(res);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Operator,Warehouse")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Create(CreateCategoryRequest req)
    {
        var res = await categoryService.CreateCategoryAsync(req);
        return Ok(res);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Operator,Warehouse")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Update(Guid id, UpdateCategoryRequest req)
    {
        var res = await categoryService.UpdateCategoryAsync(id, req);
        if (!res.Success) return NotFound(res);
        return Ok(res);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Operator,Warehouse")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var res = await categoryService.DeleteCategoryAsync(id);
        if (!res.Success) return NotFound(res);
        return Ok(res);
    }
}
