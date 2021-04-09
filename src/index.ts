import { API } from 'homebridge';

import { ACCESSORY_NAME } from './settings';
import { GpioValveAccessory } from './accessory';

/**
 * This method registers the accessory with Homebridge
 */
export = (api: API) => {
  api.registerAccessory(ACCESSORY_NAME, GpioValveAccessory)
};
