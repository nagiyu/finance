using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;

using DbAccess.Models;

namespace DbAccess.Data
{
    public class TickerDbContext : DbContext
    {
        public TickerDbContext(DbContextOptions<TickerDbContext> options) : base(options) { }

        public DbSet<Ticker> Tickers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Ticker>(entity =>
            {
                entity.ToTable("tickers");

                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("id");

                entity.Property(e => e.TickerName)
                    .HasColumnName("ticker_name");

                entity.Property(e => e.TickerCode)
                    .HasColumnName("ticker_code");

                entity.Property(e => e.ExchangeId)
                    .HasColumnName("exchange_id");

                entity.Property(e => e.Url)
                    .HasColumnName("url");
            });
        }
    }
}
