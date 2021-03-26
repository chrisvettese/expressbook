SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP SCHEMA IF EXISTS hotel CASCADE;

CREATE SCHEMA hotel;

create table hotel.hotel_brand
(
    brand_id            serial            not null
        constraint hotel_brand_pkey
            primary key,
    name                varchar(255)      not null,
    main_office_address varchar(255)      not null,
    email_address       varchar(255)      not null,
    phone_number        varchar(20)       not null,
    number_of_hotels    integer default 0 not null
);

alter table hotel.hotel_brand
    owner to postgres;

create table hotel.hotel
(
    hotel_id         serial       not null
        constraint hotel_pkey
            primary key,
    brand_id         serial       not null
        constraint hotel_brand_id_fkey
            references hotel.hotel_brand
            on delete cascade,
    physical_address varchar(255) not null,
    number_of_rooms  integer      not null,
    star_category    smallint     not null
        constraint hotel_star_category_check
            check ((star_category >= 1) AND (star_category <= 5)),
    email_address    varchar(255) not null,
    phone_number     varchar(20)  not null
);

alter table hotel.hotel
    owner to postgres;

create table hotel.employee_status
(
    status_id smallint    not null
        constraint employee_status_pkey
            primary key,
    status    varchar(20) not null
);

alter table hotel.employee_status
    owner to postgres;

create table hotel.employee
(
    employee_sin     varchar(11)        not null
        constraint employee_pkey
            primary key,
    hotel_id         serial             not null
        constraint employee_hotel_id_fkey
            references hotel.hotel
            on delete cascade,
    employee_name    varchar(255)       not null,
    employee_address varchar(255)       not null,
    salary           varchar(15)        not null,
    job_title        varchar(255)       not null,
    status_id        smallint default 1 not null
        constraint employee_status_id_fkey
            references hotel.employee_status
);

alter table hotel.employee
    owner to postgres;

create table hotel.customer
(
    customer_sin     varchar(11)  not null
        constraint customer_pkey
            primary key,
    customer_name    varchar(255) not null,
    customer_address varchar(255) not null,
    customer_email   varchar(255) not null,
    customer_phone   varchar(20)  not null
);

alter table hotel.customer
    owner to postgres;

create table hotel.view_type
(
    view_id smallint    not null
        constraint view_type_pkey
            primary key,
    view    varchar(20) not null
);

alter table hotel.view_type
    owner to postgres;

create table hotel.hotel_room_type
(
    type_id            serial       not null
        constraint hotel_room_type_pkey
            primary key,
    hotel_id           serial       not null
        constraint hotel_room_type_hotel_id_fkey
            references hotel.hotel
            on delete cascade,
    title              varchar(255) not null,
    price              varchar(15)  not null,
    amenities          varchar(255)[],
    room_capacity      smallint     not null,
    view_id            smallint     not null
        constraint hotel_room_type_view_id_fkey
            references hotel.view_type,
    is_extendable      boolean,
    total_number_rooms smallint     not null,
    rooms_available    smallint     not null
);

alter table hotel.hotel_room_type
    owner to postgres;

create table hotel.booking_status
(
    status_id smallint    not null
        constraint booking_status_pkey
            primary key,
    value     varchar(20) not null
);

alter table hotel.booking_status
    owner to postgres;

create table hotel.room_booking
(
    booking_id           serial                        not null
        constraint room_booking_pkey
            primary key,
    type_id              serial                        not null
        constraint room_booking_type_id_fkey
            references hotel.hotel_room_type,
    hotel_id             serial                        not null
        constraint room_booking_hotel_id_fkey
            references hotel.hotel
            on delete cascade,
    employee_sin         varchar(11)
        constraint room_booking_employee_sin_fkey
            references hotel.employee
            on update cascade,
    customer_sin         varchar(11)                   not null
        constraint room_booking_customer_sin_fkey
            references hotel.customer
            on update cascade,
    date_of_registration date     default CURRENT_DATE not null,
    check_in_day         date                          not null,
    check_out_day        date                          not null,
    status_id            smallint default 1            not null
        constraint room_booking_status_id_fkey
            references hotel.booking_status
);

alter table hotel.room_booking
    owner to postgres;

create function hotel.require_hotel_manager() returns trigger
    language plpgsql
as
$$
BEGIN
    IF
(CAST((SELECT COUNT(*)
              FROM hotel.employee e
              WHERE e.hotel_ID = NEW.hotel_ID
                AND e.job_title = 'Manager') AS INTEGER) = 0) THEN
        RAISE EXCEPTION 'Hotel must have employee with job title "Manager"
                        before other employees can be hired.';
END IF;
RETURN NEW;
END;
$$;

alter function hotel.require_hotel_manager() owner to postgres;

create trigger require_hotel_manager
    before insert
    on hotel.employee
    for each row
    when (new.job_title::text <> 'Manager'::text)
execute procedure hotel.require_hotel_manager();

create function hotel.increase_num_hotels() returns trigger
    language plpgsql
as
$$
BEGIN
UPDATE hotel.hotel_brand
SET number_of_hotels = number_of_hotels + 1
WHERE NEW.brand_id = brand_id;
RETURN NEW;
END;
$$;

alter function hotel.increase_num_hotels() owner to postgres;

create trigger increase_num_hotels
    after insert
    on hotel.hotel
    for each row
    execute procedure hotel.increase_num_hotels();

create function hotel.decrease_num_hotels() returns trigger
    language plpgsql
as
$$
BEGIN
UPDATE hotel.hotel_brand
SET number_of_hotels = number_of_hotels - 1
WHERE NEW.brand_id = brand_id;
RETURN OLD;
END;
$$;

alter function hotel.decrease_num_hotels() owner to postgres;

create trigger decrease_num_hotels
    before delete
    on hotel.hotel
    for each row
    execute procedure hotel.decrease_num_hotels();

create function hotel.max_occupancy(new_check_in date, new_check_out date, new_type_id integer) returns integer
    language plpgsql
as
$$
DECLARE
day                 DATE;
    DECLARE
current_max INTEGER DEFAULT 0;
    DECLARE
current     INTEGER;
BEGIN
FOR day IN (SELECT d.day::DATE
                FROM generate_series(new_check_in, new_check_out - 1,
                                     INTERVAL '1 day') AS d(day))
        LOOP
            current = (SELECT COUNT(*)
                       FROM hotel.room_booking r
                       WHERE r.type_ID = new_type_ID
                         AND (r.status_id = 1 OR r.status_id = 2)
                         AND r.check_in_day <= day
                         AND day < r.check_out_day);
            IF
current > current_max THEN
                current_max = current;
END IF;
END LOOP;
RETURN current_max;
END;
$$;

alter function hotel.max_occupancy(date, date, integer) owner to postgres;

create function hotel.prevent_overbook() returns trigger
    language plpgsql
as
$$
BEGIN
    IF
hotel.max_occupancy(NEW.check_in_day, NEW.check_out_day, NEW.type_ID) >=
       (SELECT t.total_number_rooms FROM hotel.hotel_room_type t WHERE t.type_ID = NEW.type_ID)
    THEN
        RAISE EXCEPTION 'This room is already booked up over these dates. type_ID=%s,
                                check_in_day=%s, check_out_day=%s', NEW.type_ID, NEW.check_in_day, NEW.check_out_day;
END IF;
RETURN NEW;
END;
$$;

alter function hotel.prevent_overbook() owner to postgres;

create trigger prevent_overbook
    before insert
    on hotel.room_booking
    for each row
    execute procedure hotel.prevent_overbook();

create function hotel.update_availability() returns trigger
    language plpgsql
as
$$
BEGIN
UPDATE hotel.hotel_room_type
SET rooms_available = total_number_rooms -
                      hotel.max_occupancy(CURRENT_DATE, DATE(CURRENT_DATE + INTERVAL '1 day'), type_ID);
RETURN NEW;
END;
$$;

alter function hotel.update_availability() owner to postgres;

create trigger update_availability
    after insert or
update
    on hotel.room_booking
    for each row
    execute procedure hotel.update_availability();

create function hotel.correct_status_customer(cust_sin character varying) returns void
    language plpgsql
as
$$
BEGIN
UPDATE hotel.room_booking
SET status_ID = 3
WHERE customer_sin = cust_sin
  AND status_id = 2
  AND CURRENT_DATE > check_out_day;
UPDATE hotel.room_booking
SET status_ID = 4
WHERE customer_sin = cust_sin
  AND status_id = 1
  AND CURRENT_DATE >= check_out_day;
UPDATE hotel.room_booking
SET status_ID = 1
WHERE customer_sin = cust_sin
  AND status_id = 2
  AND CURRENT_DATE < check_in_day;
END;
$$;

alter function hotel.correct_status_customer(varchar) owner to postgres;

create function hotel.correct_status_hotel(h_id integer) returns void
    language plpgsql
as
$$
BEGIN
UPDATE hotel.room_booking
SET status_ID = 3
WHERE hotel_ID = h_ID
  AND status_id = 2
  AND CURRENT_DATE > check_out_day;
UPDATE hotel.room_booking
SET status_ID = 4
WHERE hotel_ID = h_ID
  AND status_id = 1
  AND CURRENT_DATE >= check_out_day;
UPDATE hotel.room_booking
SET status_ID = 1
WHERE hotel_ID = h_ID
  AND status_id = 2
  AND CURRENT_DATE < check_in_day;
END;
$$;

alter function hotel.correct_status_hotel(integer) owner to postgres;

