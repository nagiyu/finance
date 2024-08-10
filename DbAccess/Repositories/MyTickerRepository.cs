using DbAccess.Data;
using DbAccess.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DbAccess.Repositories
{
    public class MyTickerRepository : IMyTickerRepository
    {
        private readonly MyTickerContext _context;

        public MyTickerRepository(MyTickerContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MyTicker>> GetAllMyTickers()
        {
            return await _context.MyTickers.ToListAsync();
        }

        public async Task<MyTicker> GetMyTickerById(int id)
        {
            return await _context.MyTickers.FindAsync(id);
        }

        public async Task<MyTicker> AddMyTicker(MyTicker myTicker)
        {
            _context.MyTickers.Add(myTicker);
            await _context.SaveChangesAsync();
            return myTicker;
        }

        public async Task<MyTicker> UpdateMyTicker(MyTicker myTicker)
        {
            _context.Entry(myTicker).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return myTicker;
        }

        public async Task DeleteMyTicker(int id)
        {
            var myTicker = await _context.MyTickers.FindAsync(id);
            if (myTicker != null)
            {
                _context.MyTickers.Remove(myTicker);
                await _context.SaveChangesAsync();
            }
        }
    }
}
