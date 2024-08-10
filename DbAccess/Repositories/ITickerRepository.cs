using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using DbAccess.Models;

namespace DbAccess.Repositories
{
    public interface ITickerRepository
    {
        Task<IEnumerable<Ticker>> GetAllTickers();

        Task<Ticker> GetTickerById(int id);

        Task<Ticker> AddTicker(Ticker ticker);

        Task<Ticker> UpdateTicker(Ticker ticker);

        Task DeleteTicker(int id);
    }
}
