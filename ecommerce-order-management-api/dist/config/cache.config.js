"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheConfig = void 0;
const config_1 = require("@nestjs/config");
exports.cacheConfig = (0, config_1.registerAs)('cache', () => ({
    ttl: process.env.CACHE_TTL ? Number(process.env.CACHE_TTL) : 60_000,
    max: process.env.CACHE_MAX ? Number(process.env.CACHE_MAX) : 100,
    store: process.env.NODE_ENV === 'production' ? 'redis' : 'memory',
}));
//# sourceMappingURL=cache.config.js.map