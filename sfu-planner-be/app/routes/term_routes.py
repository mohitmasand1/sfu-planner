from flask import Blueprint, jsonify
import datetime

term_bp = Blueprint('term_bp', __name__)

@term_bp.route("/", methods=["GET"])
def generate_term_codes():
    today = datetime.datetime.today()
    year = today.year
    month = today.month

    if 1 <= month <= 4:
        current_suffix = '1'
        next_suffixes = ['4', '7']
    elif 5 <= month <= 8:
        current_suffix = '4'
        next_suffixes = ['7', '1']
    else:
        current_suffix = '7'
        next_suffixes = ['1', '4']

    term_codes = []
    current_code = '1{}{}'.format(str(year)[-2:], current_suffix)
    term_codes.append(current_code)

    for suffix in next_suffixes:
        if suffix == '1':
            year += 1
        code = '1{}{}'.format(str(year)[-2:], suffix)
        term_codes.append(code)

    return jsonify(term_codes)

@term_bp.route("/terms", methods=["GET"])
def available_semesters():
    # Get current date and year
    current_date = datetime.datetime.now()
    current_year = current_date.year
    current_month = current_date.month

    # Define semester mappings
    semester_codes = {1: "Spring", 4: "Summer", 7: "Fall"}

    # Determine current and next semesters
    if 1 <= current_month <= 3:  # Jan–Mar
        current_semester = (current_year, 1)  # Spring of current year
        next_semester = (current_year, 4)    # Summer of current year
    elif 4 <= current_month <= 6:  # Apr–Jun
        current_semester = (current_year, 4)  # Summer of current year
        next_semester = (current_year, 7)    # Fall of current year
    elif 7 <= current_month <= 9:  # Jul–Sep
        current_semester = (current_year, 7)  # Fall of current year
        next_semester = (current_year + 1, 1)  # Spring of next year
    elif 10 <= current_month <= 12:  # Oct–Dec
        current_semester = (current_year + 1, 1)  # Spring of next year
        next_semester = (current_year + 1, 4)  # Summer of next year

    # Generate term code and label
    def format_term(year, semester_code):
        term_code = f"1{str(year % 100).zfill(2)}{semester_code}"
        label = f"{semester_codes[semester_code]} {year}"
        return {"value": term_code, "label": label}

    # Return response
    response = [
        format_term(*current_semester),
        format_term(*next_semester)
    ]
    return jsonify(response)