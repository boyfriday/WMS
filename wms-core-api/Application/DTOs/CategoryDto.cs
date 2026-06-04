using System;

namespace WmsCoreApi.Application.DTOs;

public record CreateCategoryRequest(string Name, string? Description);
public record UpdateCategoryRequest(string Name, string? Description);
public record CategoryDto(Guid Id, string Name, string? Description);
