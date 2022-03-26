# UDConcord
UDConcord is a concordancer web application. The tool is designed to be visual and easy-to-use, working with treebanks that were annotated using the Universal Dependencies international model.

## How to Install and Run it

### Installing Docker and Docker Compose

UDConcord is a containerized application. It's meant to be installed and run using Docker and Docker Compose, so, in order to follow this tutorial, you will have to install these two pieces of software first.

* [Click here for information about how to install Docker](https://docs.docker.com/engine/install/)
* [Click here for information about how to install Docker Compose](https://docs.docker.com/compose/install/)

### Installing the Application Itself

#### Run the Preparatory Script

After Docker and Docker Compose are installed, clone this repository and go to its root directory. Execute the bash script named `prep.bash` inside the scripts directory. You can do this by executing the following command in the repo's root directory:

```console
bash ./scripts/prep.bash
```

This script executes some preparatory work, like setting up an SSL self-signed certificate for the https. 

#### Run the App in Development Mode

After that, to install and run the app in development mode, execute the following command in the repo's root directory:

```console
docker-compose -f docker-compose.dev.yml up
```

The app will then be available at https://localhost:3000/.

#### Run the App in Production Mode

If you want to install and run the app in production mode, insert the address where you intend to host your app inside the `.env.production` file inside the `client` directory.

After that, execute the following command in the repo's root directory:

```console
docker-compose up
```
The app will then be available at https://localhost:3000/. It will also be available at the address specified in `.env.production`, if everything else regarding that is already set up.
