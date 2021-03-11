def table_creation(conn):
    with conn:
        with conn.cursor() as curs:
            curs.execute('DROP SCHEMA IF EXISTS hotel CASCADE')
            curs.execute('CREATE SCHEMA hotel')
            curs.execute('CREATE TABLE hotel.hotel_brand('
                         'brand_ID SERIAL,'
                         'main_office_address VARCHAR(255) NOT NULL,'
                         'name VARCHAR(255) NOT NULL,'
                         'email_address VARCHAR(255) NOT NULL,'
                         'phone_number VARCHAR(20) NOT NULL,'
                         'number_of_hotels INTEGER)')
            conn.commit()


def setup(conn):
    table_creation(conn)
