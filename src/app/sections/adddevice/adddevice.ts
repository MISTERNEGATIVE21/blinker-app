﻿import { Component } from '@angular/core';
import { DeviceConfigService } from 'src/app/core/services/device-config.service';
import { Router } from '@angular/router';
import { AdddeviceService } from './adddevice.service';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'page-adddevice',
  templateUrl: 'adddevice.html',
  styleUrls: ['adddevice.scss'],
})
export class AddDevicePage {
  searchQuery: string = '';

  _items;
  get items() {
    if (typeof this._items == 'undefined')
      return this.deviceConfigService.addDeviceList
    return this._items;
  }
  set items(items) {
    this._items = items;
  }

  get isAdvancedDeveloper() {
    return this.dataService.isAdvancedDeveloper
  }

  constructor(
    private deviceConfigService: DeviceConfigService,
    private router: Router,
    private addservice: AdddeviceService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    let temp = localStorage.getItem('addDevicePage:showMode')
    if (temp != null) {
      this.showMode = temp
    } else {
      this.showMode = 'list'
    }
  }

  ngAfterViewInit(): void {
    // this.deviceConfigService.loaded.subscribe(loaded => {
    //   if (loaded) console.log(this.items);
    // })
  }

  getItems(e: any) {
    this.items = this.deviceConfigService.addDeviceList
    let items2 = [];
    let val = e.target.value;
    if (val && val.trim() != '') {
      this.items.filter((item) => {
        let itemVendername = item.vendername;
        let itemDevices = item.devices.filter((device) => {
          return (device.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
        });
        if (itemDevices.length > 0) {
          let result = {
            vendername: itemVendername,
            devices: itemDevices
          }
          items2.push(result);
        }
      });
      this.items = items2;
    }
  }

  isShowSearchbar = false;
  switchSearchbar() {
    this.isShowSearchbar = !this.isShowSearchbar;
  }

  scanQrcode() {
    this.router.navigate(['/adddevice/qrscanner'])
  }

  gotoGuide(device) {
    this.addservice.isDev = device.isDev
    this.router.navigate(['/adddevice', device.deviceType])
  }

  showMode = 'list'
  switchShowMode() {
    this.showMode = this.showMode == 'list' ? 'block' : 'list';
    localStorage.setItem('addDevicePage:showMode', this.showMode)
  }

}
