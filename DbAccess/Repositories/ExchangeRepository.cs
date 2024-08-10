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
    public class ExchangeRepository : IExchangeRepository
    {
        private readonly ExchangeContext _context;

        public ExchangeRepository(ExchangeContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Exchange>> GetAllExchanges()
        {
            return await _context.Exchanges.ToListAsync();
        }

        public async Task<Exchange> GetExchangeById(int id)
        {
            return await _context.Exchanges.FindAsync(id);
        }

        public async Task<Exchange> AddExchange(Exchange exchange)
        {
            _context.Exchanges.Add(exchange);
            await _context.SaveChangesAsync();
            return exchange;
        }

        public async Task<Exchange> UpdateExchange(Exchange exchange)
        {
            _context.Entry(exchange).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return exchange;
        }

        public async Task DeleteExchange(int id)
        {
            var exchange = await _context.Exchanges.FindAsync(id);
            if (exchange != null)
            {
                _context.Exchanges.Remove(exchange);
                await _context.SaveChangesAsync();
            }
        }
    }
}
