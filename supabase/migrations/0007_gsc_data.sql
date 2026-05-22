CREATE TABLE IF NOT EXISTS gsc_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    page TEXT NOT NULL,
    clicks INT DEFAULT 0,
    impressions INT DEFAULT 0,
    ctr DECIMAL(5,4) DEFAULT 0.0000,
    position DECIMAL(5,2) DEFAULT 0.00,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(query, page, date)
);

CREATE INDEX IF NOT EXISTS gsc_data_query_idx ON gsc_data(query);
CREATE INDEX IF NOT EXISTS gsc_data_date_idx ON gsc_data(date);
