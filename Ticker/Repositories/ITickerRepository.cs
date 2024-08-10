using System.Collections.Generic;
using System.Threading.Tasks;

namespace Ticker.Repositories
{
    public interface ITickerRepository
    {
        Task<IEnumerable<Models.Ticker>> GetAllTickers();

        Task<Models.Ticker> GetTickerById(int id);

        Task<Models.Ticker> AddTicker(Models.Ticker ticker);

        Task<Models.Ticker> UpdateTicker(Models.Ticker ticker);

        Task DeleteTicker(int id);
    }
}
