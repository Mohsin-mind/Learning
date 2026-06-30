"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const typeorm_1 = require("typeorm");
loadEnvFile();
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: getEnv('DB_HOST'),
    port: Number(process.env.DB_PORT ?? 5432),
    username: getEnv('DB_USERNAME'),
    password: getEnv('DB_PASSWORD'),
    database: getEnv('DB_DATABASE'),
    entities: [(0, node_path_1.resolve)(__dirname, '../**/*.entity{.ts,.js}')],
    migrations: [(0, node_path_1.resolve)(__dirname, 'migrations/*{.ts,.js}')],
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
});
function loadEnvFile() {
    const envPath = (0, node_path_1.resolve)(process.cwd(), '.env');
    if (!(0, node_fs_1.existsSync)(envPath)) {
        return;
    }
    const env = (0, node_fs_1.readFileSync)(envPath, 'utf8');
    for (const line of env.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
            continue;
        }
        const [key, ...valueParts] = trimmed.split('=');
        if (!key || process.env[key] !== undefined) {
            continue;
        }
        process.env[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
    }
}
function getEnv(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
}
exports.default = AppDataSource;
//# sourceMappingURL=data-source.js.map