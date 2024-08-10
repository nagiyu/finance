using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;

using DbAccess.Data;
using DbAccess.Models;

namespace DbAccess.Repositories
{
    public class TickerRepository : ITickerRepository
    {
        private readonly TickerDbContext _context;

        public TickerRepository(TickerDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Ticker>> GetAllTickers()
        {
            return await _context.Tickers.ToListAsync();
        }

        public async Task<Ticker> GetTickerById(int id)
        {
            return await _context.Tickers.FindAsync(id);
        }

        public async Task<Ticker> AddTicker(Ticker ticker)
        {
            _context.Tickers.Add(ticker);
            await _context.SaveChangesAsync();
            return ticker;
        }

        public async Task<Ticker> UpdateTicker(Ticker ticker)
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
