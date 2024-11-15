// 该服务用于生成设备列表
import { Injectable } from '@angular/core';
import { deviceTypes } from '../../configs/devices.config';
import { HttpClient } from '@angular/common/http';
// import { Storage } from '@ionic/storage-angular';
import { DataService } from './data.service';
import { CONFIG } from 'src/app/configs/app.config';
import { API } from 'src/app/configs/api.config';
import { BehaviorSubject } from 'rxjs';
import { BlinkerDeviceConfig } from '../model/device-config.model';
import { BlinkerDevice } from '../model/device.model';

declare var window;

@Injectable({
  providedIn: 'root'
})
export class DeviceConfigService {

  get uuid() {
    return this.dataService.auth.uuid
  }

  get token() {
    return this.dataService.auth.token
  }

  get addDeviceList() {
    return (this.addDevDeviceList.concat(this.addLocalDeviceList)).concat(this.addPublicDeviceList)
  }

  _addPublicDeviceList = [];
  set addPublicDeviceList(list: any[]) {
    localStorage.setItem('addPublicDeviceList', JSON.stringify(list))
    this._addPublicDeviceList = list
  }

  get addPublicDeviceList(): any[] {
    return this._addPublicDeviceList
  }

  _addLocalDeviceList = [];
  set addLocalDeviceList(list: any[]) {
    localStorage.setItem('addLocalDeviceList', JSON.stringify(list))
    this._addLocalDeviceList = list
  }

  get addLocalDeviceList(): any[] {
    return this._addLocalDeviceList
  }

  _addDevDeviceList = [];
  set addDevDeviceList(list: any[]) {
    localStorage.setItem('addDevDeviceList', JSON.stringify(list))
    this._addDevDeviceList = list
  }

  get addDevDeviceList(): any[] {
    return this._addDevDeviceList
  }

  get deviceConfigs() {
    return Object.assign({}, this.publicDeviceConfig, this.localDeviceConfig);
  }

  _publicDeviceConfig = {};
  set publicDeviceConfig(config) {
    localStorage.setItem('publicDeviceConfig', JSON.stringify(config))
    this._publicDeviceConfig = config
  }

  get publicDeviceConfig() {
    return this._publicDeviceConfig
  }

  _localDeviceConfig = {};
  set localDeviceConfig(config) {
    localStorage.setItem('localDeviceConfig', JSON.stringify(config))
    this._localDeviceConfig = config
  }

  get localDeviceConfig() {
    return this._localDeviceConfig
  }

  _devDeviceConfig = {};
  set devDeviceConfig(config) {
    localStorage.setItem('devDeviceConfig', JSON.stringify(config))
    this._devDeviceConfig = config
  }

  get devDeviceConfig() {
    return this._devDeviceConfig
  }

  loaded = new BehaviorSubject(false);

  constructor(
    private http: HttpClient,
    private dataService: DataService,
    // private storage: Storage
  ) { }

  async init() {
    this.dataService.initCompleted.subscribe(async (state) => {
      if (state) {
        this._addDevDeviceList = JSON.parse(localStorage.getItem('addDevDeviceList'))
        this._addPublicDeviceList = JSON.parse(localStorage.getItem('addPublicDeviceList'))
        this._devDeviceConfig = JSON.parse(localStorage.getItem('devDeviceConfig'))
        this._publicDeviceConfig = JSON.parse(localStorage.getItem('publicDeviceConfig'))

        // this._addDevDeviceList = await this.storage.get('addDevDeviceList')
        // this._addPublicDeviceList = await this.storage.get('addPublicDeviceList')
        // this._devDeviceConfig = await this.storage.get('devDeviceConfig')
        // this._publicDeviceConfig = await this.storage.get('publicDeviceConfig')

        this.getLocalDeviceConfig();
        // await this.getPublicDeviceConfig();
        // await this.getDevDeviceConfig();
        this.loaded.next(true)
      }
    })
  }

  // // 获取开发中的设备
  // getDevDeviceConfig() {
  //   if (window.hasDevCenterModule)
  //     return this.http.get(API.DEVICE_CONFIG.DEV, {
  //       params: {
  //         uuid: this.uuid,
  //         token: this.token
  //       }
  //     })
  //       .toPromise()
  //       .then(response => {
  //         console.log(response);
  //         let data = JSON.parse(JSON.stringify(response));
  //         if (data.message == 1000) {
  //           this.devDeviceConfig = data.detail
  //           this.addDevDeviceList = this.pushAddDeviceList(this.devDeviceConfig, { isDev: true });
  //         }
  //       })
  //       .catch(this.handleError);
  // }

  // // 获取已发布的设备列表
  // getPublicDeviceConfig() {
  //   return this.http.get(API.DEVICE_CONFIG.PUBLIC, {
  //     params: {
  //       uuid: this.uuid,
  //       token: this.token
  //     }
  //   })
  //     .toPromise()
  //     .then(response => {
  //       console.log(response);
  //       let data = JSON.parse(JSON.stringify(response));
  //       if (data.message == 1000) {
  //         this.publicDeviceConfig = data.detail
  //         this.addPublicDeviceList = this.pushAddDeviceList(this.publicDeviceConfig);
  //       }
  //     })
  //     .catch(this.handleError);
  // }

  // 获取本地存储的设备列表
  async getLocalDeviceConfig() {
    if (CONFIG.BUILTIN_DEVICES.ENABLE) {
      this._addLocalDeviceList = JSON.parse(localStorage.getItem('addLocalDeviceList'))
      this._localDeviceConfig = JSON.parse(localStorage.getItem('localDeviceConfig'))
      this.localDeviceConfig = deviceTypes
      this.addLocalDeviceList = this.pushAddDeviceList(this.localDeviceConfig);
    }
  }

  pushAddDeviceList(deviceConfig, options = { isDev: false }) {
    let venders = []
    let addDeviceList = [];
    // if (options.isDev) console.log(deviceConfig);
    for (const key in deviceConfig) {
      let newDevice = {
        deviceType: deviceConfig[key].deviceType,
        name: deviceConfig[key].name,
        image: deviceConfig[key].image,
        isDev: options.isDev,
      }
      let venderIndex = venders.indexOf(options.isDev ? '开发中' : deviceConfig[key].vender);
      if (venderIndex > -1) {
        addDeviceList[venderIndex].devices.push(newDevice);
      } else {
        venders.push(options.isDev ? '开发中' : deviceConfig[key].vender)
        let newVender = {
          vendername: options.isDev ? '开发中' : deviceConfig[key].vender,
          // vendername: deviceConfig[key].vender,
          devices: [newDevice]
        }
        addDeviceList.push(newVender);
      }
    }
    return addDeviceList
  }

  getDeviceConfig(obj): BlinkerDeviceConfig {
    let device: BlinkerDevice;
    if (typeof obj == 'object') {
      device = obj;
    }
    else if (typeof obj == 'string') {
      device = this.dataService.device.dict[obj]
    }
    return device.config.isDev ? this.devDeviceConfig[device.deviceType] : this.deviceConfigs[device.deviceType];
  }

  private handleError(error: any): boolean {
    console.error('An error occurred', error);
    return false;
  }

}
