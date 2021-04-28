# ExpressBook
ExpressBook is a full stack hotel booking app. The app allows users to select from a variety of (simulated) hotel brands, and make bookings at various hotel locations. The app allows hotel employees to check in and check out customers, as well as manage customer profiles. Hotel managers can also manage employees, and create and delete room types.

The following is a diagram of the stack:
![Diagram of the app.](https://raw.githubusercontent.com/chrisvettese/expressbook/main/images/i2.png)

All four user types (Customer, Employee, Manager, and Admin) access the various user interfaces through a reverse proxy. The entire app is dockerized to make it easy to deploy with any web hosting service. With a single command, a PostgreSQL database will be created, pgAdmin will be installed and launched for admins to access the database, a Python Flask server will launch with endpoints that retrieve data, and NginX will serve React apps for customers, employees, and managers (as well as provide access to pgAdmin for administrators).

## Setup
### Configuration
To configure the app, open `config.yml`. The following settings are available:

`host`: PostgreSQL host. By default it will connect to a database in the same docker container, but can be configured to connect to an external server.

`port`: PostgreSQL port

`database`: PostgreSQL database name

`user`: PostgreSQL username

`password`: PostgreSQL password

`reset-db`: If true, the entire database will be reset according to the `data-mode` setting. This should only be set to true for testing purposes.

`data-mode`: example | random | empty: The type of data to be loaded if the db does not exist, or if `reset-db` is true. `example` loads pre-set simulation data for hotel brands, hotel locations, customers, employees, and room bookings. `random` generates new simulated data with a python script. Production servers should use `empty` and populate the db with real data.

`time-zone`: Timezone for the PostgreSQL server to use. The `Dockerfile` sets timezone of the container (including the Flask server).

The existing config can be used for testing purposes without any changes.
