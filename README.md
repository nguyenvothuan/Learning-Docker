

# Docker
Note taking from this Docker course: https://www.udemy.com/course/docker-mastery/
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
- `FROM some_image:some_version as build`: create a temporary image with a name. This is useful when you want to build an image and copy the build artifacts to another image. E.g we may need npm and node to run react app, but we don't need them in the final image. So we can create a temporary image with npm and node, build the react app, then copy the build artifacts to the final image.
## Chapter 6: Volumes
- Containers are usually immutable and ephemeral
- "Immutable infrastructure": only re-deploy containers, never change
- This is the ideal scenario, but what about databases, or unique data?
- Docker gives us features to ensure these "separation of concerns". This is known as "persistent data".
- Two solutions: Volumes and Bind Mounts
- Volumes: make special location outside of container UFS. 
- Bind Mounts: link container path to host path. 
### Volumes
- `docker volume ls`: list all volumes
- `docker container run -d --name <container_name> -v <volume_name>:<container_path> <image_name>`: create a volume and mount it to a container. If the volume doesn't exist, it will be created. If the volume exists, it will be mounted to the container. 
### Bind Mounting
- `docker container run -d --name <container_name> -v <host_path>:<container_path> <image_name>`: bind mount a host path to a container path. If the host path doesn't exist, it will be created. If the host path exists, it will be mounted to the container. Everything in the `<host_path>` becomes shared between the host and the container. So, the container will automatically detect changes in the shared directory and reflect them.
- `$(pwd)`: print the current working directory

## Chapter 7: Docker Compose
### Why
- Configure relationships between containers
- Save our docker container run settings in easy-to-read file
- Create one-liner developer environment startups
### docker-compose.yml
- `version`: version of the compose file format
- `docker compose -f`: specify the compose file, default is `docker-compose.yml`
- `docker compose down --rmi local`: Tell Docker to remove images as well. By default, Docker Compose will only remove the containers and networks.
- `docker compose up -d`: start the containers in the background
- `docker compose up --build`: build the images before starting the containers. 
- A bridge network is created by default for all containers in the same compose file.

## Chapter 8: Swarm
- Containers everywhere, how to manage them?
- How do we automate container lifecycle?
- How do we scale them up and down?
- How can we ensure containers are re-created if they fail?
- How can we replace containers without downtime?
- How can we control/track where containers are started?
- How can we create cross-node virtual networks?
- How can we ensure only trusted servers run our containers?
- How can we store secrets, keys, passwords, and get them to the right container?
### Swarm and Swarm Node
- A node refers to an instance of the Docker engine participating in the swarm. A swarm is a group of machines that are running Docker and joined into a cluster. Once a group of machines have been joined together, you can still run the Docker commands that you're used to, but they are now executed on a cluster by a swarm manager. The machines in a swarm can be physical or virtual. After joining a swarm, they are referred to as nodes.
- Two types of nodes:
    - Manager nodes: Manager nodes handle orchestration and cluster management functions of Swarm. They perform the key functions of maintaining the desired state, scheduling services, and serving the swarm mode HTTP API endpoints. You can also run workloads on manager nodes, but it's generally recommended to leave manager nodes for management duties.
    - Worker nodes: Worker nodes are there to provide capacity to your applications. Worker nodes receive and execute tasks dispatched from manager nodes. 
- RAFT: Consensus algorithm used by Swarm to manage the cluster state. It's a protocol that allows a collection of machines to work as a coherent group that can survive the failures of some of its members.
### Services
- `docker swarm init`: initialize a swarm. Doing that on a local machine create a Docker Swarm single-node cluster and the machine becomes the manager node of that cluster. Breakdown:
    - Docker changes the working mode of Docker Engine on the machine to swarm mode
    - Current machine becomes a manager node. In a Docker Swarm cluster, manager nodes are responsible for maintaining the cluster state, scehduling services, and serving swarm mode HTTP API endpoints.
    - Docker generates a manager secret and a worker secret. These secrets are used to add additional manager and worker nodes to the swarm.
    - Docker sets up a networking for the swarm, including creating a default **overlay** network for internal cmmunication betwween services.
- Quick recap: Three types of Docker network:
    - **Bridge**: default network when you create a container. It's a private internal network created by Docker on the host. Containers can talk to each other on this network.
    - **Host**: removes network isolation between the container and the Docker host. The container uses the host's network directly.
    - **Overlay**: multi-host network. It's used when you want to create a network that spans multiple Docker hosts. This is useful when you have a multi-node Docker Swarm cluster and you want to create a network that spans all the nodes in the cluster.
- `docker service create [OPTIONS] IMAGE [COMMAND] [ARG...]`: create a service from an image. A service is a definition of a task that should be run on the swarm. It's a way to scale containers across multiple Docker daemons.
- `docker node ls`: list all nodes in the swarm
- `docker service ps <service_name>`: list all tasks of a service
- A service can have multiple replicas. A replica is a task that runs on a worker node. The number of replicas is the number of tasks that should be running for a service.
- `docker service update <service_id> --replicas <number_of_replicas>`: update the number of replicas for a service. 
- A little about task. A task is the atomic scheduling unit of Swarm. It's a running container which is part of a service. A task is assigned to a node by the manager, and it stays on that node until the task is removed or the node fails.
- Swarm will quickly replace a failed task with a new recreacted task. 
- Multipass: a tool to create and manage virtual machines. It's a lightweight VM manager for Linux, Windows, and macOS. It's a good tool to create a multi-node Docker Swarm cluster on a single machine.
- `multipass launch --name <node_name> --cpus <number_of_cpus> --mem <memory_size> --disk <disk_size>`: create a new virtual machine with the specified name, CPUs, memory size, and disk size.
- `multipass shell <node_name>`: open a shell to the virtual machine.
- `multipass exec <node_name> -- <command>`: run a command in the virtual machine.
- E.g: `multipass exec node1 -- env`: run `env` command in the virtual machine `node1`
- To get docker on VM: `curl -sSL https://get.docker.com | sh`
- `docker swarm init --advertise-addr <node_IP>`: initialize a swarm with the specified IP address. This is useful when you have multiple network interfaces on the machine and you want to specify which interface to use for the swarm. Of course, a Docker container or a virtual machine will have its own virtual network interface, along (possibly) with a virtual network interface for the VM to communicate with the host machine. 
- `docker swarm join --token <token> <manager_IP>:<manager_port>`: join a node to a swarm. This is useful when you have multiple nodes and you want to add them to the swarm. The token is generated when you initialize the swarm or using the below command.
- `docker swarm join-token <worker|manager>`: get the join token for a worker or a manager. This is useful when you want to add a new node to the swarm.
- `docker node update --role <manager|worker> <name of node>`: update the role of a node in the swarm. This is useful when you want to change the role of a node from a manager to a worker or vice versa.
- So after we have created a Swarm and added nodes to it, on the leader node, we can create services. Depend on the replicas we set for that service, Swarm will use its load-balancing strategy to distribute the tasks of that service to the worker nodes. 
- `sudo chmod 666 /var/run/docker.sock`: give permission to the Docker socket. This is useful when you want to run Docker commands without using `sudo`.

## Chapter 9: Swarm Basic Features
### Routing Mesh Cont
- Routing Mesh: automatically routes incoming requests to published ports on available nodes in the cluster. It makes sure that the request is routed to a node that has a task for the service. For example, if a node is running a Drupal task, you can access the IP:port of the Drupal service on that node. 
- Stateless load balancing. Nginx or HAProxy LB may come to help
- Docker Swarm Routing Mesh provides Layer 4 (transport layer) load balancing. 
- Accessing a service on a Swarm cluster: `http://<node_IP>:<published_port>`. The request will be routed to the node that has the task for the service, so it doesn't matter which node you access.
- **Decentralized**: each node in the Swarm handles routing of the incoming requests automously. Should the node becomes oveloaded, it will not accept new connections but transfer these connections to other available nodes in the overlay network.
- Ingress network: the network that the routing mesh uses to route incoming requests to the services in the cluster. The ingress network is an overlay network that is created by Docker when you initialize a Swarm. The ingress network is used by the routing mesh to route incoming requests to the services in the cluster.
### Stacks: Production Grade Compose
- In 1.13, Docker adds a new layer of abstraction to Swarm called Stacks
- Stacks are a way to define and run multi-container applications on Swarm.
- Stacks accept Compose files as their declarative definition for services, networks, and volumes. Key `deploy` in each service is ignored whenever runned on local machine instead of Swarm mode.
- `docker stack deploy -c <compose_file> <stack_name>`: deploy a stack to the Swarm. The compose file is the file that defines the services, networks, and volumes for the stack. The stack name is the name of the stack.
- `docker stack services <stack_name>`: list all services in a stack
- `docker stack ps <stack_name>`: list all tasks in a stack
- Understandably, it is just a way to deploy services to the Swarm, but more convenient than using `docker service create` command.
### Secrets Storage
- Easiest secure solution for storing secrets in Swarm
- Swarm Raft DB is encrypted on disk, and stored on disk on Manager nodes
- Secretes are first stored in Swarm, then assigned to Services
- Secrets look like files in container but are actually in-memory fs
- `docker secret create <secret_name> <file>`: create a secret from a file. The secret name is the name of the secret. The file is the file that contains the secret data.
- `docker service create --secret <secret_name> --name <service_name> <image_name>`: create a service with a secret. The secret name is the name of the secret. The service name is the name of the service. The image name is the name of the image.
- `echo "password" | docker secret create psql_pass -`: create a secret from a string. The secret name is `psql_pass` and the secret data is `password`. The `-` at the end of the command tells Docker to read the secret data from the *standard input*.
- ` docker service create --name psql --secret psql_user --secret psql_pass -e POSTGRESS_PASSWORD_FILE=/run/secrets/psql_pass -e POSTGRES_USER_FILE=/run/secrets/psql_user postgres`: If you know you know
- `docker exec -it <container_name> bash`: enter a container's shell\

### Secrets in Stacks
```yaml
version: '3.1' # must be 3.1 to have secret support
services:
  db:
    image: postgres
    secrets: # list of secrets for service db
      - psql_user
      - psql_pass
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/psql_pass #use these secrets sepcified above
      POSTGRES_USER_FILE: /run/secrets/psql_user

secrets:
# secret_key:
#   file: ./path/to/secret.txt 
#   OR 
#   external: true if secrets exposed via echo in the cmd
  psql_user:
    file: ./psql_user.txt
  psql_pass:
    file: ./psql_pass.txt
```
## Chapter 10: Swarm App Lifecycle
- `docker-compose.override.yml`, `docker-compose.prod.yml`, `docker-compose.test.yml`, `docker-compose.yml`:
  - `docker-compose.yml`: the base file
  - `docker-compose.override.yml`: used to override the configs in the base `docker-compose.yml` file for dev environment. Docker Compose automatically reads both `docker-compose.yml` and `docker-compose.override.yml` files if they ae present in the same directory and no `-f` flag is specified. 
  - `docker-compose.prod.yml`: used to override the configs in the base `docker-compose.yml` file for the production environment. It might include configs for different logging levels, replication, resource limits, etc... that are specific to the production environment.
  - `docker-compose.test.yml`
  - To use override files other than the `docker-compose.override.yml`, you can use the `-f` flag. E.g: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
### Rolling Updates
- `docker service update --image <new_image> <service_name>`: update the image of a service. This will create a new task with the new image and remove the old task with the old image. 
- `docker service update --env-add <ENV_NAME>=<ENV_VALUE> --publish-rm <PORT> <service_name>`: add an environment variable to a service and remove a published port from the service.
- `docker service scale <service_name>=<number_of_replicas>[]`: scale a service to the specified number of replicas. 
- After some updates, do `docker service update --force web` to rebalance the tasks across the service.
### Healthchecks

## Chapter 11: Container Registries
- Use Docker Hub's "Create Automated Build" feature to automatically build images from a GitHub repository. Something like a reverse webhook. 
- Also, set rebuild triggers when dependencies are updated.
- Speak it plainly, Docker Registry is an image storage service, while Docker Hub is a specific such service. From the Docker Hub page of Registry: "Distribution implementation for storing and distributing of container images and artifacts".
- TLS, or Transport Layer Security, is a cryptographic protocol that provides security and data integrity for communications over networks such as the Internet. TLS is the successor to the Secure Sockets Layer (SSL), although the terms SSL and TLS are often used interchangeably. 
- `docker container run -d -p 5000:5000 --name registry registry:2`: run a registry container. The registry container listens on port 5000 and is named `registry`.
- `docker tag <image_name> localhost:5000/<image_name>`: tag an image with the registry's address. The image name is the name of the image. The registry's address is `localhost:5000`.
- `docker pull localhost:5000/<image_name>`: pull an image from the registry. The registry's address is `localhost:5000`.
- `docker push localhost:5000/<image_name>`: push an image to the registry. The registry's address is `localhost:5000`.
- Once we push the image to the registry, we can safely remove it from the local machine with `docker image remove <image_name>`. We can still pull the image from the registry whenever we need it.
- Since all the images are stored in volume, even if the registry is removed, running another container of registry with `-v $(pwd)/registry-data:/var/lib/registry` will bring back the images.
