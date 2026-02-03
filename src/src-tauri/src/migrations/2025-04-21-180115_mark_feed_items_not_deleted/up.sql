UPDATE feed_items SET deleted = 0 WHERE timestamp > (UNIXEPOCH() - (86400)) * 1000;
