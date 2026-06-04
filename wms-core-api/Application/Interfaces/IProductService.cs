using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WmsCoreApi.Application.DTOs;

namespace WmsCoreApi.Application.Interfaces;

public interface IProductService
{
    Task<ApiResponse<List<ProductDto>>> GetAllProductsAsync();
    Task<ApiResponse<ProductDto>> GetProductByIdAsync(Guid id);
    Task<ApiResponse<ProductDto>> CreateProductAsync(CreateProductRequest request);
    Task<ApiResponse<ProductDto>> UpdateProductAsync(Guid id, UpdateProductRequest request);
    Task<ApiResponse<object>> DeleteProductAsync(Guid id);
    Task DeductStockAsync(Guid productId, int quantity);
    Task AddStockAsync(Guid productId, int quantity);
}
