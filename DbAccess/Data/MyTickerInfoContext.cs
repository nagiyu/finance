using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;

using DbAccess.Models;

namespace DbAccess.Data
{
    public class MyTickerInfoContext : DbContext
    {
        public MyTickerInfoContext(DbContextOptions<MyTickerInfoContext> options) : base(options) { }

        public DbSet<MyTickerInfo> MyTickerInfos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<MyTickerInfo>(entity =>
            {
                entity.ToView("my_ticker_info");

                entity.HasKey(e => e.MyTickerId);

                entity.Property(e => e.MyTickerId)
                    .HasColumnName("my_ticker_id");

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

                entity.Property(e => e.PurchasePrice)
                    .HasColumnName("purchase_price");

                entity.Property(e => e.PurchaseQuantity)
                    .HasColumnName("purchase_quantity");
            });
        }
    }
}
