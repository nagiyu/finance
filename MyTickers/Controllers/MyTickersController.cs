using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

using DbAccess.Repositories;
using DbAccess.Models;

namespace MyTickers.Controllers
{
    public class MyTickersController : Controller
    {
        private readonly ITickerRepository tickerRepository;
        private readonly IMyTickerRepository myTickerRepository;
        private readonly IMyTickerInfoRepository myTickerInfoRepository;

        public MyTickersController(
            ITickerRepository tickerRepository, 
            IMyTickerRepository myTickerRepository, 
            IMyTickerInfoRepository myTickerInfoRepository)
        {
            this.tickerRepository = tickerRepository;
            this.myTickerRepository = myTickerRepository;
            this.myTickerInfoRepository = myTickerInfoRepository;
        }

        public async Task<IActionResult> Index()
        {
            return View(await myTickerInfoRepository.GetMyTickerInfosAsync());
        }

        public async Task<IActionResult> Details(int id)
        {
            var ticker = await myTickerRepository.GetMyTickerById(id);
            if (ticker == null)
            {
                return NotFound();
            }
            return View(ticker);
        }

        public async Task<IActionResult> Create()
        {
            ViewBag.TickersList = await GetTickersSelectListItems();

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(MyTicker ticker)
        {
            if (ModelState.IsValid)
            {
                await myTickerRepository.AddMyTicker(ticker);
                return RedirectToAction(nameof(Index));
            }
            
            ViewBag.TickersList = await GetTickersSelectListItems();

            return View(ticker);
        }

        public async Task<IActionResult> Edit(int id)
        {
            var ticker = await myTickerRepository.GetMyTickerById(id);
            if (ticker == null)
            {
                return NotFound();
            }

            ViewBag.TickersList = await GetTickersSelectListItems();

            return View(ticker);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, MyTicker ticker)
        {
            if (id != ticker.Id)
            {
                return BadRequest();
            }

            if (ModelState.IsValid)
            {
                await myTickerRepository.UpdateMyTicker(ticker);
                return RedirectToAction(nameof(Index));
            }

            ViewBag.TickersList = await GetTickersSelectListItems();

            return View(ticker);
        }

        private async Task<SelectList> GetTickersSelectListItems()
        {
            var tickers = await tickerRepository.GetAllTickers();
            return new SelectList(tickers, nameof(Ticker.Id), nameof(Ticker.TickerName));
        }

        public async Task<IActionResult> Delete(int id)
        {
            var ticker = await myTickerRepository.GetMyTickerById(id);
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
            await myTickerRepository.DeleteMyTicker(id);
            return RedirectToAction(nameof(Index));
        }
    }
}
