import { Storage } from './Storage';

export class DeviceService {
  static isInApp: boolean | null = Storage.getItem('isInApp');

  static setIsInApp(status: boolean) {
    Storage.setItem('isInApp', status);
    DeviceService.isInApp = status;
  }
}
