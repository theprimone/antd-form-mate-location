import React, { Component } from 'react';
import { Input, Modal } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import AMap, { ErrorType } from '../CustomAMap';
import { Position } from '../CustomAMap/Props';
import styles from './index.less';

export type Value = {
  position: Position | undefined;
  formattedAddress: string;
};

export interface LocationPickerProps {
  value?: Value;
  onChange?: (value: Value) => void;
  onError?: (type: ErrorType, value: any) => void;
  placeholder?: string;
  modalTitle?: string;
}

export interface LocationPickerState {
  mapVisible: boolean;
  position: Position | undefined;
  formattedAddress: undefined | string;
  isMounted: boolean;
}

export default class LocationPicker extends Component<LocationPickerProps, LocationPickerState> {
  map: any;

  state = {
    mapVisible: false,
    position: undefined,
    formattedAddress: '',
    isMounted: false,
  };

  componentDidMount() {
    this.setState({
      isMounted: true,
    });
  }

  handleMapCreated = (map) => {
    console.log('amap is created.');
    if (map) this.map = map;
  };

  handleMapClick = (lng, lat) => {
    console.log('handleMapClick', lng, lat);
    this.setState({
      position: { lng, lat },
    });
  };

  handleMapOk = () => {
    const { onChange } = this.props;
    const { position, formattedAddress } = this.state;
    if (onChange) {
      onChange({
        position,
        formattedAddress,
      });
    }
    this.setState({
      mapVisible: false,
    });
  };

  handleAfterMapClose = () => {
    this.setState({
      position: undefined,
      formattedAddress: undefined,
    });
    if (this.map) {
      this.map.clearMap();
    }
  };

  handleInputChange = (event) => {
    const { onChange } = this.props;
    if (onChange && event.target.value === '') {
      onChange({} as Value);
    }
  };

  render() {
    const { value = {} as Value, onChange, onError, placeholder, modalTitle, ...rest } = this.props;
    const { mapVisible, position, isMounted, formattedAddress } = this.state;
    const { formattedAddress: inputFormattedAddress, position: inputPosition } = value;

    let map: any = (
      <AMap
        position={position || inputPosition}
        formattedAddress={formattedAddress || inputFormattedAddress}
        onCreated={this.handleMapCreated}
        onClick={this.handleMapClick}
        getFormattedAddress={(address, info) => {
          console.log(info);
          if (!address) {
            this.setState({
              formattedAddress: '',
            });
            return;
          }
          this.setState({ formattedAddress: address });
        }}
        onError={onError}
      />
    );
    if (!isMounted) map = null;

    return (
      <>
        <Input
          placeholder={placeholder || '请选择地址'}
          {...rest}
          className={styles.input}
          onChange={this.handleInputChange}
          value={inputFormattedAddress}
          onClick={() => this.setState({ mapVisible: true })}
          unselectable="on"
          readOnly
          suffix={<EnvironmentOutlined onClick={() => this.setState({ mapVisible: true })} />}
        />
        <Modal
          title={modalTitle || '高德地图'}
          width={800}
          visible={mapVisible}
          onCancel={() => this.setState({ mapVisible: false })}
          onOk={this.handleMapOk}
          afterClose={this.handleAfterMapClose}
        >
          {map}
        </Modal>
      </>
    );
  }
}
