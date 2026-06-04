using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WmsCoreApi.Application.DTOs;
using WmsCoreApi.Application.Interfaces;
using WmsCoreApi.Domain.Entities;
using WmsCoreApi.Domain.Interfaces;

namespace WmsCoreApi.Application.Services;

public class CategoryService(IUnitOfWork unitOfWork) : ICategoryService
{
    public async Task<ApiResponse<List<CategoryDto>>> GetAllCategoriesAsync()
    {
        var categories = await unitOfWork.Categories.GetAllAsync();
        var dtos = categories.Select(c => new CategoryDto(c.Id, c.Name, c.Description, c.IsDeleted)).ToList();
        return ApiResponse<List<CategoryDto>>.Ok(dtos);
    }

    public async Task<ApiResponse<CategoryDto>> GetCategoryByIdAsync(Guid id)
    {
        var category = await unitOfWork.Categories.GetByIdAsync(id);
        if (category == null) return ApiResponse<CategoryDto>.Fail("Category not found");

        return ApiResponse<CategoryDto>.Ok(new CategoryDto(category.Id, category.Name, category.Description, category.IsDeleted));
    }

    public async Task<ApiResponse<CategoryDto>> CreateCategoryAsync(CreateCategoryRequest request)
    {
        var category = new Category { Name = request.Name, Description = request.Description, IsDeleted = request.IsDeleted };
        await unitOfWork.Categories.AddAsync(category);
        await unitOfWork.CompleteAsync();

        return ApiResponse<CategoryDto>.Ok(new CategoryDto(category.Id, category.Name, category.Description, category.IsDeleted));
    }

    public async Task<ApiResponse<CategoryDto>> UpdateCategoryAsync(Guid id, UpdateCategoryRequest request)
    {
        var category = await unitOfWork.Categories.GetByIdAsync(id);
        if (category == null) return ApiResponse<CategoryDto>.Fail("Category not found");

        category.Name = request.Name;
        category.Description = request.Description;
        category.IsDeleted = request.IsDeleted;
        unitOfWork.Categories.Update(category);
        await unitOfWork.CompleteAsync();

        return ApiResponse<CategoryDto>.Ok(new CategoryDto(category.Id, category.Name, category.Description, category.IsDeleted));
    }

    public async Task<ApiResponse<object>> DeleteCategoryAsync(Guid id)
    {
        var category = await unitOfWork.Categories.GetByIdAsync(id);
        if (category == null) return ApiResponse<object>.Fail("Category not found");

        unitOfWork.Categories.Remove(category);
        await unitOfWork.CompleteAsync();

        return ApiResponse<object>.Ok(new { });
    }
}
