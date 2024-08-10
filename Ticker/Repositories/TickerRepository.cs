using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ticker.Repositories
{
    public class TickerRepository : ITickerRepository
    {
        private readonly TickerDbContext _context;

        public TickerRepository(TickerDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Models.Ticker>> GetAllTickers()
        {
            return await _context.Tickers.ToListAsync();
        }

        public async Task<Models.Ticker> GetTickerById(int id)
        {
            return await _context.Tickers.FindAsync(id);
        }

        public async Task<Models.Ticker> AddTicker(Models.Ticker ticker)
        {
            _context.Tickers.Add(ticker);
            await _context.SaveChangesAsync();
            return ticker;
        }

        public async Task<Models.Ticker> UpdateTicker(Models.Ticker ticker)
        {
            _context.Entry(ticker).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return ticker;
        }

        public async Task DeleteTicker(int id)
        {
            var ticker = await _context.Tickers.FindAsync(id);
            if (ticker != null)
            {
                _context.Tickers.Remove(ticker);
                await _context.SaveChangesAsync();
            }
        }
    }
}
