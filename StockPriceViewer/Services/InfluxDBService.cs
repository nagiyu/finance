using Microsoft.Extensions.Options;
using StockPriceViewer.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;
using InfluxData.Net.Common.Enums;
using InfluxData.Net.InfluxDb;

namespace StockPriceViewer.Services
{


    public class InfluxDBService
    {
        private readonly IInfluxDbClient _client;
        private readonly string _database;

        public InfluxDBService(IOptions<InfluxDBSettings> influxDBSettings)
        {
            var settings = influxDBSettings.Value;
            _database = settings.Bucket;
            _client = new InfluxDbClient(settings.Url, "admin", "admin", InfluxDbVersion.v_1_3);
        }

        public async Task<List<StockPrice>> GetStockPricesAsync()
        {
            var query = $"SELECT * FROM stock_price";
            var response = await _client.Client.QueryAsync(query, _database);
            var series = response.FirstOrDefault();

            var stockPrices = new List<StockPrice>();

            if (series != null)
            {
                foreach (var record in series.Values)
                {
                    var stockPrice = new StockPrice
                    {
                        Time = DateTime.Parse(record[0].ToString()).ToUniversalTime(),
                        Price = double.Parse(record[1].ToString())
                    };

                    for (int i = 2; i < series.Columns.Count; i++)
                    {
                        stockPrice.Tags[series.Columns[i]] = record[i]?.ToString();
                    }

                    stockPrices.Add(stockPrice);
                }
            }

            return stockPrices;
        }
    }

    public class StockPrice
    {
        public DateTime Time { get; set; }
        public double Price { get; set; }
        public Dictionary<string, string> Tags { get; set; } = new Dictionary<string, string>();
    }
}
