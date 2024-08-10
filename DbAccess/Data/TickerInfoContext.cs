using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;

using DbAccess.Models;

namespace DbAccess.Data
{
    public class TickerInfoContext : DbContext
    {
        public TickerInfoContext(DbContextOptions<TickerInfoContext> options) : base(options) { }

        public DbSet<TickerInfo> TickerInfos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TickerInfo>(entity =>
            {
                entity.ToView("ticker_info");

                entity.HasKey(e => e.TickerId);

                entity.Property(e => e.TickerId)
                    .HasColumnName("ticker_id");

                entity.Property(e => e.TickerName)
                    .HasColumnName("ticker_name");

                entity.Property(e => e.TickerCode)
                    .HasColumnName("ticker_code");

                entity.Property(e => e.Url)
                    .HasColumnName("url");

                entity.Property(e => e.ExchangeName)
                    .HasColumnName("exchange_name");

                entity.Property(e => e.StartTime)
                    .HasColumnName("start_time");

                entity.Property(e => e.EndTime)
                    .HasColumnName("end_time");
            });
        }
    }
}
