using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DbAccess.Models
{
    public class MyTicker
    {
        public int Id { get; set; }

        public int TickerId { get; set; }

        public int PurchasePrice { get; set; }

        public float PurchaseQuantity { get; set; }
    }
}
