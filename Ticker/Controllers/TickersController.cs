using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

using DbAccess.Models;
using DbAccess.Repositories;

namespace Ticker.Controllers
{
    public class TickersController : Controller
    {
        private readonly IExchangeRepository _exchangeRepository;
        private readonly ITickerRepository _tickerRepository;
        private readonly ITickerInfoRepository _tickerInfoRepository;

        public TickersController(IExchangeRepository exchangeRepository, ITickerRepository tickerRepository, ITickerInfoRepository tickerInfoRepository)
        {
            _exchangeRepository = exchangeRepository;
            _tickerRepository = tickerRepository;
            _tickerInfoRepository = tickerInfoRepository;
        }

        public async Task<IActionResult> Index()
        {
            return View(await _tickerInfoRepository.GetTickerInfosAsync());
        }

        public async Task<IActionResult> Details(int id)
        {
            var ticker = await _tickerRepository.GetTickerById(id);
            if (ticker == null)
            {
                return NotFound();
            }
            return View(ticker);
        }

        public async Task<IActionResult> Create()
        {
            var exchanges = await _exchangeRepository.GetAllExchanges();
            ViewBag.ExchangeList = new SelectList(exchanges, nameof(Exchange.Id), nameof(Exchange.ExchangeName));
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(DbAccess.Models.Ticker ticker)
        {
            if (ModelState.IsValid)
            {
                await _tickerRepository.AddTicker(ticker);
                return RedirectToAction(nameof(Index));
            }
            var exchanges = await _exchangeRepository.GetAllExchanges();
            ViewBag.ExchangeList = new SelectList(exchanges, nameof(Exchange.Id), nameof(Exchange.ExchangeName));
            return View(ticker);
        }

        public async Task<IActionResult> Edit(int id)
        {
            var ticker = await _tickerRepository.GetTickerById(id);
            if (ticker == null)
            {
                return NotFound();
            }
            
            var exchanges = await _exchangeRepository.GetAllExchanges();
            ViewBag.ExchangeList = new SelectList(exchanges, nameof(Exchange.Id), nameof(Exchange.ExchangeName));

            return View(ticker);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, DbAccess.Models.Ticker ticker)
        {
            if (id != ticker.Id)
            {
                return BadRequest();
            }

            if (ModelState.IsValid)
            {
                await _tickerRepository.UpdateTicker(ticker);
                return RedirectToAction(nameof(Index));
            }

            var exchanges = await _exchangeRepository.GetAllExchanges();
            ViewBag.ExchangeList = new SelectList(exchanges, nameof(Exchange.Id), nameof(Exchange.ExchangeName));

            return View(ticker);
        }

        public async Task<IActionResult> Delete(int id)
        {
            var ticker = await _tickerRepository.GetTickerById(id);
            if (ticker == null)
            {
                return NotFound();
            }
            return View(ticker);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            await _tickerRepository.DeleteTicker(id);
            return RedirectToAction(nameof(Index));
        }
    }
}
