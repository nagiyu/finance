using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using StockPriceViewer.Models;
using StockPriceViewer.Services;
using System.Diagnostics;
using System.Threading.Tasks;

namespace StockPriceViewer.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        private readonly InfluxDBService _influxDBService;

        public HomeController(ILogger<HomeController> logger, InfluxDBService influxDBService)
        {
            _logger = logger;
            _influxDBService = influxDBService;
        }

        public async Task<IActionResult> Index()
        {
            var stockPrices = await _influxDBService.GetStockPricesAsync();
            return View(stockPrices);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
