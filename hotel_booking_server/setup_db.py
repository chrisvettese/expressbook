import random
import string
from datetime import datetime, timedelta

import psycopg2

from hotel_booking_server import hotel_data

sins = set()
# Given brand_index and hotel_index, return array of [employee[], type_ID[], hotel_id]
temp_hotels_data = [[], [], [], [], [], []]
current_type_id = 1


def table_creation(conn):
    with conn:
        with conn.cursor() as curs:
            curs.execute('DROP SCHEMA IF EXISTS hotel CASCADE;')
            curs.execute('CREATE SCHEMA hotel')
            curs.execute('''
                CREATE TABLE hotel.hotel_brand(
                    brand_ID SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    main_office_address VARCHAR(255) NOT NULL,
                    email_address VARCHAR(255) NOT NULL,
                    phone_number VARCHAR(20) NOT NULL,
                    number_of_hotels INTEGER NOT NULL DEFAULT 0)
                ''')
            curs.execute('''
                CREATE TABLE hotel.hotel(
                    hotel_ID SERIAL PRIMARY KEY,
                    brand_ID SERIAL NOT NULL REFERENCES hotel.hotel_brand(brand_ID) ON DELETE CASCADE,
                    physical_address VARCHAR(255) NOT NULL,
                    number_of_rooms INTEGER NOT NULL,
                    star_category SMALLINT NOT NULL,
                    email_address VARCHAR(255) NOT NULL,
                    phone_number VARCHAR(20) NOT NULL,
                    CHECK (star_category BETWEEN 1 AND 5))
                ''')
            curs.execute('''
                CREATE TABLE hotel.employee_status(
                    status_ID SMALLINT PRIMARY KEY,
                    status VARCHAR(20) NOT NULL)
                ''')
            curs.execute('''
                    INSERT INTO hotel.employee_status(status_ID, status) VALUES (1, 'Hired');
                    INSERT INTO hotel.employee_status(status_ID, status) VALUES (2, 'Quit');
                    ''')
            curs.execute('''
                CREATE TABLE hotel.employee(
                    employee_SIN VARCHAR(11) PRIMARY KEY,
                    hotel_ID SERIAL REFERENCES hotel.hotel(hotel_ID) ON DELETE CASCADE,
                    employee_name VARCHAR(255) NOT NULL,
                    employee_address VARCHAR(255) NOT NULL,
                    salary VARCHAR(15) NOT NULL,
                    job_title VARCHAR(255) NOT NULL,
                    status_ID SMALLINT NOT NULL REFERENCES hotel.employee_status(status_ID) DEFAULT 1)
                ''')
            curs.execute('''
                CREATE TABLE hotel.customer(
                    customer_SIN VARCHAR(11) PRIMARY KEY,
                    customer_name VARCHAR(255) NOT NULL,
                    customer_address VARCHAR(255) NOT NULL,
                    customer_email VARCHAR(255) NOT NULL,
                    customer_phone VARCHAR(20) NOT NULL)
                ''')
            curs.execute('''
                CREATE TABLE hotel.view_type(
                    view_ID SMALLINT PRIMARY KEY,
                    view VARCHAR(20) NOT NULL)
                ''')
            curs.execute('''
                INSERT INTO hotel.view_type(view_ID, view) VALUES (1, 'Mountain');
                INSERT INTO hotel.view_type(view_ID, view) VALUES (2, 'Lake');
                INSERT INTO hotel.view_type(view_ID, view) VALUES (3, 'City');
                INSERT INTO hotel.view_type(view_ID, view) VALUES (4, 'None');
                ''')
            curs.execute('''
                CREATE TABLE hotel.hotel_room_type(
                    type_ID SERIAL PRIMARY KEY,
                    hotel_ID SERIAL REFERENCES hotel.hotel(hotel_ID) ON DELETE CASCADE,
                    title VARCHAR(255) NOT NULL,
                    price VARCHAR(15) NOT NULL,
                    amenities VARCHAR(255)[],
                    room_capacity SMALLINT NOT NULL,
                    view_ID SMALLINT NOT NULL REFERENCES hotel.view_type(view_ID),
                    is_extendable BOOLEAN,
                    total_number_rooms SMALLINT NOT NULL,
                    rooms_available SMALLINT NOT NULL)
                ''')
            curs.execute('''
                CREATE TABLE hotel.booking_status(
                    status_ID SMALLINT PRIMARY KEY,
                    value VARCHAR(20) NOT NULL)
                ''')
            curs.execute('''
                INSERT INTO hotel.booking_status(status_ID, value) VALUES (1, 'Booked');
                INSERT INTO hotel.booking_status(status_ID, value) VALUES (2, 'Renting');
                INSERT INTO hotel.booking_status(status_ID, value) VALUES (3, 'Archived');
                INSERT INTO hotel.booking_status(status_ID, value) VALUES (4, 'Cancelled');
                ''')
            curs.execute('''
                CREATE TABLE hotel.room_booking(
                    booking_ID SERIAL PRIMARY KEY,
                    type_ID SERIAL REFERENCES hotel.hotel_room_type(type_ID),
                    hotel_ID SERIAL REFERENCES hotel.hotel(hotel_ID) ON DELETE CASCADE,
                    employee_SIN VARCHAR(11) REFERENCES hotel.employee(employee_SIN) ON UPDATE CASCADE,
                    customer_SIN VARCHAR(11) NOT NULL REFERENCES hotel.customer(customer_SIN) ON UPDATE CASCADE,
                    date_of_registration DATE NOT NULL DEFAULT CURRENT_DATE,
                    check_in_day DATE NOT NULL,
                    check_out_day DATE NOT NULL,
                    status_ID SMALLINT NOT NULL REFERENCES hotel.booking_status(status_ID) DEFAULT 1)
                ''')
            # trigger function to if a hotel has no manager, they must be the next employee hired
            curs.execute('''
                CREATE FUNCTION hotel.require_hotel_manager() RETURNS TRIGGER AS
                    $$ 
                    BEGIN 
                    IF (CAST((SELECT COUNT(*) FROM hotel.employee e 
                            WHERE e.hotel_ID = NEW.hotel_ID AND e.job_title = 'Manager') AS INTEGER) = 0) THEN 
                        RAISE EXCEPTION 'Hotel must have employee with job title "Manager" 
                        before other employees can be hired.'; 
                    END IF; 
                    RETURN NEW; 
                    END; 
                    $$ LANGUAGE plpgsql;
                CREATE TRIGGER require_hotel_manager 
                BEFORE INSERT ON hotel.employee FOR EACH ROW 
                WHEN (NEW.job_title != 'Manager') 
                EXECUTE PROCEDURE hotel.require_hotel_manager()
                ''')
            # trigger function to update number_of_hotels for a brand when a new hotel is created
            curs.execute('''
                CREATE FUNCTION hotel.increase_num_hotels() RETURNS TRIGGER AS
                    $$ 
                    BEGIN 
                    UPDATE hotel.hotel_brand SET number_of_hotels = number_of_hotels + 1 
                    WHERE NEW.brand_id = brand_id; 
                    RETURN NEW;
                    END; 
                    $$ LANGUAGE plpgsql;
                CREATE TRIGGER increase_num_hotels 
                AFTER INSERT ON hotel.hotel FOR EACH ROW 
                EXECUTE PROCEDURE hotel.increase_num_hotels()
                ''')

            # trigger function to update number_of_hotels for a brand when a new hotel is created
            curs.execute('''
                CREATE FUNCTION hotel.decrease_num_hotels() RETURNS TRIGGER AS
                    $$ 
                    BEGIN 
                    UPDATE hotel.hotel_brand SET number_of_hotels = number_of_hotels - 1 
                    WHERE NEW.brand_id = brand_id; 
                    RETURN OLD;
                    END; 
                    $$ LANGUAGE plpgsql;
                CREATE TRIGGER decrease_num_hotels 
                BEFORE DELETE ON hotel.hotel FOR EACH ROW 
                EXECUTE PROCEDURE hotel.decrease_num_hotels()
                ''')

            # function to determine how many rooms of a specific type are occupied over a given date range
            # for example if the total_number_rooms is 100, and max_occupancy is 100, then the room is booked up
            curs.execute('''
                CREATE OR REPLACE FUNCTION 
                    hotel.max_occupancy(new_check_in DATE, new_check_out DATE, new_type_ID INTEGER)
                RETURNS INTEGER AS
                    $$
                    DECLARE day DATE;
                    DECLARE current_max INTEGER DEFAULT 0;
                    DECLARE current INTEGER;
                    BEGIN
                    FOR day IN (SELECT d.day::DATE FROM generate_series(new_check_in, new_check_out - 1, 
                            INTERVAL '1 day') AS d(day)) LOOP
                        current = (SELECT COUNT(*) FROM hotel.room_booking r WHERE r.type_ID = new_type_ID
                        AND (r.status_id = 1 OR r.status_id = 2)
                        AND r.check_in_day <= day AND day < r.check_out_day);
                        IF current > current_max THEN
                            current_max = current;
                        END IF;
                    END LOOP;
                    RETURN current_max;
                    END;
                    $$ LANGUAGE plpgsql;
                ''')

            # trigger function to prevent rooms from being overbooked
            # a room is considered occupied today if it is booked tonight (from today to tomorrow)
            curs.execute('''
                CREATE FUNCTION hotel.prevent_overbook() RETURNS TRIGGER AS
                    $$ 
                    BEGIN 
                        IF hotel.max_occupancy(NEW.check_in_day, NEW.check_out_day, NEW.type_ID) >=
                                (SELECT t.total_number_rooms FROM hotel.hotel_room_type t WHERE t.type_ID = NEW.type_ID)
                            THEN RAISE EXCEPTION 'This room is already booked up over these dates. type_ID=%s,
                                check_in_day=%s, check_out_day=%s', NEW.type_ID, NEW.check_in_day, NEW.check_out_day;
                        END IF;
                        RETURN NEW;
                    END; 
                    $$ LANGUAGE plpgsql;
                CREATE TRIGGER prevent_overbook 
                BEFORE INSERT ON hotel.room_booking FOR EACH ROW 
                EXECUTE PROCEDURE hotel.prevent_overbook()
                ''')

            # trigger function to update the current rooms_available for a certain room type
            curs.execute('''
                CREATE FUNCTION hotel.update_availability() RETURNS TRIGGER AS
                    $$ 
                    BEGIN 
                        UPDATE hotel.hotel_room_type SET rooms_available = total_number_rooms - 
                            hotel.max_occupancy(CURRENT_DATE, DATE (CURRENT_DATE + INTERVAL '1 day'), type_ID);
                        RETURN NEW;
                    END; 
                    $$ LANGUAGE plpgsql;
                CREATE TRIGGER update_availability 
                AFTER INSERT OR UPDATE ON hotel.room_booking FOR EACH ROW 
                EXECUTE PROCEDURE hotel.update_availability()
                ''')

            # function to correct room status for a customer if it has not been updated
            curs.execute('''
                CREATE OR REPLACE FUNCTION hotel.correct_status_customer(cust_sin VARCHAR(11))
                RETURNS VOID AS
                    $$
                    BEGIN
                    UPDATE hotel.room_booking SET status_ID = 3 WHERE customer_sin = cust_sin
                    AND status_id = 2 AND CURRENT_DATE > check_out_day;
                    UPDATE hotel.room_booking SET status_ID = 4 WHERE customer_sin = cust_sin
                    AND status_id = 1 AND CURRENT_DATE >= check_out_day;
                    UPDATE hotel.room_booking SET status_ID = 1 WHERE customer_sin = cust_sin
                    AND status_id = 2 AND CURRENT_DATE < check_in_day;
                    END;
                    $$ LANGUAGE plpgsql;
                ''')
            conn.commit()

            # function to correct room status for a hotel if it has not been updated
            curs.execute('''
                CREATE OR REPLACE FUNCTION hotel.correct_status_hotel(h_ID INTEGER)
                RETURNS VOID AS
                    $$
                    BEGIN
                    UPDATE hotel.room_booking SET status_ID = 3 WHERE hotel_ID = h_ID
                    AND status_id = 2 AND CURRENT_DATE > check_out_day;
                    UPDATE hotel.room_booking SET status_ID = 4 WHERE hotel_ID = h_ID
                    AND status_id = 1 AND CURRENT_DATE > check_out_day;
                    UPDATE hotel.room_booking SET status_ID = 1 WHERE hotel_ID = h_ID
                    AND status_id = 2 AND CURRENT_DATE < check_in_day;
                    END;
                    $$ LANGUAGE plpgsql;
                ''')
            conn.commit()


def populate(conn):
    with conn:
        with conn.cursor() as curs:
            hotel_id = 0
            for i in range(len(hotel_data.hotel_brands)):
                brand = hotel_data.hotel_brands[i]
                temp_hotels_data[i] = [None] * len(hotel_data.hotels[i])
                curs.execute('INSERT INTO hotel.hotel_brand(name, main_office_address, email_address, phone_number) '
                             "VALUES ('{}', '{}', '{}', '{}')"
                             .format(brand[0], brand[1], brand[2], brand[3]))

                for j in range(len(hotel_data.hotels[i])):
                    hotel_id += 1
                    hotel = hotel_data.hotels[i][j]
                    curs.execute('INSERT INTO hotel.hotel(brand_ID, physical_address, number_of_rooms, star_category,'
                                 'email_address, phone_number) '
                                 "VALUES ('{}', '{}', '{}', '{}', '{}', '{}')"
                                 .format(i + 1, hotel[0], hotel[1], hotel[2], hotel[3], hotel[4]))

                    populate_hotel(i, j, curs, hotel_id)

            for k in range(random.randint(200, 300)):
                rand_brand = random.randrange(0, len(hotel_data.hotel_brands))
                hotel = hotel_data.hotels[rand_brand][random.randrange(0, len(hotel_data.hotel_brands[rand_brand]))]
                customer_sin = new_sin()
                customer_name = random.choice(hotel_data.names)
                customer_name_parts = customer_name.lower().split(' ')
                customer_email = customer_name_parts[0] + '.' + customer_name_parts[1] + '@' + random.choice(
                    hotel_data.email_providers)
                customer_phone = '{} ({}{}{}) {}{}{}-{}{}{}{}'.format(1, random.randint(1, 9), random.randint(0, 9),
                                                                      random.randint(0, 9), random.randint(0, 9),
                                                                      random.randint(0, 9), random.randint(0, 9),
                                                                      random.randint(0, 9), random.randint(0, 9),
                                                                      random.randint(0, 9), random.randint(0, 9))
                curs.execute(
                    """INSERT INTO hotel.customer(customer_SIN, customer_name, customer_address, customer_email,
                    customer_phone) VALUES ('{}', '{}', '{}', '{}', '{}')"""
                        .format(customer_sin, customer_name, generate_address(hotel[0]), customer_email,
                                customer_phone))

                generate_room_bookings(conn, curs, customer_sin)

            conn.commit()


def generate_room_bookings(conn, curs, customer_sin):
    conn.commit()
    for i in range(0, random.randrange(20, 40)):
        rand_hotel_brand = random.randrange(0, len(hotel_data.hotel_brands))
        rand_hotel = random.randrange(0, len(hotel_data.hotels[rand_hotel_brand]))
        temp_hotel_data = temp_hotels_data[rand_hotel_brand][rand_hotel]
        type_index = random.randrange(0, len(temp_hotel_data[1]))
        type_id = temp_hotel_data[1][type_index]

        registration_date = datetime.today() - timedelta(days=random.randrange(1, 70))
        check_in = registration_date + timedelta(days=random.randrange(1, 140))
        check_out = check_in + timedelta(days=random.randint(1, 10))
        status_id = random.randint(1, 4)

        use_employee_sin = status_id > 1
        # for testing purposes, 50% chance that a prebooked room was booked by an employee
        if not use_employee_sin:
            use_employee_sin = random.randint(1, 2) == 1

        try:
            if use_employee_sin:
                rand_e_sin = random.choice(temp_hotel_data[0])
                curs.execute('INSERT INTO hotel.room_booking(type_ID, hotel_ID, employee_sin, customer_sin,'
                             'date_of_registration, check_in_day, check_out_day, status_ID) '
                             "VALUES ('{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}')"
                             .format(type_id, temp_hotel_data[2], rand_e_sin, customer_sin, registration_date, check_in,
                                     check_out, status_id))
            else:
                curs.execute('INSERT INTO hotel.room_booking(type_ID, hotel_ID, customer_sin, '
                             'date_of_registration, check_in_day, check_out_day, status_ID) '
                             "VALUES ('{}', '{}', '{}', '{}', '{}', '{}', '{}')"
                             .format(type_id, temp_hotel_data[2], customer_sin, registration_date, check_in,
                                     check_out, status_id))

        except psycopg2.DatabaseError as e:
            # skip expected error message from overbooked rooms
            if 'This room is already booked up' in str(e):
                conn.rollback()
                continue
            print(e)
            conn.rollback()
            continue

        conn.commit()


def populate_hotel(brand_index, hotel_index, curs, hotel_id):
    hotel = hotel_data.hotels[brand_index][hotel_index]
    employee_sins = []
    type_ids = []

    # general manager must be inserted first to satisfy trigger constraint
    curs.execute('INSERT INTO hotel.employee(employee_SIN, hotel_ID, employee_name, employee_address, salary,'
                 'job_title)'
                 "VALUES ('{}', '{}', '{}', '{}', '{}', '{}')"
                 .format(new_sin(), hotel_id, random.choice(hotel_data.names), generate_address(hotel[0]),
                         random_salary(), 'Manager'))

    for k in range(random.randint(5, 20)):
        e_sin = new_sin()
        employee_sins.append(e_sin)
        curs.execute('INSERT INTO hotel.employee(employee_SIN, hotel_ID, employee_name, employee_address, salary,'
                     'job_title)'
                     "VALUES ('{}', '{}', '{}', '{}', '{}', '{}')"
                     .format(e_sin, hotel_id, random.choice(hotel_data.names), generate_address(hotel[0]),
                             random_salary(), random.choice(hotel_data.job_titles)))
    num_rooms = hotel[1]

    global current_type_id
    while num_rooms > 0:
        type_ids.append(current_type_id)
        current_type_id += 1

        num_room_type = int(0.8 * (hotel[1] / 6) * (1 + random.randint(0, 40) / 100))
        if num_rooms - num_room_type < 0:
            num_room_type = num_rooms

        num_rooms -= num_room_type
        room_index = random.randrange(0, len(hotel_data.room_titles))
        price = "{:.2f}".format(((hotel[2] - 1) * 70 + (room_index + 1) * 70 + random.randint(0, 10000) / 100) / 2.5)
        amenities = to_pg_array(random.sample(hotel_data.room_amenities, random.randint(0, 6)))
        view = random.randint(1, 4)

        curs.execute('INSERT INTO hotel.hotel_room_type(hotel_ID, title, price, amenities, room_capacity, view_ID,'
                     'is_extendable, total_number_rooms, rooms_available) '
                     "VALUES ('{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}', '{}')"
                     .format(hotel_id, hotel_data.room_titles[room_index], price, amenities,
                             hotel_data.room_capacities[room_index], view, bool(random.getrandbits(1)),
                             num_room_type, num_room_type))

    data = [employee_sins, type_ids, hotel_id]
    temp_hotels_data[brand_index][hotel_index] = data


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
           + components[2] + ', ' + generate_postal_or_zip(components[4]) + ',' + components[4]


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
