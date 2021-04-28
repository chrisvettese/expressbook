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

### Installation

Run `docker-compose up --build` in the top level directory. This will start PostgreSQL, the Flask server, pgAdmin, and NginX.

If the app is started with the default configuration, the following paths will be exposed (as accessed from the host machine):

http://localhost:1234/ui/customer - This is the user interface for the customer

http://localhost:1234/ui/employee - This is the user interface for employees
  
http://localhost:1235/ - This is pgAdmin, meant for admin users
  
http://localhost:1234/service - This is the path of the Flask server endpoints.


The file Hotel Booking App.postman_collection.json contains all the endpoints, which may be imported into Postman for testing:
![Postman Endpoints.](https://raw.githubusercontent.com/chrisvettese/expressbook/main/images/i3.png)

## Using the App
### For Admins
Go to http://localhost:1235/
Enter a master password, such as admin
The database connection will be pre-configured under the "Servers" dropdown. The database password is `postgres` by default.

After following these steps, admins will be able to manipulate any aspect of the database.

### For Customers

Go to http://localhost:1234/ui/customer.

The website uses email-based sign in for customers. Realistically, most websites would require an email and password sign in. However, for this course, it will be possible to sign in with just an email.

There are two possibilities at this step:
* Sign in as an existing customer (if using simulation data, try an existing email found in `GET /customers`)
* Sign in as a new customer: Enter an email, and the user will be prompted to enter more information

Once signed in, there will a page that looks like this:
![Customer welcome page.](https://raw.githubusercontent.com/chrisvettese/expressbook/main/images/i4.PNG)

From here, the user can edit their profile, view their reservations, or find a hotel.
* My Reservations: Allows users to view all future and past reservations they have made, and allows users to cancel future bookings, and check out of rooms
* Find A Hotel: The user will be prompted to select a hotel brand, and then a hotel associated with the chosen brand. After that, they will be allowed to book a room.

![A view of the My Reservations page.](https://raw.githubusercontent.com/chrisvettese/expressbook/main/images/i1.PNG)
A view of the My Reservations page.

### For Employees and Managers

