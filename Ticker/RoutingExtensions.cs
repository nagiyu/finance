using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

using DbAccess.Repositories;

namespace Ticker
{
    public static class RoutingExtensions
    {
        public static void AddTickerServices(this IServiceCollection services)
        {
            services.AddScoped<ITickerRepository, TickerRepository>();
        }

        public static void UseTickerRoutes(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapControllerRoute(
                name: "ticker_default",
                pattern: "{controller=TickersController}/{action=Index}/{id?}");
        }
    }
}
