using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace Ticker
{
    public static class RoutingExtensions
    {
        public static void UseTickerRoutes(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapControllerRoute(
                name: "ticker_default",
                pattern: "{controller=TickersController}/{action=Index}/{id?}");
        }
    }
}
