using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using DbAccess.Models;

namespace DbAccess.Repositories
{
    public interface IMyTickerInfoRepository
    {
        Task<IEnumerable<MyTickerInfo>> GetMyTickerInfosAsync();
    }
}
