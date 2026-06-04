using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WmsCoreApi.Application.DTOs;
using WmsCoreApi.Application.Interfaces;
using WmsCoreApi.Domain.Entities;
using WmsCoreApi.Domain.Interfaces;

namespace WmsCoreApi.Application.Services;

public class ProductService(IUnitOfWork unitOfWork) : IProductService
{
    public async Task<ApiResponse<List<ProductDto>>> GetAllProductsAsync()
    {
        var products = await unitOfWork.Products.GetAllWithCategoryAsync();
        var dtos = products.Select(p => new ProductDto(
            p.Id, p.Name, p.Description, p.Price, p.Stock, p.CategoryId,
            p.Category == null ? null : new CategoryDto(p.Category.Id, p.Category.Name, p.Category.Description)
        )).ToList();
        return ApiResponse<List<ProductDto>>.Ok(dtos);
    }

    public async Task<ApiResponse<ProductDto>> GetProductByIdAsync(Guid id)
    {
        var product = await unitOfWork.Products.GetByIdWithCategoryAsync(id);
        if (product == null) return ApiResponse<ProductDto>.Fail("Product not found");

        var dto = new ProductDto(
            product.Id, product.Name, product.Description, product.Price, product.Stock, product.CategoryId,
            product.Category == null ? null : new CategoryDto(product.Category.Id, product.Category.Name, product.Category.Description)
        );
        return ApiResponse<ProductDto>.Ok(dto);
    }

    public async Task<ApiResponse<ProductDto>> CreateProductAsync(CreateProductRequest request)
    {
        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Stock = request.Stock,
            CategoryId = request.CategoryId
        };

        await unitOfWork.Products.AddAsync(product);
        await unitOfWork.CompleteAsync();

        // Refresh to eager load category
        var productWithCategory = await unitOfWork.Products.GetByIdWithCategoryAsync(product.Id);
        var dto = new ProductDto(
            productWithCategory!.Id, productWithCategory.Name, productWithCategory.Description, productWithCategory.Price, productWithCategory.Stock, productWithCategory.CategoryId,
            productWithCategory.Category == null ? null : new CategoryDto(productWithCategory.Category.Id, productWithCategory.Category.Name, productWithCategory.Category.Description)
        );
        return ApiResponse<ProductDto>.Ok(dto);
    }

    public async Task<ApiResponse<ProductDto>> UpdateProductAsync(Guid id, UpdateProductRequest request)
    {
        var product = await unitOfWork.Products.GetByIdAsync(id);
        if (product == null) return ApiResponse<ProductDto>.Fail("Product not found");

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.Stock = request.Stock;
        product.CategoryId = request.CategoryId;

        unitOfWork.Products.Update(product);
        await unitOfWork.CompleteAsync();

        var productWithCategory = await unitOfWork.Products.GetByIdWithCategoryAsync(product.Id);
        var dto = new ProductDto(
            productWithCategory!.Id, productWithCategory.Name, productWithCategory.Description, productWithCategory.Price, productWithCategory.Stock, productWithCategory.CategoryId,
            productWithCategory.Category == null ? null : new CategoryDto(productWithCategory.Category.Id, productWithCategory.Category.Name, productWithCategory.Category.Description)
        );
        return ApiResponse<ProductDto>.Ok(dto);
    }

    public async Task<ApiResponse<object>> DeleteProductAsync(Guid id)
    {
        var product = await unitOfWork.Products.GetByIdAsync(id);
        if (product == null) return ApiResponse<object>.Fail("Product not found");

        unitOfWork.Products.Remove(product);
        await unitOfWork.CompleteAsync();

        return ApiResponse<object>.Ok(new { });
    }

    public async Task DeductStockAsync(Guid productId, int quantity)
    {
        var product = await unitOfWork.Products.GetByIdAsync(productId);
        if (product != null)
        {
            product.Stock = Math.Max(0, product.Stock - quantity);
            unitOfWork.Products.Update(product);
            await unitOfWork.CompleteAsync();
        }
    }

    public async Task AddStockAsync(Guid productId, int quantity)
    {
        var product = await unitOfWork.Products.GetByIdAsync(productId);
        if (product != null)
        {
            product.Stock += quantity;
            unitOfWork.Products.Update(product);
            await unitOfWork.CompleteAsync();
        }
    }
}
