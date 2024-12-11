import requests
import datetime
import pytz
from dateutil.rrule import rrule, WEEKLY
from dateutil.parser import parse
from constants.days import days_mapping
from constants.holidays import bc_holidays_2024
import os
from dotenv import load_dotenv
import uuid

load_dotenv()
SFU_API_BASE_URL = os.getenv('SFU_API_BASE_URL')

def parse_custom_date(date_str):
    # Extract the timezone abbreviation and date-time part
    parts = date_str.rsplit(' ', 1)
    date_part = parts[0]  # 'Wed Sep 07 00:00:00 PDT'
    year = parts[1]       # '2022'

    # Remove the timezone abbreviation (last three characters before the year)
    datetime_str = date_part[:-4].strip() + " " + year
    
    # Parse datetime without the timezone
    dt = datetime.datetime.strptime(datetime_str, '%a %b %d %H:%M:%S %Y')

    # Handle the timezone manually (PDT as example, UTC-7)
    # Convert to UTC by adding 7 hours
    utc_dt = dt - datetime.timedelta(hours=7)

    # Add UTC timezone information
    utc_dt = pytz.utc.localize(utc_dt)

    return utc_dt.isoformat()

def parse_term_code(term_code):
    # Extract the year and term code suffix from the term code string
    year_suffix = int(term_code[1:3])
    term_suffix = term_code[3]

    # Determine the full year (assumes current century)
    current_year = datetime.datetime.now().year
    century = current_year // 100 * 100
    year = century + year_suffix

    # Adjust for century transition if necessary
    if year > current_year + 10:  # Allows for a 10 year buffer into the future
        year -= 100

    # Determine the term based on the suffix
    if term_suffix >= '1' and term_suffix <= '3':
        term = 'spring'
    elif term_suffix >= '4' and term_suffix <= '6':
        term = 'summer'
    elif term_suffix >= '7' and term_suffix <= '9':
        term = 'fall'
    else:
        return "Invalid term code"

    return year, term

def fetch_data_from_api(url):
    """Fetch data from an external API."""
    response = requests.get(url)
    response.raise_for_status()  # Raises an HTTPError for bad responses
    return response.json()

def process_course_number_data(data):
    lectures = {}
    nested_classes = []

    # Group lectures
    for cls in data:
        if cls['sectionCode'] != 'TUT' and cls['sectionCode'] != 'LAB':
            lectures[cls['associatedClass']] = cls
            lectures[cls['associatedClass']]['labs'] = []
            lectures[cls['associatedClass']]['tutorials'] = []

    # Group labs and tutorials under corresponding lectures
    for cls in data:
        if cls['sectionCode'] == 'LAB' or cls['sectionCode'] == 'TUT':
            associated_class = cls['associatedClass']
            if associated_class in lectures:
                if cls['sectionCode'] == 'LAB':
                    lectures[associated_class]['labs'].append(cls['text'])
                elif cls['sectionCode'] == 'TUT':
                    lectures[associated_class]['tutorials'].append(cls['text'])

    # Convert lectures dictionary back to list
    nested_classes = list(lectures.values())

    return nested_classes

def process_course_section_data(data):
    formatted_data = {}
    formatted_data['professor'] = []
    formatted_data['schedule'] = []
    formatted_data['info'] = {}
    formatted_data['requiredText'] = data.get('requiredText', [])

    instructor = data.get('instructor', [])
    for i in range(len(instructor)):
        formatted_data['professor'].append({
            'firstName': instructor[i]['firstName'],
            'lastName': instructor[i]['lastName'],
            'name' : instructor[i]['name'],
        })

    info = data.get('info', {})
    formatted_data['info'] = {
            'description': info.get('description', None),
            'deliveryMethod': info.get('deliveryMethod', None),
            'section': info.get('section', None),
            'term': info.get('term', None),
            'prerequisites': info.get('prerequisites', None),
            'designation': info.get('designation', None),
            'title': info.get('title', None),
            'name': info.get('dept', None) + ' ' + info.get('number', None),
            'major': info.get('dept', None),
            'number': info.get('number', None),
            'units': info.get('units', None),
            'corequisites': info.get('corequisites', None),
            'path': f"https://www.sfu.ca/outlines.html?{info.get('outlinePath', None)}",
        }

    return formatted_data

def process_lab_tut_section_data(data):
    formatted_data = {}
    formatted_data['lectures'] = []
    schedule = data.get('courseSchedule', [])
    events = create_events(schedule)
    section = data.get('info', {}).get('section', '')

    # Add 'section' field to each event
    for event in events:
        event['section'] = section
    formatted_data = events

    return formatted_data

def remove_duplicates(events):
    unique_events = {}
    
    for event in events:
        day = int(event['day'])
    
        start_time_str = event['startTime'].strip()
        end_time_str = event['endTime'].strip()
    
        # Parse the times into datetime objects
        start_time_dt = datetime.datetime.fromisoformat(start_time_str)
        end_time_dt = datetime.datetime.fromisoformat(end_time_str)
    
        # Extract hour and minute components
        start_hour = start_time_dt.hour
        start_minute = start_time_dt.minute
        end_hour = end_time_dt.hour
        end_minute = end_time_dt.minute
    
        # Create key using day, start hour and minute, end hour and minute
        key = (day, start_hour, start_minute, end_hour, end_minute)
    
        if key not in unique_events:
            # Initialize 'sections' as a list with the current section
            event['sections'] = [event.get('section')]
            # Update 'section' field to include the current section code
            event['section'] = event.get('section')
            unique_events[key] = event
        else:
            # Duplicate found; append the 'section' to the existing event's 'sections' list
            existing_event = unique_events[key]
            existing_event['sections'].append(event.get('section'))
            # Update 'section' field to include all section codes
            existing_event['section'] = '/'.join(existing_event['sections'])
    
    # Return the list of unique events
    return list(unique_events.values())

# days_mapping = {
#     'Mo': 0,  # Monday
#     'Tu': 1,  # Tuesday
#     'We': 2,  # Wednesday
#     'Th': 3,  # Thursday
#     'Fr': 4,  # Friday
# }

def remove_timezone(date_str):
    parts = date_str.split()
    if len(parts) == 6:
        # Remove the 5th element (timezone abbreviation)
        del parts[4]
        return ' '.join(parts)
    else:
        return date_str

def create_events(courseSchedule):
    day_mapping = {
        'Mo': 1,
        'Tu': 2,
        'We': 3,
        'Th': 4,
        'Fr': 5
    }
    lectures = []

    # Define the fixed timezone offset for PDT (-07:00)
    pdt = datetime.timezone(datetime.timedelta(hours=-7))

    for schedule in courseSchedule:
        # Parse startDate and endDate
        start_date_str = schedule.get('startDate', '')
        end_date_str = schedule.get('endDate', '')

        # Remove timezone from date strings
        start_date_str_no_tz = remove_timezone(start_date_str)
        end_date_str_no_tz = remove_timezone(end_date_str)

        # Convert date strings to datetime objects
        try:
            start_date = datetime.datetime.strptime(start_date_str_no_tz, '%a %b %d %H:%M:%S %Y')
            end_date = datetime.datetime.strptime(end_date_str_no_tz, '%a %b %d %H:%M:%S %Y')
        except ValueError:
            # If date parsing fails, skip this schedule entry
            continue

        # Check if the date range is 0 days
        if start_date.date() == end_date.date():
            # Skip this schedule entry
            continue

        days_str = schedule.get('days', '')
        # Split the 'days' string into a list of day abbreviations
        days = [day.strip() for day in days_str.split(',')]

        # Parse the startTime and endTime strings
        start_time_str = schedule.get('startTime', '')
        end_time_str = schedule.get('endTime', '')

        # Convert startTime and endTime to datetime objects with fixed date and timezone
        try:
            start_time_obj = datetime.datetime.strptime(start_time_str, '%H:%M')
            start_datetime = datetime.datetime(1970, 1, 1, start_time_obj.hour, start_time_obj.minute, tzinfo=pdt)

            end_time_obj = datetime.datetime.strptime(end_time_str, '%H:%M')
            end_datetime = datetime.datetime(1970, 1, 1, end_time_obj.hour, end_time_obj.minute, tzinfo=pdt)
        except ValueError:
            # If time parsing fails, skip this schedule entry
            continue

        # Format datetime objects into ISO8601 strings
        start_iso = start_datetime.isoformat(timespec='seconds')
        end_iso = end_datetime.isoformat(timespec='seconds')

        for day_abbr in days:
            day_number = day_mapping.get(day_abbr)
            if day_number is not None:
                lecture = {
                    'id': uuid.uuid4(),
                    'day': day_number,
                    'startTime': start_iso,
                    'endTime': end_iso,
                }
                lectures.append(lecture)

    return lectures

# def create_events(course_schedule):
#     events = []
#     timezone = pytz.timezone('America/Vancouver')  # Pacific Time Zone

#     # Define the first full week of January 2024 (Monday to Friday)
#     week_start_date = timezone.localize(datetime.datetime(2024, 1, 1))  # Monday, January 1, 2024

#     for course in course_schedule:
#         # Set default start and end times to '00:00' if they are not provided
#         start_time_str = course.get('startTime', '00:00') or '00:00'
#         end_time_str = course.get('endTime', '00:00') or '00:00'
        
#         # Parse the times into datetime.time objects
#         start_time = datetime.datetime.strptime(start_time_str, '%H:%M').time()
#         end_time = datetime.datetime.strptime(end_time_str, '%H:%M').time()
#         days = course.get('days', '').replace(',', '').split()
#         rrule_days = [days_mapping[day] for day in days]

#         for day in rrule_days:
#             # Calculate the exact date for this day in the first week of January 2024
#             event_date = week_start_date + datetime.timedelta(days=day)

#             # Ensure event times are in the correct timezone
#             event_start = timezone.localize(datetime.datetime.combine(event_date, start_time))
#             event_end = timezone.localize(datetime.datetime.combine(event_date, end_time))
            
#             # Check if the event is already in the list to avoid duplicates
#             event_exists = any(e['start'] == event_start.isoformat() and e['end'] == event_end.isoformat() for e in events)
            
#             if not event_exists:
#                 events.append({
#                     'campus': course.get('campus', 'Burnaby'),
#                     'sectionCode': course.get('sectionCode', ''),
#                     'start': event_start.isoformat(),
#                     'end': event_end.isoformat()
#                 })

#     return events

def process_course_number_and_section_data(course_number_data, year, term, major, course_number):
    nested_classes = process_course_number_data(course_number_data)

    for cls in nested_classes:
        section = cls['text']
        section_data = fetch_data_from_api(f"{SFU_API_BASE_URL}{year}/{term}/{major}/{course_number}/{section}")
        specific_data = process_course_section_data(section_data)
        schedule_data = section_data.get('courseSchedule', [])
        events = create_events(schedule_data)
        cls['lectures'] = events
        cls['specificData'] = specific_data

        # Collect all lab events
        all_lab_events = []
        for lab in cls.get('labs', []):
            lab_section = lab
            lab_section_data = fetch_data_from_api(f"{SFU_API_BASE_URL}{year}/{term}/{major}/{course_number}/{lab_section}")
            lab_events = process_lab_tut_section_data(lab_section_data)
            all_lab_events.extend(lab_events)
        # Remove duplicates across all lab events
        cls['labs'] = remove_duplicates(all_lab_events)

        # Collect all tutorial events
        all_tut_events = []
        for tut in cls.get('tutorials', []):
            tut_section = tut
            tut_section_data = fetch_data_from_api(f"{SFU_API_BASE_URL}{year}/{term}/{major}/{course_number}/{tut_section}")
            tut_events = process_lab_tut_section_data(tut_section_data)
            all_tut_events.extend(tut_events)
        # Remove duplicates across all tutorial events
        cls['tutorials'] = remove_duplicates(all_tut_events)

    print(nested_classes)
    return nested_classes