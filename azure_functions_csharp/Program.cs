using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Azure.Cosmos;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services =>
    {
        // services.AddApplicationInsightsTelemetryWorkerService();
        // services.ConfigureFunctionsApplicationInsights();
        services.AddHttpClient();
        services.AddSingleton(s => {
            string connectionString = Environment.GetEnvironmentVariable("AZURE_COSMOS_CONNECTION_STRING")!;
            return new CosmosClient(connectionString);
        });
    })
    .Build();

host.Run();
