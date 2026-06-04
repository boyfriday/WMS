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
[Authorize(Roles = "Admin,Operator")]
public class CustomersController(ICustomerService customerService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CustomerDto>>>> GetAll()
    {
        var res = await customerService.GetAllCustomersAsync();
        return Ok(res);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CustomerDto>>> GetById(Guid id)
    {
        var res = await customerService.GetCustomerByIdAsync(id);
        if (!res.Success) return NotFound(res);
        return Ok(res);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<CustomerDto>>> Create(CreateCustomerRequest req)
    {
        var res = await customerService.CreateCustomerAsync(req);
        if (!res.Success) return BadRequest(res);
        return Ok(res);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<CustomerDto>>> Update(Guid id, UpdateCustomerRequest req)
    {
        var res = await customerService.UpdateCustomerAsync(id, req);
        if (!res.Success) return BadRequest(res);
        return Ok(res);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var res = await customerService.DeleteCustomerAsync(id);
        if (!res.Success) return NotFound(res);
        return Ok(res);
    }
}
