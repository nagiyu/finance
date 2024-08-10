using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;

using DbAccess.Models;

namespace DbAccess.Data
{
    public class ExchangeContext : DbContext
    {
        public ExchangeContext(DbContextOptions<ExchangeContext> options) : base(options) { }

        public DbSet<Exchange> Exchanges { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Exchange>(entity =>
            {
                entity.ToTable("exchanges");

                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("id");

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
