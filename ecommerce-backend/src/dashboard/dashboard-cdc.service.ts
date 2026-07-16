import { Injectable, Logger } from '@nestjs/common';
import { CdcListenerService } from '@/common/services/cdc-listener.service';
import { CDC_CHANNELS } from '@/common/constants/app.constants';

@Injectable()
export class DashboardCdcService {
  private readonly logger = new Logger(DashboardCdcService.name);

  constructor(cdcListener: CdcListenerService) {
    cdcListener.register(CDC_CHANNELS.DASHBOARD_NOTES, (payload) => {
      this.logger.log(`CDC — ${payload.operation} on ${payload.table} (id=${payload.id})`);
    });
  }
}
