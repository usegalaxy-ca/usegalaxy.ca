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

output "ansible_volumes" {
    value = [
        for volume in var.volume_config: {
            instance_name = openstack_compute_instance_v2.instances[volume.attach_to].name
            volume_name = volume.name
            device = openstack_compute_volume_attach_v2.volumes[volume.name].device
        }
    ]
}



