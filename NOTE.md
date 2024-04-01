# Docker
## Chapter 1: Quick Start
## Chapter 2: Course Introduction
## Chapter 3: Setup Docker
## Chapter 4: Containers
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
12. `docker container run -it <container_name> bash`
- `-it`: flag to be interactive
- `bash`: enter container's bash, type 'exit' to exit. Only works if continaer has a bash :)
13. `docker pull <image_name>`
14. `docker image ls`
15. `docker container run -it <container_name>`: start new container interactively
16. `docker container exec -it <container_name> `: run additional command in existing container