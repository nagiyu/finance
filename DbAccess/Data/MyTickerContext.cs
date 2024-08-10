using DbAccess.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DbAccess.Data
{
    public class MyTickerContext : DbContext
    {
        public MyTickerContext(DbContextOptions<MyTickerContext> options)
            : base(options)
        {
        }

        public DbSet<MyTicker> MyTickers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<MyTicker>(entity =>
            {
                entity.ToTable("my_tickers");

                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("id");

                entity.Property(e => e.TickerId)
                    .HasColumnName("ticker_id");

                entity.Property(e => e.PurchasePrice)
                    .HasColumnName("purchase_price");

                entity.Property(e => e.PurchaseQuantity)
                    .HasColumnName("purchase_quantity");
            });
        }
    }
}
