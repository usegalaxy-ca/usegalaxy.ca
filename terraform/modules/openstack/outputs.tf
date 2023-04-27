
output "public_IP" {
  description = "Public IP address of the gateway instance"
  value       = openstack_compute_floatingip_associate_v2.fip_1.floating_ip
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
