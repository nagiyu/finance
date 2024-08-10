using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using DbAccess;
using Ticker;
using Ticker.Controllers;
using MyTickers;
using MyTickers.Controllers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbAccessServices(builder.Configuration);

// Add services to the container.
builder.Services.AddControllersWithViews()
    .AddApplicationPart(typeof(TickersController).Assembly)
    .AddApplicationPart(typeof(MyTickersController).Assembly);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
}
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.UseTickerRoutes();
    endpoints.UseMyTickerRoutes();

    // ベースプロジェクトのルーティング
    endpoints.MapControllerRoute(
        name: "default",
        pattern: "{controller=Home}/{action=Index}/{id?}");
});

app.Run();
