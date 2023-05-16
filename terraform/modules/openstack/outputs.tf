
output "public_IP" {
  description = "Public IP address of the gateway instance"
  value       = { for floating_ip in var.floating_ips: floating_ip.attach_to => openstack_compute_floatingip_associate_v2.floating_ips[floating_ip.ip].floating_ip }
}

output "private_IPs" {
  description = "Private IP address of each instance"
  value       = {
      for name, instance_info in var.instances_info: name => openstack_compute_instance_v2.instances[name].access_ip_v4
  }
}

output "instance_names" {
    description = "Names of each instance"
    value       = {
        for name, instance_info in var.instances_info: name => openstack_compute_instance_v2.instances[name].name
    }
}

output "volumes_info" {
    description = "Information about each volume"
    value       = [
        for name, volume_info in var.volumes: {
            instance_name = openstack_compute_instance_v2.instances[volume_info.attach_to].name
            volume_name = name
            device = openstack_compute_volume_attach_v2.volumes[name].device
        }
    ]
}
