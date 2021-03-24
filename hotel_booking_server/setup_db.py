import random
import string
from datetime import datetime, timedelta

import psycopg2

from hotel_booking_server import hotel_data
from hotel_booking_server.routes import get_results

sins = set()
# Given brand_index and hotel_index, return array of [employee[], type_ID[], hotel_id]
temp_hotels_data = [[], [], [], [], [], []]
current_type_id = 1


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


def setup(conn, data_mode):
    if data_mode == 'random':
        print('Creating tables...')
        create_empty(conn)
        print('Populating tables with random generation (this may take a while)...')
        populate(conn)
        sins.clear()
        temp_hotels_data.clear()
    elif data_mode == 'example':
        print('Creating schema from example file')
        with conn:
            with conn.cursor() as curs:
                curs.execute(open("sql/hotel_db_example.sql", "r").read())
                conn.commit()
    elif data_mode == 'empty':
        print('Creating empty schema and tables')
        create_empty(conn)
    else:
        raise Exception('Invalid data mode')
    print('Done.')


def create_empty(conn):
    with conn:
        with conn.cursor() as curs:
            curs.execute(open("sql/hotel_db_empty.sql", "r").read())
            conn.commit()


def setup_if_missing(conn, data_mode):
    results = get_results("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'hotel'", conn,
                          jsonify=False)
    if len(results) == 0:
        print("Schema is empty! Generating...")
        setup(conn, data_mode)
