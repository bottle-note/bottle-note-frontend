import { Storage } from './Storage';

export class DeviceService {
  static isInApp: boolean | null = Storage.getItem('isInApp');

  static deviceToken: string | null = Storage.getItem('deviceToken');

  static platform: string | null = Storage.getItem('platform');

  static setIsInApp(status: boolean) {
    Storage.setItem('isInApp', status);
    DeviceService.isInApp = status;
  }

  static setDeviceToken(token: string) {
    Storage.setItem('deviceToken', token);
    DeviceService.deviceToken = token;
  }

  static setPlatform(platform: string) {
    Storage.setItem('platform', platform);
    DeviceService.platform = platform;
  }
}
