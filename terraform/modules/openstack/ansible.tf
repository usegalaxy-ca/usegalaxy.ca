output "ansible_hosts" {
    value =  {
        for group_name, instances in var.instance_config: 
            group_name => flatten([
                for instance in instances : [
                    for i in range(instance.count) :
                        openstack_compute_instance_v2.instances[instance.count==1?instance.name:"${instance.name}${i}"].name
                ]
            ])
    }
}

local {
    flavor_cpu =  {
        "p1-1gb": 1,
        "p1-2gb": 1,
        "p2-3.75gb": 2,
        "p4-7.5gb": 4,
        "p8-15gb": 8	,
        "p4-15gb": 4,
        "c8-30gb": 8,
        "p8-30gb": 8	,
        "p16-60gb": 16,
        "c16-60gb": 16,
        "c8-90gb": 8,
        "c16-90gb": 16,
        "c16-120gb": 16	,
        "c32-240gb": 32,
    }
}

output "ansible_slurm" {
    value = [
        for group_name, instance in var.flat_instance_config:
            group_name == "slurmexecservers" || group_name == "galaxyservers" ? [
                for i in range(instance.count) : {
                    name = instance.count==1 ? instance.name: "${instance.name}${i}"
                    cpu = local.flavor_cpu[instance.flavor]
                }] : []
    ]
}

output "ansible_volumes" {
    value = [
        for volume in var.volume_config: {
            instance_name = openstack_compute_instance_v2.instances[volume.attach_to].name
            volume_name = volume.name
            device = openstack_compute_volume_attach_v2.volumes[volume.name].device
        }
    ]
}
