import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  it('should send email notification', () => {
    const service = new NotificationsService({
      provider: 'email',
      apiKey: 'test-key',
      from: 'test@example.com',
    });

    const result = service.send('user@example.com', 'Welcome', 'Hello!');
    expect(result).toBe(
      '[EMAIL] Notification sent to user@example.com from test@example.com: Welcome — Hello!',
    );
  });

  it('should send SMS notification with default sender', () => {
    const service = new NotificationsService({
      provider: 'sms',
      apiKey: 'test-key',
    });

    const result = service.send('+1234567890', 'Alert', 'Test');
    expect(result).toContain('[SMS]');
    expect(result).toContain('from system');
  });
});
