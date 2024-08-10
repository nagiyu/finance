using DbAccess.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DbAccess.Repositories
{
    public interface IMyTickerRepository
    {
        Task<IEnumerable<MyTicker>> GetAllMyTickers();

        Task<MyTicker> GetMyTickerById(int id);

        Task<MyTicker> AddMyTicker(MyTicker myTicker);

        Task<MyTicker> UpdateMyTicker(MyTicker myTicker);

        Task DeleteMyTicker(int id);
    }
}
