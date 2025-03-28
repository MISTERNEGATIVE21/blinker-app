import { Component, Input, ElementRef, ViewChild, Renderer2, Injectable } from '@angular/core';
import { Layouter2Widget } from '../config';
import { NativeService } from 'src/app/core/services/native.service';
import { Layouter2Service } from '../../layouter2.service';
import { convertToRgba } from 'src/app/core/functions/func';



@Component({
  selector: 'widget-button',
  templateUrl: 'widget-button.html',
  styleUrls: ['widget-button.scss']
})
export class WidgetButtonComponent implements Layouter2Widget {

  @Input() device;
  @Input() widget;

  get key() {
    return this.widget.key;
  }

  get t0() {
    return this.getValue(['tex', 't0', 'text'])
  }

  get t1() {
    return this.getValue(['tex1', 't1'])
  }

  get ico() {
    return this.getValue(['ico', 'icon'])
  }


  get color() {
    if (this.state == 'on') return '#FFF';
    return this.getValue(['clr', 'col', 'color'])
  }

  get backgroundColor() {
    if (this.state == 'on') return this.getValue(['clr', 'col', 'color'])
    return '#FFF'
  }

  get state() {
    this.device.data[this.key]
    if (typeof this.device.data[this.key] == 'string') {
      return this.device.data[this.key]
    }
    return this.getValue(['swi', 'switch'])
  }

  get mode() {
    return this.getValue(['mode'])
  }

  get custom() {
    return this.getValue(['cus', 'custom'])
  }

  getValue(valueKeys: string[]): any {
    for (let valueKey of valueKeys) {
      if (typeof this.device.data[this.key] != 'undefined')
        if (typeof this.device.data[this.key][valueKey] != 'undefined')
          return this.device.data[this.key][valueKey]
      if (typeof this.widget[valueKey] != 'undefined')
        return this.widget[valueKey]
    };
    return
  }

  pressed = false;

  @ViewChild("button", { read: ElementRef, static: true }) button: ElementRef;

  constructor(
    public render: Renderer2,
    private nativeService: NativeService,
    private LayouterService: Layouter2Service
  ) { }

  ngOnInit() {
    // console.log(JSON.stringify(this.widget));

  }

  ngAfterViewInit() {
    this.listenGesture();
  }

  ngOnDestroy() {
    this.unlistenGesture();
  }

  mouseupEvent;
  touchendEvent;
  listenGesture() {
    // 修复手指移动后无法触发pressup的问题
    this.mouseupEvent = this.render.listen(this.button.nativeElement, 'mouseup', e => this.pressup(e));
    this.touchendEvent = this.render.listen(this.button.nativeElement, 'touchend', e => this.pressup(e));
  }

  unlistenGesture() {
    this.mouseupEvent();
    this.touchendEvent();
  }

  press(event) {
    this.pressed = true;
    let data = `{"${this.key}":"press"}\n`;
    this.LayouterService.send(data + '\n')
    this.nativeService.vibrate();
  }

  pressup(event) {
    if (this.pressed) {
      this.pressed = false;
      let data = `{"${this.key}":"pressup"}\n`;
      this.LayouterService.send(data + '\n')
      this.nativeService.vibrate();
    }
  }

  tap(event) {
    let data;
    if (this.mode == 0) {
      data = `{"${this.key}":"tap"}`;
    } else if (this.mode == 1) {
      data = (this.state == 'on') ? `{"${this.key}":"off"}` : `{"${this.key}":"on"}`;
    } else if (this.mode == 2) {
      data = `{"${this.key}":"${this.custom}"}`;
    }
    this.LayouterService.send(data + '\n')
    this.nativeService.vibrate();
  }

}
