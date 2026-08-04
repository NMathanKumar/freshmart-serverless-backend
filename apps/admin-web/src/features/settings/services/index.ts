import { settingsService as realSettingsService } from './settings.service';

export const settingsService = {
  async getAll() {
    const data = await realSettingsService.getSettings();
    return [data];
  }
};
