using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WmsCoreApi.Application.DTOs;

namespace WmsCoreApi.Application.Interfaces;

public interface ICategoryService
{
    Task<ApiResponse<List<CategoryDto>>> GetAllCategoriesAsync();
    Task<ApiResponse<CategoryDto>> GetCategoryByIdAsync(Guid id);
    Task<ApiResponse<CategoryDto>> CreateCategoryAsync(CreateCategoryRequest request);
    Task<ApiResponse<CategoryDto>> UpdateCategoryAsync(Guid id, UpdateCategoryRequest request);
    Task<ApiResponse<object>> DeleteCategoryAsync(Guid id);
}
