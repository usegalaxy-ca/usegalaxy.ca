
locals {
    flavor_cpu =  {
        "p1-1gb": 1,
        "p1-2gb": 1,
        "p2-3.75gb": 2,
        "p4-7.5gb": 4,
        "p8-15gb": 8,
        "p4-15gb": 4,
        "c8-30gb": 8,
        "p8-30gb": 8,
        "p16-60gb": 16,
        "c16-60gb": 16,
        "c8-90gb": 8,
        "c16-90gb": 16,
        "c16-120gb": 16	,
        "c32-240gb": 32,
    }
}

locals {
    flavor_mem =  {
        "p1-1gb": 1000,
        "p1-2gb": 2000,
        "p2-3.75gb": 3750,
        "p4-7.5gb": 7500,
        "p8-15gb": 14000,
        "p4-15gb": 14000,
        "c8-30gb": 30000,
        "p8-30gb": 30000,
        "p16-60gb": 60000,
        "c16-60gb": 60000,
        "c8-90gb": 90000,
        "c16-90gb": 90000,
        "c16-120gb": 120000,
        "c32-240gb": 240000,
    }
}

locals{
    fstype = {
        "btrfs": "btrfs",
        "ext2": "ext2",
        "ext3": "ext3",
        "ext4": "ext4",
        "xfs": "xfs",
        "zfs": "zfs",
    }
}

# example of output
# {
#   "vmservers" = [
#     {
#       "name" = "vm1"
#       "cpu" = 1
#       "mem" = 1000
#     },
#     {
#       "name" = "vm2"
#       "cpu" = 1
#       "mem" = 1000
#     }
#   ],
#   "otherservers" = [
#     {
#       "name" = "other"
#       "cpu" = 1
#       "mem" = 1000
#     }
#   ]
# }
output "ansible_hosts" {
    value =  {
        for group_name, instances in var.instance_config: 
            group_name => flatten([
                for instance in instances : [
                    for i in range(instance.count) : {
                        name = openstack_compute_instance_v2.instances[instance.count==1?instance.name:"${instance.name}${i}"].name
                        cpu = local.flavor_cpu[instance.flavor]
                        mem = local.flavor_mem[instance.flavor]
                    }
                ]
            ])
    }
}

# example of output
# {
#   "vm1" = [
#     {
#       "volume_name" = "vm1-volume1"
#       "device" = "/dev/vdb"
#       "fstype" = "ext4"
#     },
#     {
#       "volume_name" = "vm1-volume2"
#       "device" = "/dev/vdc"
#       "fstype" = "ext4"
#     }
#   ],
#   "vm2" = [
#     {
#       "volume_name" = "vm2-volume1"
#       "device" = "/dev/vdb"
#       "fstype" = "ext4"
#     }
#   ]
# }
output "ansible_volumes" {
    value = {
        for instance_name, volumes in var.volume_config : 
            openstack_compute_instance_v2.instances[instance_name].name => [
                for volume in volumes :
                {
                    volume_name = volume.name
                    device = openstack_compute_volume_attach_v2.volumes[volume.name].device
                    fstype = local.fstype[volume.fstype]
                }
            ]
    }
}

