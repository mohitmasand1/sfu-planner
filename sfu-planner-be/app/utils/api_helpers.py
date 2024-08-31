import requests
import datetime
import pytz
from dateutil.rrule import rrule, WEEKLY
from dateutil.parser import parse
from constants.days import days_mapping
from constants.holidays import bc_holidays_2024
import os
from dotenv import load_dotenv

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
                    lectures[associated_class]['labs'].append(cls)
                elif cls['sectionCode'] == 'TUT':
                    lectures[associated_class]['tutorials'].append(cls)

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
        }
    
    schedule = data['courseSchedule']
    events = create_events(schedule)
    formatted_data['schedule'] = events

    return formatted_data

def create_events(course_schedule):
    events = []
    timezone = pytz.timezone('America/Vancouver')  # Specific to BC, Canada
    for course in course_schedule:
        start_date = parse(course.get('startDate', ''))
        end_date = parse(course.get('endDate', ''))
        start_date = timezone.localize(start_date)
        end_date = timezone.localize(end_date)
        start_time = datetime.datetime.strptime(course.get('startTime', ''), '%H:%M').time()
        end_time = datetime.datetime.strptime(course.get('endTime', ''), '%H:%M').time()
        days = course.get('days', '').replace(',', '').split()
        rrule_days = [days_mapping[day] for day in days]

        for dt in rrule(freq=WEEKLY, byweekday=rrule_days, dtstart=start_date, until=end_date):
            event_date = dt.date()
            if event_date not in bc_holidays_2024:
                event_start = datetime.datetime.combine(event_date, start_time, dt.tzinfo)
                event_end = datetime.datetime.combine(event_date, end_time, dt.tzinfo)
                events.append({
                    'campus': course.get('campus', 'Burnaby'),
                    'sectionCode': course.get('sectionCode', ''),
                    'start': event_start.isoformat(),
                    'end': event_end.isoformat()
                })

    return events

def process_course_number_and_section_data(course_number_data, year, term, major, course_number):
    nested_classes = process_course_number_data(course_number_data)

    for cls in nested_classes:
        section = cls['text']
        section_data = fetch_data_from_api(f"{SFU_API_BASE_URL}{year}/{term}/{major}/{course_number}/{section}")
        specific_data = process_course_section_data(section_data)
        cls['specificData'] = specific_data

        for lab in cls.get('labs', []):
            lab_section = lab['text']
            lab_section_data = fetch_data_from_api(f"{SFU_API_BASE_URL}{year}/{term}/{major}/{course_number}/{lab_section}")
            lab_specific_data = process_course_section_data(lab_section_data)
            lab['specificData'] = lab_specific_data

        for tut in cls.get('tutorials', []):
            tut_section = tut['text']
            tut_section_data = fetch_data_from_api(f"{SFU_API_BASE_URL}{year}/{term}/{major}/{course_number}/{tut_section}")
            tut_specific_data = process_course_section_data(tut_section_data)
            tut['specificData'] = tut_specific_data

    return nested_classes