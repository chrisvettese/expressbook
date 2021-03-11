import random
import string

from hotel_booking_server import hotel_data

sins = set()


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
                         'FOREIGN KEY(brand_ID) REFERENCES hotel.hotel_brand(brand_ID) ON DELETE CASCADE,'
                         'CHECK (star_category BETWEEN 1 AND 5))')

            curs.execute('CREATE TABLE hotel.employee('
                         'employee_SIN VARCHAR(11) PRIMARY KEY,'
                         'hotel_ID SERIAL,'
                         'employee_name VARCHAR(255) NOT NULL,'
                         'employee_address VARCHAR(255) NOT NULL,'
                         'salary VARCHAR(15) NOT NULL,'
                         'job_title VARCHAR(255) NOT NULL,'
                         'FOREIGN KEY(hotel_ID) REFERENCES hotel.hotel(hotel_ID) ON DELETE CASCADE)')

            curs.execute('CREATE TABLE hotel.customer('
                         'customer_SIN VARCHAR(11) PRIMARY KEY,'
                         'customer_name VARCHAR(255) NOT NULL,'
                         'customer_address VARCHAR(255) NOT NULL)')

            curs.execute('CREATE TABLE hotel.view_type('
                         'view_ID SMALLINT PRIMARY KEY,'
                         'type VARCHAR(20) NOT NULL)')

            curs.execute('INSERT INTO hotel.view_type(view_ID, type)'
                         "VALUES (1, 'Mountain')")
            curs.execute('INSERT INTO hotel.view_type(view_ID, type)'
                         "VALUES (2, 'Lake')")
            curs.execute('INSERT INTO hotel.view_type(view_ID, type)'
                         "VALUES (3, 'City')")
            curs.execute('INSERT INTO hotel.view_type(view_ID, type)'
                         "VALUES (4, 'None')")

            curs.execute('CREATE TABLE hotel.hotel_room_type('
                         'type_ID SERIAL PRIMARY KEY,'
                         'hotel_ID SERIAL,'
                         'title VARCHAR(255) NOT NULL,'
                         'price VARCHAR(15) NOT NULL,'
                         'amenities VARCHAR(255)[],'
                         'view_ID SMALLINT,'
                         'is_extendable BOOLEAN,'
                         'total_number_rooms SMALLINT NOT NULL,'
                         'rooms_available SMALLINT NOT NULL,'
                         'FOREIGN KEY(hotel_ID) REFERENCES hotel.hotel(hotel_ID) ON DELETE CASCADE,'
                         'FOREIGN KEY(view_ID) REFERENCES hotel.view_type(view_ID))')

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
                         'employee_SIN VARCHAR(11),'
                         'customer_SIN VARCHAR(11) NOT NULL,'
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

                    populate_hotel(i, j, curs)

            for k in range(random.randint(200, 300)):
                curs.execute(
                    'INSERT INTO hotel.customer(customer_SIN, customer_name, customer_address) '
                    "VALUES ('{}', '{}', '{}')"
                    .format(new_sin(), random.choice(hotel_data.names), generate_address(hotel[0])))

                conn.commit()


def populate_hotel(brand_index, hotel_index, curs):
    hotel = hotel_data.hotels[brand_index][hotel_index]
    for k in range(random.randint(5, 20)):
        curs.execute('INSERT INTO hotel.employee(employee_SIN, hotel_ID, employee_name, employee_address, salary,'
                     'job_title)'
                     "VALUES ('{}', '{}', '{}', '{}', '{}', '{}')"
                     .format(new_sin(), hotel_index + 1, random.choice(hotel_data.names), generate_address(hotel[0]),
                             random_salary(), random.choice(hotel_data.job_titles)))


def new_sin():
    num = '{:03}'.format(random.randint(1, 999)) + '-' + '{:03}'.format(random.randint(1, 999)) + '-' + '{:03}'.format(
        random.randint(1, 999))
    while num in sins:
        num = '{:03}'.format(random.randint(1, 999)) + '-' + '{:03}'.format(
            random.randint(1, 999)) + '-' + '{:03}'.format(random.randint(1, 999))
    sins.add(num)
    return num


def generate_postal_or_zip(country):
    if 'United States' in country:
        return '{:05}'.format(random.randint(1, 99999))
    else:
        return random.choice(string.ascii_uppercase) + str(random.randint(1, 9)) + random.choice(
            string.ascii_uppercase) + \
               ' ' + str(random.randint(1, 9)) + random.choice(string.ascii_uppercase) + str(random.randint(1, 9))


def generate_address(hotel_address):
    components = hotel_address.split(',')
    return str(random.randint(1, 2000)) + ' ' + random.choice(hotel_data.streets) + ',' + components[1] + ',' \
           + components[2] + ',' + generate_postal_or_zip(components[4]) + ',' + components[4]


def random_salary():
    return str(random.randint(20000, 90000)) + '.' + '{:02}'.format(random.randint(0, 99))


def setup(conn):
    print('Creating tables...')
    table_creation(conn)
    print('Populating tables (this may take a while)...')
    populate(conn)
    print('Done.')
    sins.clear()
