export interface SystemSettings {
  hospitalName: string;
  systemId: string;
}

export interface UserSettings {
  darkMode: boolean;
  language: string;
  notifyDiagnosis: boolean;
  notifySystem: boolean;
  notifyPatient: boolean;
  notifyPush: boolean;
  notifySecurity: boolean;
}
