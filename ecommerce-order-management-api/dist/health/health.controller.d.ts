import { DataSource } from 'typeorm';
export declare class HealthController {
    private readonly dataSource;
    private readonly version;
    constructor(dataSource: DataSource, version: string);
    checkLive(): {
        status: string;
        version: string;
        uptime: any;
    };
    live(): {
        status: string;
        version: string;
        uptime: any;
    };
    ready(): Promise<{
        status: string;
        version: string;
        uptime: any;
        checks: {
            database: string;
        };
    }>;
}
