WITH duplicates AS (
    SELECT 
        f.id,
        f.title,
        f.timestamp,
        t.feed_item_id IS NOT NULL as has_thread,
        ROW_NUMBER() OVER (PARTITION BY f.title, f.timestamp ORDER BY 
            t.feed_item_id IS NOT NULL DESC,
            f.timestamp ASC
        ) as rn
    FROM feed_items f
    LEFT JOIN threads t ON t.feed_item_id = f.id
    WHERE EXISTS (
        SELECT 1 
        FROM feed_items f2 
        WHERE f2.title = f.title 
        AND f2.timestamp = f.timestamp 
        AND f2.id != f.id
    )
)
DELETE FROM feed_items
WHERE id IN (
    SELECT id 
    FROM duplicates 
    WHERE rn > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_feed_items_title_timestamp ON feed_items(title, timestamp);
