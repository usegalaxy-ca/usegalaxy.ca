import { compute, blockstorage } from '@pulumi/openstack';
import { VolumeConfig } from './schema';
import { Provider } from './provider';

export class Volume extends blockstorage.Volume {
  public attachment: VolumeAttach;
  public config: VolumeConfig;

  constructor(
    config: VolumeConfig,
    instance: compute.Instance,
    provider: Provider
  ) {
    super(
      config.name,
      {
        volumeType: config.type,
        size: config.size,
      },
      { provider: provider }
    );
    this.attachment = new VolumeAttach(config.name, this, instance, provider);
    this.config = config;
  }
}

export class VolumeAttach extends compute.VolumeAttach {
  constructor(
    name: string,
    volume: blockstorage.Volume,
    instance: compute.Instance,
    provider: Provider
  ) {
    super(
      name,
      {
        volumeId: volume.id,
        instanceId: instance.id,
      },
      { provider: provider }
    );
  }
}

export const VOLUME_TYPE = {
  SSD: 'volumes-ssd',
  HDD: 'volumes-ec',
} as const;

export type VolumeType = keyof typeof VOLUME_TYPE;
