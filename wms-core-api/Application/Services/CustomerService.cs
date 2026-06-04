using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WmsCoreApi.Application.DTOs;
using WmsCoreApi.Application.Interfaces;
using WmsCoreApi.Domain.Entities;
using WmsCoreApi.Domain.Interfaces;

namespace WmsCoreApi.Application.Services;

public class CustomerService(IUnitOfWork unitOfWork) : ICustomerService
{
    public async Task<ApiResponse<List<CustomerDto>>> GetAllCustomersAsync()
    {
        var customers = await unitOfWork.Customers.GetAllAsync();
        var dtos = customers.Select(c => new CustomerDto(
            c.Id, 
            c.Name, 
            c.Email, 
            c.Phone, 
            c.Address, 
            c.CreatedAt
        )).ToList();
        return ApiResponse<List<CustomerDto>>.Ok(dtos);
    }

    public async Task<ApiResponse<CustomerDto>> GetCustomerByIdAsync(Guid id)
    {
        var customer = await unitOfWork.Customers.GetByIdAsync(id);
        if (customer == null) return ApiResponse<CustomerDto>.Fail("Customer not found");

        return ApiResponse<CustomerDto>.Ok(new CustomerDto(
            customer.Id, 
            customer.Name, 
            customer.Email, 
            customer.Phone, 
            customer.Address, 
            customer.CreatedAt
        ));
    }

    public async Task<ApiResponse<CustomerDto>> CreateCustomerAsync(CreateCustomerRequest request)
    {
        // Simple check to make sure email isn't already registered
        var existing = await unitOfWork.Customers.FindAsync(c => c.Email.ToLower() == request.Email.ToLower());
        if (existing.Any()) return ApiResponse<CustomerDto>.Fail("A customer with this email already exists");

        var customer = new Customer
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address
        };

        await unitOfWork.Customers.AddAsync(customer);
        await unitOfWork.CompleteAsync();

        return ApiResponse<CustomerDto>.Ok(new CustomerDto(
            customer.Id, 
            customer.Name, 
            customer.Email, 
            customer.Phone, 
            customer.Address, 
            customer.CreatedAt
        ));
    }

    public async Task<ApiResponse<CustomerDto>> UpdateCustomerAsync(Guid id, UpdateCustomerRequest request)
    {
        var customer = await unitOfWork.Customers.GetByIdAsync(id);
        if (customer == null) return ApiResponse<CustomerDto>.Fail("Customer not found");

        // Check if email belongs to someone else
        var existing = await unitOfWork.Customers.FindAsync(c => c.Email.ToLower() == request.Email.ToLower() && c.Id != id);
        if (existing.Any()) return ApiResponse<CustomerDto>.Fail("A customer with this email already exists");

        customer.Name = request.Name;
        customer.Email = request.Email;
        customer.Phone = request.Phone;
        customer.Address = request.Address;

        unitOfWork.Customers.Update(customer);
        await unitOfWork.CompleteAsync();

        return ApiResponse<CustomerDto>.Ok(new CustomerDto(
            customer.Id, 
            customer.Name, 
            customer.Email, 
            customer.Phone, 
            customer.Address, 
            customer.CreatedAt
        ));
    }

    public async Task<ApiResponse<object>> DeleteCustomerAsync(Guid id)
    {
        var customer = await unitOfWork.Customers.GetByIdAsync(id);
        if (customer == null) return ApiResponse<object>.Fail("Customer not found");

        unitOfWork.Customers.Remove(customer);
        await unitOfWork.CompleteAsync();

        return ApiResponse<object>.Ok(new { });
    }
}
