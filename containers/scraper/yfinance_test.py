import yfinance as yf

# 銘柄のティッカーシンボルを指定します
ticker = 'AAPL'

# ティッカーオブジェクトを作成します
stock = yf.Ticker(ticker)

# 最新の細かいデータを取得します（ここでは1分間隔のデータを5日分取得）
stock_data = stock.history(period='5d', interval='1m')

# 最新の株価とその日時を取得します
current_price = stock_data['Close'][-1]
current_datetime = stock_data.index[-1]

# データの日時を日本標準時（JST）に変換します
current_datetime_jst = current_datetime.tz_convert('Asia/Tokyo')

print(f"現在の {ticker} の株価: {current_price} USD")
print(f"データの日時（JST）: {current_datetime_jst}")
