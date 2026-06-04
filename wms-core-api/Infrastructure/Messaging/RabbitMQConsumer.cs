using System;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using WmsCoreApi.Application.DTOs;
using WmsCoreApi.Application.Interfaces;

namespace WmsCoreApi.Infrastructure.Messaging;

public class RabbitMQConsumer : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<RabbitMQConsumer> _logger;
    private readonly string _hostname;
    private readonly int _port;
    private readonly string _username;
    private readonly string _password;

    public RabbitMQConsumer(IServiceProvider serviceProvider, ILogger<RabbitMQConsumer> logger, IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _hostname = configuration["RabbitMQ:Host"]!;
        _port = int.Parse(configuration["RabbitMQ:Port"]!);
        _username = configuration["RabbitMQ:Username"]!;
        _password = configuration["RabbitMQ:Password"]!;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        return Task.Run(() =>
        {
            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = _hostname,
                    Port = _port,
                    UserName = _username,
                    Password = _password,
                    DispatchConsumersAsync = true
                };

                var connection = factory.CreateConnection();
                var channel = connection.CreateModel();

                channel.ExchangeDeclare("wms.direct", "direct", durable: true);
                channel.QueueDeclare("stock.deduct", durable: true, exclusive: false, autoDelete: false);
                channel.QueueBind("stock.deduct", "wms.direct", "stock.deduct");

                var consumer = new AsyncEventingBasicConsumer(channel);
                consumer.Received += async (model, ea) =>
                {
                    try
                    {
                        var body = ea.Body.ToArray();
                        var message = JsonSerializer.Deserialize<StockDeductMessage>(Encoding.UTF8.GetString(body));
                        if (message == null) return;

                        _logger.LogInformation("Processing stock deduction for product {ProductId}, quantity {Quantity}, order {OrderId}",
                            message.ProductId, message.Quantity, message.OrderId);

                        using var scope = _serviceProvider.CreateScope();
                        var productService = scope.ServiceProvider.GetRequiredService<IProductService>();

                        await productService.DeductStockAsync(Guid.Parse(message.ProductId), message.Quantity);
                        _logger.LogInformation("Stock updated successfully for product {ProductId}", message.ProductId);

                        channel.BasicAck(ea.DeliveryTag, multiple: false);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing stock deduct message");
                        channel.BasicNack(ea.DeliveryTag, multiple: false, requeue: true);
                    }
                };

                channel.BasicConsume("stock.deduct", autoAck: false, consumer);

                _logger.LogInformation("RabbitMQ consumer started");

                while (!stoppingToken.IsCancellationRequested)
                {
                    Task.Delay(1000, stoppingToken).Wait();
                }

                channel.Close();
                connection.Close();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RabbitMQ consumer failed");
            }
        }, stoppingToken);
    }
}
