variable "instances_info" {
    type = map(object({
        flavor = string
        volume_size = optional(number, 30)
        image = optional(string, "Ubuntu-22.04.2-Jammy-x64-2023-02")
        image_uuid = optional(string, "db73980e-1f9c-441e-8268-c1881f99c8ef")
        network_uuid = optional(string, "94db2a0a-14a4-4934-896d-a28bbc651b09")
        security_groups = optional(list(string), ["default"])
    }))
}

variable "INSTANCE_NAME_PREFIX" {
  type    = string
}

variable "PUBLIC_IP" {
  type    = string
}

variable "USERNAME" {
  type    = string
}

variable "PUBLIC_KEY" {
  type    = string
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

variable "project_name" {
  type    = string
}

variable "gateway_name" {
  type    = string
}
