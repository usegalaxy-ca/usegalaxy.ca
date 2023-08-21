import { compute, blockstorage } from '@pulumi/openstack';
import { VolumeConfig } from './schema';
import { Provider } from './provider';
import { getResourceName } from './utils';

export class Volume extends blockstorage.Volume {
  public attachment: compute.VolumeAttach;
  public config: VolumeConfig;

  constructor(
    config: VolumeConfig,
    instance: compute.Instance,
    provider: Provider
  ) {
    super(
      getResourceName(config.name),
      {
        volumeType: config.type,
        size: config.size,
      },
      { provider: provider }
    );
    this.attachment = new compute.VolumeAttach(
      config.name,
      { volumeId: this.id, instanceId: instance.id },
      { provider: provider }
    );
    this.config = config;
  }
}

export const VOLUME_TYPE = {
  SSD: 'volumes-ssd',
  HDD: 'volumes-ec',
} as const;

export type VolumeType = keyof typeof VOLUME_TYPE;
