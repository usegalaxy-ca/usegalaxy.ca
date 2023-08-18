import { z } from "zod";
import { Flavor, FLAVOR_CPU } from "./instance";

const count = z.number().int().positive().finite();
const size = z.number().int().positive().finite();
const ip = z.string().ip();
const uuid = z.string().uuid();
const identifier = z.string().min(1).trim();

//create zod enum from a const object
const flavors = Object.keys(FLAVOR_CPU) as Flavor[];
const FLAVORS: [Flavor, ...Flavor[]] = [flavors[0] as Flavor, ...flavors];
const flavor = z.enum(FLAVORS);

const instanceSchema = z
    .object({
        name: identifier,
        flavor: flavor,
        volume_size: size.optional(),
        image: identifier.optional(),
        image_uuid: uuid.optional(),
        networks_uuid: uuid.optional(),
        security_groups: identifier.array().optional(),
        count: count.optional(),
    })
    .strict();

export type InstanceConfig = z.infer<typeof instanceSchema>;

const volumeSchema = z
    .object({
        name: identifier,
        type: identifier,
        size: size,
        attach_to: identifier,
    })
    .strict();

const floatingIpSchema = z
    .object({
        ip: ip,
        attach_to: identifier,
    })
    .strict();

const clusterSchema = z.record(
    identifier,
    z.object({
        instances: z.array(instanceSchema),
        volumes: z.array(volumeSchema),
        floating_ips: z.array(floatingIpSchema),
    })
);

export type ClusterConfig = z.infer<typeof clusterSchema>;

export function validate(yaml: string): ClusterConfig {
    return clusterSchema.parse(yaml);
}
