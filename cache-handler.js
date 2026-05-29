const cache = new Map();

module.exports = class MemoryCacheHandler {
  constructor() {}

  async get(key) {
    return cache.get(key) ?? null;
  }

  async set(key, data) {
    cache.set(key, data);
  }

  async revalidateTag(tag) {}

  async resetRequestCache() {}
};
