import { compute, blockstorage } from "@pulumi/openstack";

export class Volume extends blockstorage.Volume {
  constructor(name: string, size: number, volumeType: VolumeType) {
    super(name, {
      volumeType: volumeType,
      size: size,
    });
  }
}

export class VolumeAttach extends compute.VolumeAttach {
  constructor(
    name: string,
    volume: blockstorage.Volume,
    instance: compute.Instance
  ) {
    super(name, {
      volumeId: volume.id,
      instanceId: instance.id,
    });
  }
}

export const VOLUME_TYPE = {
  SSD: "volumes-ssd",
  HDD: "volumes-ec",
} as const;

export type VolumeType = keyof typeof VOLUME_TYPE;
