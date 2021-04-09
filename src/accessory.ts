import {AccessoryConfig, AccessoryPlugin, API, Logging, Service} from "homebridge";

export class GpioValveAccessory implements AccessoryPlugin {

    private readonly log: Logging;
    private readonly api: API;

    private readonly name: string;
    private config: AccessoryConfig;
    private readonly sprinklerService: Service;


    constructor(log: Logging, config: AccessoryConfig, api: API) {
        this.log = log;
        this.name = config.name;
        this.config = config;
        this.api = api;

        this.sprinklerService = new api.hap.Service.Valve(this.name);
        this.bindCharacteristics();

        this.log.info("Sprinkler '%s' finished initializing!", this.name);
    }

    getServices(): Service[] {
        return [this.sprinklerService];
    }

    identify(): void {
        this.log.info("Sprinkler %s identify!", this.name);
        // here the valve shoud be opened for few seconds
    }

    private bindCharacteristics() {
        this.sprinklerService.getCharacteristic(this.api.hap.Characteristic.Active)
            .onGet(this.handleActiveGet.bind(this))
            .onSet(this.handleActiveSet.bind(this));

        this.sprinklerService.getCharacteristic(this.api.hap.Characteristic.InUse)
            .onGet(this.handleInUseGet.bind(this));

        this.sprinklerService.getCharacteristic(this.api.hap.Characteristic.ValveType)
            .onGet(this.handleValveTypeGet.bind(this));
    }

    handleActiveGet() {
        this.log.debug('Triggered GET Active');

        // set this to a valid value for Active
        const currentValue = this.api.hap.Characteristic.Active.INACTIVE;

        return currentValue;
    }

    handleActiveSet(value) {
        this.log.debug('Triggered SET Active:' + value);
    }

    handleInUseGet() {
        this.log.debug('Triggered GET InUse');

        // set this to a valid value for InUse
        const currentValue = this.api.hap.Characteristic.InUse.NOT_IN_USE;

        return currentValue;
    }

    handleValveTypeGet() {
        this.log.debug('Triggered GET ValveType');

        switch (this.config.type) {
            case "IRRIGATION":
                this.log.debug('Triggered GET ValveType return IRRIGATION');
                return this.api.hap.Characteristic.ValveType.IRRIGATION;
            case "SHOWER_HEAD":
                this.log.debug('Triggered GET ValveType return SHOWER_HEAD');
                return this.api.hap.Characteristic.ValveType.SHOWER_HEAD;
            case "WATER_FAUCET":
                this.log.debug('Triggered GET ValveType return WATER_FAUCET');
                return this.api.hap.Characteristic.ValveType.WATER_FAUCET;
            case "GENERIC_VALVE":
            default:
                this.log.debug('Triggered GET ValveType return GENERIC_VALVE');
                return this.api.hap.Characteristic.ValveType.GENERIC_VALVE;
        }
    }
}