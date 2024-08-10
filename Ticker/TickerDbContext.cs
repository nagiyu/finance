using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

namespace Ticker
{
    public class TickerDbContext : DbContext
    {
        public TickerDbContext(DbContextOptions<TickerDbContext> options) : base(options) { }

        public DbSet<Models.Ticker> Tickers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Models.Ticker>(entity =>
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
