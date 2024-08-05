-- データベース初期化時以外は実行されないので、適用は下記コマンドで
-- docker exec finance_postgres psql -U postgres -d my_finance_manager_db -f /docker-entrypoint-initdb.d/init.sql

CREATE TABLE IF NOT EXISTS ticker_urls (
    id SERIAL PRIMARY KEY,
    ticker_name VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL
);

-- キーバリュー形式でシステムで使う情報を保存するテーブル
CREATE TABLE IF NOT EXISTS system_info (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL
);

-- 証券取引所の情報を保存するテーブル
-- ID、取引所名、取引開始時間、取引終了時間
CREATE TABLE IF NOT EXISTS exchanges (
    id SERIAL PRIMARY KEY,
    exchange_name VARCHAR(255) NOT NULL,
    start_time TIME WITH TIME ZONE NOT NULL,
    end_time TIME WITH TIME ZONE NOT NULL
);

-- 銘柄情報を保存するテーブル
-- ID、銘柄名、銘柄コード、取引所ID
CREATE TABLE IF NOT EXISTS tickers (
    id SERIAL PRIMARY KEY,
    ticker_name VARCHAR(255) NOT NULL,
    ticker_code VARCHAR(255) NOT NULL,
    exchange_id INTEGER NOT NULL
);

-- 自分が所有している銘柄情報を保存するテーブル
-- ID、銘柄ID、購入価格、購入株数
CREATE TABLE IF NOT EXISTS my_tickers (
    id SERIAL PRIMARY KEY,
    ticker_id INTEGER NOT NULL,
    purchase_price INTEGER NOT NULL,
    purchase_quantity FLOAT NOT NULL
);

-- 銘柄情報、証券取引所情報をJOINしたビュー
CREATE OR REPLACE VIEW ticker_info AS (
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

-- 自分が所有している銘柄情報、銘柄情報をJOINしたビュー
CREATE OR REPLACE VIEW my_ticker_info AS (
    SELECT
        my_tickers.id AS id,
        tickers.ticker_name AS ticker_name,
        tickers.ticker_code AS ticker_code,
        exchanges.exchange_name AS exchange_name,
        my_tickers.purchase_price AS purchase_price,
        my_tickers.purchase_quantity AS purchase_quantity
    FROM
        my_tickers
        JOIN tickers 
            ON my_tickers.ticker_id = tickers.id
        JOIN exchanges 
            ON tickers.exchange_id = exchanges.id
);
