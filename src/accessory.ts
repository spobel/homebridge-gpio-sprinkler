import {AccessoryConfig, AccessoryPlugin, API, Logging, Service} from 'homebridge';
import {CharacteristicGetCallback, CharacteristicGetHandler} from 'hap-nodejs/dist/lib/Characteristic';

export class GpioValveAccessory implements AccessoryPlugin {

  private readonly log: Logging;
  private readonly api: API;

  private readonly name: string;
  private config: AccessoryConfig;
  private readonly sprinklerService: Service;
  private time : Time | null = null;

  constructor(log: Logging, config: AccessoryConfig, api: API) {
    this.log = log;
    this.name = config.name;
    this.config = config;
    this.api = api;


    this.sprinklerService = new api.hap.Service.Valve(this.name);
    this.bindCharacteristics();

    this.log.info('Sprinkler \'%s\' finished initializing!', this.name);
  }

  getServices(): Service[] {
    return [this.sprinklerService];
  }

  identify(): void {
    this.log.info('Sprinkler %s identify!', this.name);
    // here the valve shoud be opened for few seconds
  }

  private bindCharacteristics() {
    this.sprinklerService.getCharacteristic(this.api.hap.Characteristic.Active)
      .onSet(this.handleActiveSet.bind(this));

    this.sprinklerService.getCharacteristic(this.api.hap.Characteristic.ValveType)
      .onGet(this.handleValveTypeGet.bind(this));

    this.sprinklerService.getCharacteristic(this.api.hap.Characteristic.RemainingDuration)
      .on('get', this.handleGetRemainingDuration.bind(this));
  }

  handleActiveSet(value) {
    this.log.debug('Triggered SET Active:' + value);
    if (value === this.api.hap.Characteristic.Active.ACTIVE) {
      this.activate();
    } else {
      this.stop();
    }
  }

  activate() {
    this.time = new Time(1200);
    this.sprinklerService.getCharacteristic(this.api.hap.Characteristic.RemainingDuration).updateValue(1200);
    this.sprinklerService.getCharacteristic(this.api.hap.Characteristic.InUse).updateValue(this.api.hap.Characteristic.InUse.IN_USE);

    this.log.debug('Start');
  }

  stop() {
    this.sprinklerService.getCharacteristic(this.api.hap.Characteristic.InUse).updateValue(this.api.hap.Characteristic.InUse.NOT_IN_USE);
    this.log.debug('Stop');
  }

  handleGetRemainingDuration(callback: CharacteristicGetCallback) {
    if (this.time === null) {
      callback(null, 0);
    } else {
      this.log.debug('remaining' + this.time.remainingTime());
      callback(null, this.time.remainingTime());
    }
  }

  handleValveTypeGet() {
    this.log.debug('Triggered GET ValveType');

    switch (this.config.type) {
      case 'IRRIGATION':
        this.log.debug('Triggered GET ValveType return IRRIGATION');
        return this.api.hap.Characteristic.ValveType.IRRIGATION;
      case 'SHOWER_HEAD':
        this.log.debug('Triggered GET ValveType return SHOWER_HEAD');
        return this.api.hap.Characteristic.ValveType.SHOWER_HEAD;
      case 'WATER_FAUCET':
        this.log.debug('Triggered GET ValveType return WATER_FAUCET');
        return this.api.hap.Characteristic.ValveType.WATER_FAUCET;
      case 'GENERIC_VALVE':
      default:
        this.log.debug('Triggered GET ValveType return GENERIC_VALVE');
        return this.api.hap.Characteristic.ValveType.GENERIC_VALVE;
    }
  }
}

class Time {

  private readonly startTime = new Date();
  private readonly stopTime;
  private readonly duration: number;

  constructor(duration: number) {
    this.duration = duration;
    this.stopTime = new Date(this.startTime.getTime() + duration * 1000);
  }

  remainingTime() {
    return Math.round((this.stopTime.getTime() - new Date().getTime() ) / 1000);
  }

}