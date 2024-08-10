using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DbAccess.Models
{
    public class Ticker
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public required string TickerName { get; set; }

        [Required]
        [MaxLength(255)]
        public required string TickerCode { get; set; }

        [Required]
        public required int ExchangeId { get; set; }

        [Required]
        [MaxLength(255)]
        public required string Url { get; set; }
    }
}
