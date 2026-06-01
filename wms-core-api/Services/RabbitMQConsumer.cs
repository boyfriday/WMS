using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using WmsCoreApi.Data;
using WmsCoreApi.DTOs;

namespace WmsCoreApi.Services;

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
                        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                        var product = await db.Products.FindAsync(Guid.Parse(message.ProductId));
                        if (product != null)
                        {
                            product.Stock = Math.Max(0, product.Stock - message.Quantity);
                            await db.SaveChangesAsync();
                            _logger.LogInformation("Stock updated for product {ProductId}: new stock {Stock}", product.Id, product.Stock);
                        }

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
