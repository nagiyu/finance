using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DbAccess.Models
{
    public class MyTickerInfo
    {
        public int MyTickerId { get; set; }

        public int TickerId { get; set; }

        public string TickerName { get; set; }

        public string TickerCode { get; set; }

        public string Url { get; set; }

        public string ExchangeName { get; set; }

        public DateTimeOffset StartTime { get; set; }

        public DateTimeOffset EndTime { get; set; }

        public int PurchasePrice { get; set; }

        public float PurchaseQuantity { get; set; }
    }
}
