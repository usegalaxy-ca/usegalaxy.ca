variable "instance_config" {
    type = map(list(object({
        name = string
        flavor = string
        volume_size = optional(number, 30)
        volume_type = optional(string, null)
        image = optional(string, "Ubuntu-22.04.2-Jammy-x64-2023-02")
        image_uuid = optional(string, "db73980e-1f9c-441e-8268-c1881f99c8ef")
        network_uuid = optional(string, "94db2a0a-14a4-4934-896d-a28bbc651b09")
        security_groups = optional(list(string), ["default"])
        count = optional(number, 1)
    })))
}

variable "ip_config" {
    type = list(object({
        ip = string
        attach_to = string
    }))
}

variable "volume_config" {
    type = map(list(object({
        name = string
        type = string
        fstype = optional(string, "ext4")
        size = number
    })))
}
 
locals {
    flat_instance_config = flatten([
      for group_name, instances in var.instance_config : [
        for instance in instances : [
          for i in range(instance.count) : {
            name = instance.count==1 ? instance.name: "${instance.name}${i}"
            flavor = instance.flavor
            volume_size = instance.volume_size
            volume_type = instance.volume_type
            image = instance.image
            image_uuid = instance.image_uuid
            network_uuid = instance.network_uuid
            security_groups = instance.security_groups
            group_name = group_name
        }
      ]
    ]
  ])
}

variable "openstack" {
    type = object({
        auth_url = string
        region = string
    })
    default = {
        auth_url = "https://beluga.cloud.computecanada.ca:5000/v3"
        region = "RegionOne"
    }
}

variable "INSTANCE_NAME_PREFIX" {
  type    = string
}

variable "USERNAME" {
  type    = string
}

variable "CLUSTER_NAME" {
  type    = string
}

variable "PUBLIC_KEY" {
  type    = string
}

variable "project_name" {
  type    = string
}
