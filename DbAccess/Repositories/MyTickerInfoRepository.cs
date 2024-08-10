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
    public class MyTickerInfoRepository : IMyTickerInfoRepository
    {
        private readonly MyTickerInfoContext _context;

        public MyTickerInfoRepository(MyTickerInfoContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MyTickerInfo>> GetMyTickerInfosAsync()
        {
            return await _context.MyTickerInfos.ToListAsync();
        }
    }
}
