using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WmsCoreApi.Application.DTOs;

namespace WmsCoreApi.Application.Interfaces;

public interface ICustomerService
{
    Task<ApiResponse<List<CustomerDto>>> GetAllCustomersAsync();
    Task<ApiResponse<CustomerDto>> GetCustomerByIdAsync(Guid id);
    Task<ApiResponse<CustomerDto>> CreateCustomerAsync(CreateCustomerRequest request);
    Task<ApiResponse<CustomerDto>> UpdateCustomerAsync(Guid id, UpdateCustomerRequest request);
    Task<ApiResponse<object>> DeleteCustomerAsync(Guid id);
}
