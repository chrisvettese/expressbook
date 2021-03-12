import random
import string
from datetime import datetime, timedelta

from hotel_booking_server import hotel_data

sins = set()
# Given tuple of brand_index and hotel_index, return tuple of employee array and room type_ID array
temp_hotels_data = dict()
current_type_id = 1


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
                         'brand_ID SERIAL NOT NULL REFERENCES hotel.hotel_brand(brand_ID) ON DELETE CASCADE,'
                         'physical_address VARCHAR(255) NOT NULL,'
                         'number_of_rooms INTEGER NOT NULL,'
                         'star_category SMALLINT NOT NULL,'
                         'email_address VARCHAR(255) NOT NULL,'
                         'phone_number VARCHAR(20) NOT NULL,'
                         'CHECK (star_category BETWEEN 1 AND 5))')

            curs.execute('CREATE TABLE hotel.employee('
                         'employee_SIN VARCHAR(11) PRIMARY KEY,'
                         'hotel_ID SERIAL REFERENCES hotel.hotel(hotel_ID) ON DELETE CASCADE,'
                         'employee_name VARCHAR(255) NOT NULL,'
                         'employee_address VARCHAR(255) NOT NULL,'
                         'salary VARCHAR(15) NOT NULL,'
                         'job_title VARCHAR(255) NOT NULL)')

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
                         'hotel_ID SERIAL REFERENCES hotel.hotel(hotel_ID) ON DELETE CASCADE,'
                         'title VARCHAR(255) NOT NULL,'
                         'price VARCHAR(15) NOT NULL,'
                         'amenities VARCHAR(255)[],'
                         'room_capacity SMALLINT NOT NULL,'
                         'view_ID SMALLINT NOT NULL REFERENCES hotel.view_type(view_ID),'
                         'is_extendable BOOLEAN,'
                         'total_number_rooms SMALLINT NOT NULL,'
                         'rooms_available SMALLINT NOT NULL)')

            curs.execute('CREATE TABLE hotel.booking_status('
                         'status_ID SMALLINT PRIMARY KEY,'
                         'value VARCHAR(20) NOT NULL)')

            curs.execute('INSERT INTO hotel.booking_status(status_ID, value)'
                         "VALUES (1, 'Booked')")
            curs.execute('INSERT INTO hotel.booking_status(status_ID, value)'
                         "VALUES (2, 'Renting')")
            curs.execute('INSERT INTO hotel.booking_status(status_ID, value)'
                         "VALUES (3, 'Archived')")
            curs.execute('INSERT INTO hotel.booking_status(status_ID, value)'
                         "VALUES (4, 'Cancelled')")

            curs.execute('CREATE TABLE hotel.room_booking('
                         'booking_ID SERIAL PRIMARY KEY,'
                         'type_ID SERIAL REFERENCES hotel.hotel_room_type(type_ID),'
                         'hotel_ID SERIAL REFERENCES hotel.hotel(hotel_ID) ON DELETE CASCADE,'
                         'employee_SIN VARCHAR(11) REFERENCES hotel.employee(employee_SIN) ON UPDATE CASCADE,'
                         'customer_SIN VARCHAR(11) NOT NULL REFERENCES hotel.customer(customer_SIN) ON UPDATE CASCADE,'
                         'date_of_registration DATE NOT NULL DEFAULT CURRENT_DATE,'
                         'check_in_day DATE NOT NULL,'
                         'days_booked SMALLINT NOT NULL,'
                         'status_ID SMALLINT NOT NULL REFERENCES hotel.booking_status(status_ID) DEFAULT 1)')

            curs.execute('CREATE FUNCTION hotel.require_hotel_manager() RETURNS TRIGGER AS $$ '
                         'BEGIN '
                         'IF (CAST((SELECT COUNT(*) FROM hotel.employee e '
                         'WHERE e.hotel_ID = NEW.hotel_ID AND e.job_title = \'Manager\') AS INTEGER) = 0) THEN '
                         'RAISE EXCEPTION \'Hotel must have employee with job title "Manager" '
                         'before other employees can be hired.\'; '
                         'END IF; '
                         'RETURN NEW; '
                         'END; '
                         '$$ LANGUAGE plpgsql;'
                         'CREATE TRIGGER require_hotel_manager '
                         'BEFORE INSERT ON hotel.employee FOR EACH ROW '
                         'WHEN (NEW.job_title != \'Manager\') '
                         'EXECUTE PROCEDURE hotel.require_hotel_manager()')

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
                rand_i = random.randrange(0, len(hotel_data.hotel_brands))
                hotel = hotel_data.hotels[rand_i][random.randrange(0, len(hotel_data.hotel_brands[rand_i]))]
                customer_sin = new_sin()

                curs.execute(
                    'INSERT INTO hotel.customer(customer_SIN, customer_name, customer_address) '
                    "VALUES ('{}', '{}', '{}')"
                        .format(customer_sin, random.choice(hotel_data.names), generate_address(hotel[0])))

                generate_room_bookings(curs, customer_sin)

            conn.commit()


def generate_room_bookings(curs, customer_sin):
    for i in range(0, 3):
        rand_hotel_brand = random.randrange(0, len(hotel_data.hotel_brands))
        rand_hotel = random.randrange(0, len(hotel_data.hotels[rand_hotel_brand]))
        temp_hotel_data = temp_hotels_data.get((rand_hotel_brand, rand_hotel))
        type_id = random.choice(temp_hotel_data[1])
        days_booked = random.randint(1, 10)
        registration_date = datetime.today() - timedelta(days=random.randrange(1, 400))
        check_in = registration_date + timedelta(days=random.randrange(1, 400))
        status_id = random.randint(1, 4)

        use_employee_sin = status_id > 1
        # for testing purposes, 50% chance that a prebooked room was booked by an employee
        if not use_employee_sin:
            use_employee_sin = random.randint(1, 2) == 1

        if use_employee_sin:
            rand_e_sin = random.choice(temp_hotel_data[0])
            curs.execute('INSERT INTO hotel.room_booking(type_ID, hotel_ID, employee_sin, customer_sin,'
                         'date_of_registration, check_in_day, days_booked, status_ID) '
                         "VALUES ('{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}')"
                         .format(type_id, rand_hotel + 1, rand_e_sin, customer_sin, registration_date, check_in,
                                 days_booked, status_id))
        else:
            curs.execute('INSERT INTO hotel.room_booking(type_ID, hotel_ID, customer_sin, '
                         'date_of_registration, check_in_day, days_booked, status_ID) '
                         "VALUES ('{}', '{}', '{}', '{}', '{}', '{}', '{}')"
                         .format(type_id, rand_hotel + 1, customer_sin, registration_date, check_in,
                                 days_booked, status_id))


def populate_hotel(brand_index, hotel_index, curs):
    hotel = hotel_data.hotels[brand_index][hotel_index]

    employee_sins = []
    type_ids = []

    # general manager must be inserted first to satisfy trigger constraint
    curs.execute('INSERT INTO hotel.employee(employee_SIN, hotel_ID, employee_name, employee_address, salary,'
                 'job_title)'
                 "VALUES ('{}', '{}', '{}', '{}', '{}', '{}')"
                 .format(new_sin(), hotel_index + 1, random.choice(hotel_data.names), generate_address(hotel[0]),
                         random_salary(), 'Manager'))

    for k in range(random.randint(5, 20)):
        e_sin = new_sin()
        employee_sins.append(e_sin)
        curs.execute('INSERT INTO hotel.employee(employee_SIN, hotel_ID, employee_name, employee_address, salary,'
                     'job_title)'
                     "VALUES ('{}', '{}', '{}', '{}', '{}', '{}')"
                     .format(e_sin, hotel_index + 1, random.choice(hotel_data.names), generate_address(hotel[0]),
                             random_salary(), random.choice(hotel_data.job_titles)))
    num_rooms = hotel[1]

    global current_type_id
    while num_rooms > 0:
        type_ids.append(current_type_id)
        current_type_id += 1

        num_room_type = int(0.8 * (hotel[1] / 6) * (1 + random.randint(0, 20) / 100))
        if num_rooms - num_room_type < 0:
            num_room_type = num_rooms

        num_rooms -= num_room_type
        room_index = random.randrange(0, len(hotel_data.room_titles))
        price = "{:.2f}".format((hotel[2] - 1) * 100 + (room_index + 1) * 100 + random.randint(0, 15000) / 100)
        amenities = to_pg_array(random.sample(hotel_data.room_amenities, random.randint(0, 6)))
        view = random.randint(1, 4)

        curs.execute('INSERT INTO hotel.hotel_room_type(hotel_ID, title, price, amenities, room_capacity, view_ID,'
                     'is_extendable, total_number_rooms, rooms_available) '
                     "VALUES ('{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}')"
                     .format(hotel_index + 1, hotel_data.room_titles[room_index], price, amenities,
                             hotel_data.room_capacities[room_index], view, bool(random.getrandbits(1)),
                             num_room_type, num_room_type))

    temp_hotels_data[(brand_index, hotel_index)] = (employee_sins, type_ids)


def to_pg_array(arr):
    arr = str(arr)
    arr = '{' + arr[1:len(arr) - 1] + '}'
    arr = arr.replace('\'', '')
    return arr


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
    sins.clear()
    temp_hotels_data.clear()
    print('Done.')
