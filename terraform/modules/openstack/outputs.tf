
output "public_IP" {
  description = "Public IP address of the gateway instance"
  value       = openstack_compute_floatingip_associate_v2.fip_1.floating_ip
}

output "private_IPs" {
  for_each = local.instances_info
  description = "Private IP address of the ${each.key} instance"
  value       = openstack_compute_instance_v2.instances[each.key].access_ip_v4 
}
