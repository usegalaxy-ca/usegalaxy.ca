
output "public_ip" {
  description = "Public IP address of the gateway instance"
  value       = openstack_compute_floatingip_associate_v2.fip_1.floating_ip
}

output "galaxy_ip" {
  description = "Private IP address of the galaxy instance"
  value       = openstack_compute_instance_v2.galaxy.access_ip_v4 
}
