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
    public class TickerInfoRepository : ITickerInfoRepository
    {
        private readonly TickerInfoContext _context;

        public TickerInfoRepository(TickerInfoContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TickerInfo>> GetTickerInfosAsync()
        {
            return await _context.TickerInfos.ToListAsync();
        }
    }
}
