import { InfoMap, InfoTypes } from '../interfaces/info';

export class Info {
  static infoTypes: Set<InfoTypes> = new Set<InfoTypes>([
    InfoTypes.CurrentTime
  ]);

  static getCurrentTime(): InfoMap {
    return {
      id   : InfoTypes.CurrentTime,
      value: new Date().toISOString()
    };
  }
}
