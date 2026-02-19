# Install Docker Engine

Run the following command to uninstall all conflicting packages:

```bash
sudo apt remove $(dpkg --get-selections docker.io docker-compose docker-compose-v2 docker-doc podman-docker containerd runc | cut -f1)
```

## Install using the apt repository

1. Set up Docker's apt repository.

```bash
# Add Docker's official GPG key:
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
```

2. Install the Docker packages.
```bash
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

The Docker service starts automatically after installation. To verify that Docker is running, use:

```bash
sudo systemctl status docker    
```

3. Verify that the installation is successful by running the hello-world image:

```bash
sudo docker run hello-world
```

add user to docker, so you don't have to use sudo anymore

```bash
sudo usermod -aG docker $USER
```

neues terminal öffnen:

```bash
newgrp docker
```


try:

```bash
docker run hello-world
```

bei änderungen vom code oder komplett ausetzens: 

```bash
docker compose up --build
```

Wenn ihr nur neu starten wollt:

```
docker compose down
docker compose up -d
```

kompletter reset:

```bash
docker compose down -v
```