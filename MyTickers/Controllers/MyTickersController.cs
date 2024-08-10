using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;

using DbAccess.Repositories;
using DbAccess.Models;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace MyTickers.Controllers
{
    public class MyTickersController : Controller
    {
        private readonly IMyTickerRepository myTickerRepository;

        public MyTickersController(IMyTickerRepository myTickerRepository)
        {
            this.myTickerRepository = myTickerRepository;
        }

        public async Task<IActionResult> Index()
        {
            return View(await myTickerRepository.GetAllMyTickers());
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
            //var exchanges = await _exchangeRepository.GetAllExchanges();
            //ViewBag.ExchangeList = new SelectList(exchanges, nameof(Exchange.Id), nameof(Exchange.ExchangeName));
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
            //var exchanges = await _exchangeRepository.GetAllExchanges();
            //ViewBag.ExchangeList = new SelectList(exchanges, nameof(Exchange.Id), nameof(Exchange.ExchangeName));
            return View(ticker);
        }

        public async Task<IActionResult> Edit(int id)
        {
            var ticker = await myTickerRepository.GetMyTickerById(id);
            if (ticker == null)
            {
                return NotFound();
            }

            //var exchanges = await _exchangeRepository.GetAllExchanges();
            //ViewBag.ExchangeList = new SelectList(exchanges, nameof(Exchange.Id), nameof(Exchange.ExchangeName));

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

            //var exchanges = await _exchangeRepository.GetAllExchanges();
            //ViewBag.ExchangeList = new SelectList(exchanges, nameof(Exchange.Id), nameof(Exchange.ExchangeName));

            return View(ticker);
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
