CREATE TABLE ticker_urls (
    id SERIAL PRIMARY KEY,
    ticker_name VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL
);

-- キーバリュー形式でシステムで使う情報を保存するテーブル
CREATE TABLE system_info (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL
);

-- 証券取引所の情報を保存するテーブル
-- ID、取引所名、取引開始時間、取引終了時間
CREATE TABLE exchanges (
    id SERIAL PRIMARY KEY,
    exchange_name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- 銘柄情報を保存するテーブル
-- ID、銘柄名、銘柄コード、取引所ID
CREATE TABLE tickers (
    id SERIAL PRIMARY KEY,
    ticker_name VARCHAR(255) NOT NULL,
    ticker_code VARCHAR(255) NOT NULL,
    exchange_id INTEGER NOT NULL
);

-- 銘柄情報、証券取引所情報をJOINしたビュー
CREATE VIEW ticker_info AS (
    SELECT
        tickers.id AS id,
        tickers.ticker_name AS ticker_name,
        tickers.ticker_code AS ticker_code,
        exchanges.exchange_name AS exchange_name
    FROM
        tickers
        JOIN exchanges 
            ON tickers.exchange_id = exchanges.id
);
