import check_price

def main():
    for ticker_id in [4, 10, 14, 16, 18, 19]:
        if (check_price.check_latest_2_price(ticker_id) != True):
            print("Price has changed")
        check_price.check_price_trend(ticker_id)
        check_price.check_price_trend_down(ticker_id)

        check_price.check_max_min_price(ticker_id)

if __name__ == "__main__":
    main()
