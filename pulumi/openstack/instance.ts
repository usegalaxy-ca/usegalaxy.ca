import { compute } from '@pulumi/openstack';
import { CloudInit } from './cloudinit';
import { InstanceConfig } from './schema';
import { OpenStackProvider } from './provider';

export class Instance extends compute.Instance {
    constructor(instanceConfig: InstanceConfig, provider: OpenStackProvider) {
        const config = { ...instanceConfig, ...defaultInstanceConfig };

        const network = {
            uuid: config.network_uuid,
        };

        const bootDrive = {
            deleteOnTermination: true,
            destinationType: 'volume',
            sourceType: 'image',
            uuid: config.image_uuid,
            volumeSize: config.volume_size,
        };

        const cloudInit = new CloudInit('node').template();

        super(
            config.name,
            {
                imageName: config.image,
                flavorName: config.flavor,
                userData: cloudInit,
                blockDevices: [bootDrive],
                securityGroups: config.security_groups,
                networks: [network],
            },
            { provider: provider }
        );
    }
}

export const FLAVOR_CPU = {
    'p1-1gb': 1,
    'p1-2gb': 1,
    'p2-3.75gb': 2,
    'p4-7.5gb': 4,
    'p8-15gb': 8,
    'p4-15gb': 4,
    'c8-30gb': 8,
    'p8-30gb': 8,
    'p16-60gb': 16,
    'c16-60gb': 16,
    'c8-90gb': 8,
    'c16-90gb': 16,
    'c16-120gb': 16,
    'c32-240gb': 32,
} as const;

export type Flavor = keyof typeof FLAVOR_CPU;

// type InstanceConfig = {
//     name: string;
//     flavor: Flavor;
//     volume_size?: number;
//     image?: string;
//     image_uuid?: string;
//     network_uuid?: string;
//     security_groups?: string[];
//     count?: number;
// };

const defaultInstanceConfig = {
    volume_size: 30,
    image: 'Ubuntu-22.04.2-Jammy-x64-2023-02',
    image_uuid: 'db73980e-1f9c-441e-8268-c1881f99c8ef',
    network_uuid: '94db2a0a-14a4-4934-896d-a28bbc651b09',
    security_groups: ['default'],
    count: 1,
};
