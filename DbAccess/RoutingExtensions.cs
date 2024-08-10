using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using DbAccess.Data;
using DbAccess.Repositories;

namespace DbAccess
{
    public static class RoutingExtensions
    {
        public static void AddDbAccessServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<IExchangeRepository, ExchangeRepository>();
            services.AddScoped<ITickerRepository, TickerRepository>();
            services.AddScoped<IMyTickerRepository, MyTickerRepository>();
            services.AddScoped<ITickerInfoRepository, TickerInfoRepository>();
            services.AddScoped<IMyTickerInfoRepository, MyTickerInfoRepository>();

            services.AddDbContext<ExchangeContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
            services.AddDbContext<TickerDbContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
            services.AddDbContext<MyTickerContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
            services.AddDbContext<TickerInfoContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
            services.AddDbContext<MyTickerInfoContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
        }
    }
}
