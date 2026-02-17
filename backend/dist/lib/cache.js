class SimpleCache {
    cache = new Map();
    set(key, data, ttlMs = 60000) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttlMs
        });
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    invalidate(key) {
        this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
}
export const dashboardCache = new SimpleCache();
