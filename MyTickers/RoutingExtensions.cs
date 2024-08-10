using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace MyTickers
{
    public static class RoutingExtensions
    {
        public static void UseMyTickerRoutes(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapControllerRoute(
                name: "myTicker_default",
                pattern: "{controller=MyTickersController}/{action=Index}/{id?}");
        }
    }
}
