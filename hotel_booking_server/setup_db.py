from hotel_booking_server import hotel_data


def table_creation(conn):
    with conn:
        with conn.cursor() as curs:
            curs.execute('DROP SCHEMA IF EXISTS hotel CASCADE')
            curs.execute('CREATE SCHEMA hotel')
            curs.execute('CREATE TABLE hotel.hotel_brand('
                         'brand_ID SERIAL PRIMARY KEY,'
                         'name VARCHAR(255) NOT NULL,'
                         'main_office_address VARCHAR(255) NOT NULL,'
                         'email_address VARCHAR(255) NOT NULL,'
                         'phone_number VARCHAR(20) NOT NULL,'
                         'number_of_hotels INTEGER NOT NULL)')

            curs.execute('CREATE TABLE hotel.hotel('
                         'hotel_ID SERIAL PRIMARY KEY,'
                         'brand_ID SERIAL,'
                         'physical_address VARCHAR(255) NOT NULL,'
                         'number_of_rooms INTEGER NOT NULL,'
                         'star_category SMALLINT NOT NULL,'
                         'email_address VARCHAR(255) NOT NULL,'
                         'phone_number VARCHAR(20) NOT NULL,'
                         'FOREIGN KEY(brand_ID) REFERENCES hotel.hotel_brand(brand_ID) ON DELETE CASCADE)')

            curs.execute('CREATE TABLE hotel.employee('
                         'employee_SIN SMALLINT PRIMARY KEY,'
                         'hotel_ID SERIAL,'
                         'employee_name VARCHAR(255) NOT NULL,'
                         'employee_address VARCHAR(255) NOT NULL,'
                         'salary NUMERIC NOT NULL,'
                         'job_title VARCHAR(255) NOT NULL,'
                         'FOREIGN KEY(hotel_ID) REFERENCES hotel.hotel(hotel_ID) ON DELETE CASCADE)')

            curs.execute('CREATE TABLE hotel.customer('
                         'customer_SIN SMALLINT PRIMARY KEY,'
                         'customer_name VARCHAR(255) NOT NULL,'
                         'customer_address VARCHAR(255) NOT NULL)')

            curs.execute('CREATE TABLE hotel.hotel_room_type('
                         'type_ID SERIAL PRIMARY KEY,'
                         'hotel_ID SERIAL,'
                         'title VARCHAR(255) NOT NULL,'
                         'price NUMERIC NOT NULL,'
                         'amenities VARCHAR(255)[],'
                         'view VARCHAR(255),'
                         'is_extendable BOOLEAN,'
                         'total_number_rooms SMALLINT NOT NULL,'
                         'rooms_available SMALLINT NOT NULL,'
                         'FOREIGN KEY(hotel_ID) REFERENCES hotel.hotel(hotel_ID) ON DELETE CASCADE)')

            curs.execute('CREATE TABLE hotel.booking_status('
                         'status_ID SMALLINT PRIMARY KEY,'
                         'value VARCHAR(20) NOT NULL)')

            curs.execute('INSERT INTO hotel.booking_status(status_ID, value)'
                         "VALUES (1, 'Booked')")
            curs.execute('INSERT INTO hotel.booking_status(status_ID, value)'
                         "VALUES (2, 'Renting')")
            curs.execute('INSERT INTO hotel.booking_status(status_ID, value)'
                         "VALUES (3, 'Archived')")

            curs.execute('CREATE TABLE hotel.room_booking('
                         'booking_ID SERIAL PRIMARY KEY,'
                         'type_ID SERIAL,'
                         'hotel_ID SERIAL,'
                         'employee_SIN SMALLINT,'
                         'customer_SIN SMALLINT NOT NULL,'
                         'date_of_registration DATE NOT NULL,'
                         'check_in_day DATE NOT NULL,'
                         'days_booked SMALLINT NOT NULL,'
                         'status_ID SMALLINT NOT NULL,'
                         'FOREIGN KEY(type_ID) REFERENCES hotel.hotel_room_type(type_ID),'
                         'FOREIGN KEY(hotel_ID) REFERENCES hotel.hotel(hotel_ID) ON DELETE CASCADE,'
                         'FOREIGN KEY(employee_SIN) REFERENCES hotel.employee(employee_SIN),'
                         'FOREIGN KEY(customer_SIN) REFERENCES hotel.customer(customer_SIN),'
                         'FOREIGN KEY(status_ID) REFERENCES hotel.booking_status(status_ID))')
            conn.commit()


def populate(conn):
    with conn:
        with conn.cursor() as curs:
            for i in range(len(hotel_data.hotel_brands)):
                brand = hotel_data.hotel_brands[i]
                curs.execute('INSERT INTO hotel.hotel_brand(name, main_office_address, email_address, phone_number, '
                             'number_of_hotels) '
                             "VALUES ('{}', '{}', '{}', '{}', '{}')"
                             .format(brand[0], brand[1], brand[2], brand[3], brand[4]))

                for j in range(len(hotel_data.hotels[i])):
                    hotel = hotel_data.hotels[i][j]
                    curs.execute('INSERT INTO hotel.hotel(brand_ID, physical_address, number_of_rooms, star_category,'
                                 'email_address, phone_number) '
                                 "VALUES ('{}', '{}', '{}', '{}', '{}', '{}')"
                                 .format(i + 1, hotel[0], hotel[1], hotel[2], hotel[3], hotel[4]))
                conn.commit()


def setup(conn):
    table_creation(conn)
    populate(conn)
