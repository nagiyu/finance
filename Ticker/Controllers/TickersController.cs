using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Ticker.Repositories;

namespace Ticker.Controllers
{
    public class TickersController : Controller
    {
        private readonly ITickerRepository _tickerRepository;

        public TickersController(ITickerRepository tickerRepository)
        {
            _tickerRepository = tickerRepository;
        }

        public async Task<IActionResult> Index()
        {
            return View(await _tickerRepository.GetAllTickers());
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

        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Models.Ticker ticker)
        {
            if (ModelState.IsValid)
            {
                await _tickerRepository.AddTicker(ticker);
                return RedirectToAction(nameof(Index));
            }
            return View(ticker);
        }

        public async Task<IActionResult> Edit(int id)
        {
            var ticker = await _tickerRepository.GetTickerById(id);
            if (ticker == null)
            {
                return NotFound();
            }
            return View(ticker);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Models.Ticker ticker)
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
