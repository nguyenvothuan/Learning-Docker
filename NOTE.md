# Docker
## Chapter 1: Quick Start
## Chapter 2: Course Introduction
## Chapter 3: Setup Docker
## Chapter 4: Containers
### The Basics
1. Docker command format:  
- New "management commands" format: `docker <command> <sub-command> (options)`
- Old way (still works): docker `docker <command> (options)`
2. Info command:
- `docker version`
- `docker info`
3. Image vs Container
- An image is the application we want to run
- A container is an instance of that image running as a process
- An image can have multiple running container
- Docker's default image "registry" is called Docker Hub (hub.docker.com), something similar to github for code repository
4. `docker container run --publish 81:80 nginx`
- Download image of nginx from Docker Hub
- Started a new container for this image
- Opened port 81 (left number) on the host IP
- Routes that traffic to the container IP, port 80
- Adding `--detach` flag to detach the log from the termnial but still keeps the container running. This would return the containter's ID
- `docker container run --publish 81:80 --detach --name webhost nginx`: name the container 'webhost'
- `docker container run --publish 81:80 --detach nginx`
- `-e <ENV_NAME1>=<ENV_VALUE1> <ENV_NAME2>=<ENV_VALUE2> ...`
5. `docker container stop <container_ID_prefix>`
6. `docker container ls`: see running containers, add `-a` to see all
7. `docker container rm -f <container_ID_prefix>`: -f to force remove without stopping first
8. Containers aren't Mini-VMs
9. `docker top <container_id>`: return a snapshot of running processes in a container
10. `docker container inspect <container_name>`
11. `docker container stats`
12. `docker container run -it <image_name> bash`
- `-it`: flag to be interactive
- `bash`: enter container's bash, type 'exit' to exit. Only works if continaer has a bash :)
13. `docker pull <image_name>`
14. `docker image ls`
15. `docker container run -it <image_name>`: start new container interactively
16. `docker container exec -it <container_name> `: run additional command in existing container

### Networking in Docker
- `--format "{{ WantedFieldsInGo}}"`: return in the wanted format
    - e.g: `docker container inspect --format "{{.NetworkSettings.IPAddress}}" webhost`
- `docker container port webhost <container_name>`: quick port check
- Each container connected to a private virtual network call "bridge"
- Each virtual network routes through NAT firewall on host IP
- All containers on a virtual network can talk to each other with `-p` flag
- Best practice would be to create a new virtual network for each app 
- `docker network create --driver [bridge | host | overlay] <network_name>`: create a new virtual network with a specific driver
- `docker network connect [OPTIONS] <network_name> <container_name>`: connect a container to a network. If the container is already in a network, it will be connected to both networks. 
- `docker container run -d --net <network_name> --net-alias <network_alias_name> --name <container_name> <image_name>`: run a container in a specific network with an alias name. The alias name can be used by other containers IN THE NETWORK to connect to this container, instead of using full IP or container name.

## Chapter 5: Images
- App binaries and dependencies
- Metadata about the image data and how to run the image
- Official definition: An image is an ordered collection of root filesystem changes and the corresponding execution parameters for use within a container runtime
- Not a complete OS. No kernel, kernel modules (e.g drivers)
- Small as one file (your app binary) like a golang static binary
- Big as a Ubuntu distro with apt, Apache, PHP, and more installed
### Image Layers
- Images are made up of file system changes and metadata
- Each layer is a set of filesystem changes
- `docker image history <image_name>`: show the layers of an image, aka, the changes made to the image
- `docker image inspect <image_name>`: show the metadata of an image. Stuff like: exposed ports, environment variables, etc.
- `docker image tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]`: create a tag TARGET_IMAGE that refers to SOURCE_IMAGE. 
- What tagging does? It's like a pointer to an image. If you tag an image with a new tag, you can use that tag to refer to the image. An image can have multiple tags. If no `[:TAG]` is provided, it will default to `latest` 
- `cat .docker/config.json`: show the docker config file. This file stores the credentials for Docker Hub.
- `docker login/logout`: login/logout to Docker Hub

### Dockerfile
- 5 stanzas in a Dockerfile:
    - `FROM`: what image you want to base your image off of. E.g: `FROM nginx:latest`
    - `ENV`: environment variables. E.g: `ENV NGINX_VERSION=1.13.12-1~jessie`
    - `RUN`: run a command. E.g: `RUN apt-get update && apt-get install -y nginx`
    - `EXPOSE`: expose a port. E.g: `EXPOSE 80 443`
    - `CMD`: the command to run when the container starts. E.g: `CMD ["nginx", "-g", "daemon off;"]`. The `CMD` is a required parameter that is the final command that will be run when the container starts. If you want to run multiple commands, you can use `ENTRYPOINT` instead.
- `docker image build -t <image_name> .`: build an image from a Dockerfile. The `.` is the context of the build. It's the path where the Dockerfile is located.
- use `WORKDIR` to set the working directory for the `RUN` command. E.g: `WORKDIR /usr/share/nginx/html`. 
- `FROM` copies all layers from the base image to the new image. The `RUN` command creates a new layer on top of the base image.
- `--file` flag to specify the Dockerfile location. E.g: `docker image build -t <image_name> --file <Dockerfile_location> .`
- `docker image prune`: remove dangling images. Dangline images are images that are not tagged and not used by any container.
- `docker system prune`: remove all unused images, containers, networks, and volumes
- `docker system df` to see space usage