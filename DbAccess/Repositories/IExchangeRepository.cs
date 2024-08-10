using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using DbAccess.Models;

namespace DbAccess.Repositories
{
    public interface IExchangeRepository
    {
        Task<IEnumerable<Exchange>> GetAllExchanges();

        Task<Exchange> GetExchangeById(int id);

        Task<Exchange> AddExchange(Exchange exchange);

        Task<Exchange> UpdateExchange(Exchange exchange);

        Task DeleteExchange(int id);
    }
}
