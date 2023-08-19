/*
    * This file contains the schema for the cluster configuration file.
    * It is used to validate the configuration file and to provide
    * type information to the rest of the codebase.

######## sample cluster.yaml file ########

cluster_name:
  instances:
    servergroup_name:
      - name: instance_name
        flavor: flavor_name
        volume_size: 10
    servergroup_name2:
      - name: instance_name2
        flavor: flavor_name
        volume_size: 10
  volumes:
    - name: volume_name
      type: "volumes-ssd"
      size: 10
      attach_to: instance_name
  floating_ips:
    - ip: 192.234.212.111
      attach_to: instance_name
*/

import { z } from 'zod';
import { flavors } from './instance';
import { VOLUME_TYPE } from './volume';

const count = z.number().int().positive().finite();
const size = z.number().int().positive().finite();
const ip = z.string().ip();
const uuid = z.string().uuid();
const identifier = z.string().min(1).trim();
const flavor = z.enum(flavors);
const volumeType = z.nativeEnum(VOLUME_TYPE);

const instanceSchema = z
  .object({
    name: identifier,
    flavor: flavor,
    volume_size: size.optional(),
    image: identifier.optional(),
    image_uuid: uuid.optional(),
    network_uuid: uuid.optional(),
    security_groups: identifier.array().optional(),
    count: count.optional(),
  })
  .strict();
export type InstanceConfig = z.infer<typeof instanceSchema>;

const volumeSchema = z
  .object({
    name: identifier,
    type: volumeType,
    size: size,
    attach_to: identifier,
  })
  .strict();
export type VolumeConfig = z.infer<typeof volumeSchema>;

const floatingIpSchema = z
  .object({
    ip: ip,
    attach_to: identifier,
  })
  .strict();
export type FloatingIpConfig = z.infer<typeof floatingIpSchema>;

const clusterSchema = z.record(
  identifier,
  z.object({
    instances: z.record(identifier, instanceSchema.array()),
    volumes: z.array(volumeSchema),
    floating_ips: z.array(floatingIpSchema),
  })
);
export type ClusterConfig = z.infer<typeof clusterSchema>;

export function validate(yaml: string): ClusterConfig {
  return clusterSchema.parse(yaml);
}
