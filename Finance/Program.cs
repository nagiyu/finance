using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using DbAccess.Data;
using Ticker;
using Ticker.Controllers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddTickerServices();

// Add services to the container.
builder.Services.AddControllersWithViews()
    .AddApplicationPart(typeof(TickersController).Assembly);

builder.Services.AddDbContext<TickerDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

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

    // ベースプロジェクトのルーティング
    endpoints.MapControllerRoute(
        name: "default",
        pattern: "{controller=Home}/{action=Index}/{id?}");
});

app.Run();
