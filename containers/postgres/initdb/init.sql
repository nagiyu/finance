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
