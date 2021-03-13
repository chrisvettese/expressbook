hotel_brands = [['Marriott', '7750 Wisconsin Ave, Bethesda, Maryland, 20814, United States', 'contact@marriott.com', '1 (800) 535-4028', 6],
                ['Fairmont', '100 Front St W, Toronto, Ontario, M5J 1E3, Canada', 'help@fairmont.com', '1 (800) 123-4567', 7],
                ['Holiday Inn', '1 Church St, Chalvey, Slough, SL1 2NH, United Kingdom', 'service@holidayinn.com', '1 (416) 355-3890', 5],
                ['Hilton', '7930 Jones Branch Dr, McLean, Virginia, 22102, United States', 'support@hilton.com', '1 (712) 899-6060', 5],
                ['Days Inn', '3159 Route 46, Parsippany-Troy Hills, New Jersey, 07054, United States', 'contact@daysinn.com', '1 (973) 939-4875', 5],
                ['Best Western', '1615 E Northern Ave, Phoenix, Arizona, 85020, United States', 'contact@bestwestern.com', '1 (800) 555-9876', 5]]

hotels = [[['4251 Sheppard Ave, Toronto, Ontario, M1S 1T4, Canada', 200, 3, 'to@marriott.com', '1 (726) 824-2393'],
           ['1122 Port Washington Road, Caroline, Alberta, T0M 0M0, Canada', 150, 4, 'ca@marriott.com', '1 (333) 886-4175'],
           ['465 René-Lévesque Blvd, Montreal, Quebec, H3B 4W8, Canada', 125, 3, 'mt@marriott.com', '1 (747) 516-9536'],
           ['1622 Sixth Street, New Westminster, British Columbia, V3L 3C1, Canada', 315, 4, 'nw@marriott.com', '1 (540) 601-1386'],
           ['3951 Wyecroft Road, Burlington, Ontario, L7R 3X7, Canada', 280, 2, 'br@marriott.com', '1 (562) 815-2146'],
           ['2429 Albert Street, St Thomas, Ontario, N5R 3R5, Canada', 300, 2, 'st@marriott.com', '1 (987) 713-4888']],

          [['4587 Pearl Street, Streetsville, Ontario, L5M 1X2, Canada', 400, 1, 'ps@fairmont.com', '1 (716) 455-3299'],
           ['4483 Jade Street, North Vancouver, British Columbia, V7L 2C1, Canada', 800, 5, 'nv@fairmont.com', '1 (710) 958-3327'],
           ['759 rue de la Gauchetière, Montreal, Quebec, H3B 2M3, Canada', 750, 3, 'mt@fairmont.com', '1 (236) 567-5601'],
           ['2835 Nelson Street, Nobel, Ontario, P0G 1G0, Canada', 425, 3, 'nb@fairmont.com', '1 (479) 978-1199'],
           ['3559 Pick Street, Cheyenne, Colorado, 82001, United States', 290, 3, 'cy@fairmont.com', '1 (447) 639-7539'],
           ['150 Desert Broom Court, Red Bank, New Jersey, 07701, United States', 550, 4, 'rb@fairmont.com', '1 (427) 436-8020'],
           ['3579 Hawks Nest Lane, Maryland Heights, Missouri, 63141, United States', 630, 4, 'mh@fairmont.com', '1 (964) 917-9404']],

          [['4116 Boring Lane, San Francisco, California, 94107, United States', 580, 2, 'sf@holidayinn.com', '1 (855) 995-4315'],
           ['814 Musgrave Street, Atlanta, Georgia, 30303, United States', 640, 2, 'al@holidayinn.com', '1 (531) 944-9107'],
           ['3587 Inkerman Road, Breadalbane, Prince Edward Island, C0A 1E0, Canada', 80, 1, 'bd@holidayinn.com', '1 (316) 593-7307'],
           ['1592 River Street, Port Elgin, Ontario, N0N 2C4, Canada', 90, 1, 'pe@holidayinn.com', '1 (744) 890-1645'],
           ['2175 MacLaren Street, Ottawa, Ontario, K1P 5M7, Canada', 120, 3, 'ot@holidayinn.com', '1 (313) 646-0819']],

          [['4046 40th Street, Calgary, Alberta, T2M 0G6, Canada', 150, 4, 'cl@hilton.com', '1 (483) 407-9782'],
           ['725 Isaacs Creek Road, Liberty, Mississippi, 39645, United States', 180, 4, 'lb@hilton.com', '1 (575) 670-9408'],
           ['4823 Marietta Street, Fremont, California, 94539, United States', 230, 5, 'fr@hilton.com', '1 (275) 566-6438'],
           ['4482 Playfair Avenue, Toronto, Ontario, M4J 3S3, Canada', 220, 3, 'to@hilton.com', '1 (790) 419-0808'],
           ['583 Dundas Street, London, Ontario, N6B 3L5, Canada', 240, 4, 'ld@hilton.com', '1 (537) 456-1729']],

          [['33 Nicholas St, Ottawa, Ontario, K1N9M7, Canada', 350, 2, 'ot@daysinn.com', '1 (469) 765-3229'],
           ['2360 Scotts Lane, Chemainus, British Columbia, V0R 1K0, Canada', 459, 2, 'cm@daysinn.com', '1 (491) 839-3298'],
           ['4820 Bassell Avenue, Austin, Texas, 78764, United States', 160, 3, 'au@daysinn.com', '1 (760) 355-4122'],
           ['1656 Taylor Street, New York City, New York, 10007, United States', 165, 1, 'ny@daysinn.com', '1 (659) 303-2926'],
           ['3737 Eastland Avenue, Canton, Mississippi, 39048, United States', 170, 2, 'cn@daysinn.com', '1 (321) 916-3951']],

          [['100 Retreat Avenue, Charlotte, North Carolina, 28211, United States', 80, 5, 'nc@bestwestern.com', '1 (469) 765-3229'],
           ['597 Green Avenue, Alameda, California, 94501, United States', 90, 5, 'am@bestwestern.com', '1 (491) 839-3298'],
           ['1920 King George Hwy, Surrey, British Columbia, V3W 4E3, Canada', 77, 4, 'sr@bestwestern.com', '1 (760) 355-4122'],
           ['3105 Reserve St, Eganville, Ontario, K0J 1T0, Canada', 30, 4, 'ev@bestwestern.com', '1 (659) 303-2926'],
           ['1 Rideau St, Ottawa, Ontario, K1N 8S7, Canada', 45, 3, 'ot@bestwestern.com', '1 (321) 916-3951']]]

names = open('hotel_booking_server/names.txt').read().split('\n')

streets = open('hotel_booking_server/streets.txt').read().split('\n')

job_titles = ['Front Desk Supervisor', 'Guest Relations Organizer', 'Hotel Receptionist', 'Reservations Agent', 'Guest Services Associate']

room_titles = ['Single', 'Double', 'Triple', 'Queen', 'King', 'Studio', 'Executive Suite', 'Penthouse Suite', 'One Bedroom Loft', 'Two Bedroom Loft']
room_capacities = [2, 3, 3, 3, 4, 4, 5, 6, 7, 8]
room_amenities = ['Kitchen', 'Free Breakfast', 'Air Conditioning', 'Free Wi-Fi', 'Fitness Centre', 'Free Parking', 'Balcony', 'Mini Fridge']
