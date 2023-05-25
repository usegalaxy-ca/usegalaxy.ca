output "public_IP" {
  description = "Public IP address of the gateway instance"
  value       = { for floating_ip in var.ip_config: floating_ip.attach_to => openstack_compute_floatingip_associate_v2.floating_ips[floating_ip.ip].floating_ip }
}

output "private_IPs" {
  description = "Private IP address of each instance"
  value       = {
      for instance in local.flat_instance_config: instance.name => openstack_compute_instance_v2.instances[instance.name].access_ip_v4
  }
}
