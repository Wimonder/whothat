// Variable declarations
variable "project_id" {}
variable "services" {}

terraform {
  required_providers {
    google = {
        source  = "hashicorp/google"
        version = "~> 4.0.0"
    }
  }
}
resource "google_project_service" "services" {
  // Add the necessary services with a for each loop
  for_each = toset(var.services)
  service  = each.value

  disable_dependent_services = true
}

provider "google" {
  credentials = file("../credentials.json")
  project     = var.project_id
  region  = "europe-west3"
}

resource "google_compute_instance" "authserver" {
	name         = "authserver"
	machine_type = "f1-micro"
	zone         = "europe-west3-c"

	boot_disk {
		initialize_params {
			image = "ubuntu-os-cloud/ubuntu-2004-lts"
		}
	}

	network_interface {
		network = "default"

		access_config {
			// Include this section to give the VM an external ip address
		}
	}

	metadata = {
		ssh-keys = "ubuntu:${file("~/.ssh/id_rsa.pub")}"
	}

	provisioner "remote-exec" {
		inline = [
			"sudo apt update", "sudo apt install python3 -y", "echo Done!"
		]

		connection {
			host = self.network_interface[0].access_config[0].nat_ip
			type = "ssh"
			user = "ubuntu"
			private_key = file("~/.ssh/id_rsa")
		}
	}

	provisioner "local-exec" {
		command = "ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -u ubuntu -i '${google_compute_instance.authserver.network_interface[0].access_config[0].nat_ip},' authserver.yaml"
		environment = {
			MYSQL_HOST = google_sql_database_instance.master.ip_address.0.ip_address
			MYSQL_USER = "ubuntu"
			MYSQL_PASSWORD = nonsensitive(random_password.mysql_password.result)
			DATABASE_URL = "mysql://ubuntu:nonsensitive(random_password.mysql_password.result)@${google_sql_database_instance.master.ip_address.0.ip_address}/whothat"
		}
	}
}

resource "random_password" "mysql_password" {
	length = 16
	special = false
}

output "db_password" {
	value = random_password.mysql_password.result
	sensitive = true
}

resource "google_sql_database_instance" "master" {
	name             = "master"
	database_version = "MYSQL_8_0"
	region           = "europe-west3"

	settings {
		tier = "db-f1-micro"
		activation_policy = "ALWAYS"
		ip_configuration {
			ipv4_enabled = true
			authorized_networks {
				value = "0.0.0.0/0"
				name = "all"
			}
		}
	}
}

resource "google_sql_user" "db_user" {
	name = "db-user"
	instance = google_sql_database_instance.master.name
	host = "%"
	password = random_password.mysql_password.result
}

resource "google_sql_database" "auth_db" {
	name = "auth-db"
	instance = google_sql_database_instance.master.name
}

output "db_address" {
	value = google_sql_database_instance.master.public_ip_address
}

output "webserver_address" {
	value = google_compute_instance.authserver.network_interface[0].access_config[0].nat_ip
}
