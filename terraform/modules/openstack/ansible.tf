output "ansible_hosts" {
    value =  {
        for group_name, instances in local.instance_config: 
            group_name => [for instance in instances : openstack_compute_instance_v2.instances[instance.name].name]
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



