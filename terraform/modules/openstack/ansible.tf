output "ansible_hosts" {
    value =  {
        for instance in local.flat_instance_config: 
            instance.name => openstack_compute_instance_v2.instances[instance.name].name
    }
}

output "ansible_volumes" {
    value = [
        for volume in var.volume_info: {
            instance_name = openstack_compute_instance_v2.instances[volume.attach_to].name
            volume_name = volume.name
            device = openstack_compute_volume_attach_v2.volumes[volume.name].device
        }
    ]
}



