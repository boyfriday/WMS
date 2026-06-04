using System;

namespace WmsCoreApi.Application.DTOs;

public record CreateProductRequest(string Name, string? Description, decimal Price, int Stock, Guid CategoryId, bool IsDeleted = false);
public record UpdateProductRequest(string Name, string? Description, decimal Price, int Stock, Guid CategoryId, bool IsDeleted = false);
public record ReceiveStockRequest(int Quantity);
public record ProductDto(Guid Id, string Name, string? Description, decimal Price, int Stock, Guid CategoryId, CategoryDto? Category, bool IsDeleted);
