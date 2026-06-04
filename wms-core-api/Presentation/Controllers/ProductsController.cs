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
public class ProductsController(IProductService productService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ProductDto>>>> GetAll()
    {
        var res = await productService.GetAllProductsAsync();
        return Ok(res);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetById(Guid id)
    {
        var res = await productService.GetProductByIdAsync(id);
        if (!res.Success) return NotFound(res);
        return Ok(res);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Operator,Warehouse")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> Create(CreateProductRequest req)
    {
        var res = await productService.CreateProductAsync(req);
        return Ok(res);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Operator,Warehouse")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> Update(Guid id, UpdateProductRequest req)
    {
        var res = await productService.UpdateProductAsync(id, req);
        if (!res.Success) return NotFound(res);
        return Ok(res);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Operator,Warehouse")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var res = await productService.DeleteProductAsync(id);
        if (!res.Success) return NotFound(res);
        return Ok(res);
    }

    [HttpPost("{id:guid}/receive-stock")]
    [Authorize(Roles = "Admin,Warehouse")]
    public async Task<ActionResult<ApiResponse<object>>> ReceiveStock(Guid id, ReceiveStockRequest req)
    {
        await productService.AddStockAsync(id, req.Quantity);
        return Ok(ApiResponse<object>.Ok(new { }));
    }
}
