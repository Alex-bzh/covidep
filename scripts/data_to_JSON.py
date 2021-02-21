#!/usr/bin/env python
#-*- coding: utf-8 -*-

"""Converts data from DGS (Direction Générale de la Santé)
in CSV format to a JSON object.
"""

#
#   Modules to import
#
import csv
import json
import datetime

def format_date(date):
    """Transforms a date from YYYY/MM/DD format to DD-MM-YYYY"""

    if '/' in date:
        date = date.split('/')
        date = f'{date[2]}-{date[1]}-{date[0]}'

    return date

def get_recent_date():
    dates = set()
    with open('./sp-pe-std-quot-dep.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile, delimiter=';')
        for row in reader:
            dates.add(row['jour'])
    return max(dates)

#
#   Main function
#
def main():

    # Now
    date = datetime.datetime.now()
    today = f'{date.year}-{date.month}-{date.day}'

    # Paths to the files
    path_to_geo = './departements.geojson'
    path_to_data = './donnees-hospitalieres.csv'
    path_to_incidence = './sp-pe-std-quot-dep.csv'
    path_to_geo_full = '../data/covid-france.json'

    # Useful structures to analyse the data
    accounts = dict()   # Dictionary with the accounts
    dates = set()       # All the dates listed
    departments = set() # All the departments listed

    # Reading the CSV file
    with open(path_to_data, newline='') as csvfile:
        fieldnames = ['code', 'sex', 'date', 'hosp', 'rea', 'rad', 'dc']
        lines = csv.DictReader(csvfile, delimiter=';', fieldnames=fieldnames)
        for idx, line in enumerate(lines):
            # Skips the header
            if idx != 0:
                # Dates do not all respect the same format
                date = format_date(line['date'])
                # Lists all the dates and all the departments
                dates.add(date)
                departments.add(line['code'])

    # Each department is set up with an empty account for each date
    for department in departments:
        accounts.update({
            department: {
                'deceased': { date: dict() for date in dates },
                'rea': { date: dict() for date in dates },
                'hosp': { date: dict() for date in dates },
                'incidence': { date: dict() for date in dates },
            },
            "france": {
                'deceased': {
                    date: {
                        "0": int(),
                        "1": int(),
                        "2": int()
                    }
                    for date in dates
                },
                'rea': {
                    date: {
                        "0": int(),
                        "1": int(),
                        "2": int()
                    }
                    for date in dates
                },
                'hosp': {
                    date: {
                        "0": int(),
                        "1": int(),
                        "2": int()
                    }
                    for date in dates
                },
                'incidence': {
                    date: float() for date in dates
                }
            }
        })

    # Reading the data CSV files
    with    open(path_to_data, newline='') as hospi_file,\
            open(path_to_incidence, newline='') as incidence_file :

        # Fieldnames
        hospi_fieldnames = ['code', 'sex', 'date', 'hosp', 'rea', 'rad', 'dc']
        incidence_fieldnames = ['code', 'date', 'pop', 'P', 'tx_std']

        # Fetch rows
        hospi_rows = csv.DictReader(hospi_file, delimiter=';', fieldnames=hospi_fieldnames)
        incidence_rows = csv.DictReader(incidence_file, delimiter=';', fieldnames=incidence_fieldnames)

        # Firstly, the data about hospitalisations
        for idx, row in enumerate(hospi_rows):
            if idx != 0:
                # Dates do not all respect the same format
                date = format_date(row['date'])
                # Updates the account of each department with:
                # - the total amount of deceased people;
                # - the number of people in reanimation at the day;
                # - the number of people admitted in hospital at the day.
                accounts[row['code']]['deceased'][date][row['sex']] = row['dc']
                accounts[row['code']]['rea'][date][row['sex']] = row['rea']
                accounts[row['code']]['hosp'][date][row['sex']] = row['hosp']
                # Updates the nationwide metrics
                accounts['france']['deceased'][date][row['sex']] += int(row['dc'])
                accounts['france']['rea'][date][row['sex']] += int(row['rea'])
                accounts['france']['hosp'][date][row['sex']] += int(row['hosp'])

        # Secondly, data about the incidence rate
        for idx, row in enumerate(incidence_rows):
            # Updates the account of each department with :
            # - the standard incidence rate.
            if idx != 0 and row['code'] not in ['975', '977', '978']:
                accounts[row['code']]['incidence'][row['date']] = row['tx_std']
                # TODO : the nationwide incidence rate


    # Sorts the metrics by date
    for dept in accounts:
        accounts[dept]['deceased'] = dict(sorted(accounts[dept]['deceased'].items(), key=lambda item: item[0]))
        accounts[dept]['rea'] = dict(sorted(accounts[dept]['rea'].items(), key=lambda item: item[0]))
        accounts[dept]['hosp'] = dict(sorted(accounts[dept]['hosp'].items(), key=lambda item: item[0]))
        accounts[dept]['incidence'] = dict(sorted(accounts[dept]['incidence'].items(), key=lambda item: item[0]))

    # Reading the geoJSON file of the departments
    with open(path_to_geo) as geojson:
        output = json.load(geojson)

    # Writes a geoJSON file
    with open(path_to_geo_full, 'w') as jsonfile:
        # The most recent recorded date
        recent = get_recent_date()

        jsonfile.write('{"date":"' + recent + '", "type":"FeatureCollection","features":[')
        for idx, department in enumerate(output['features']):
            # Code of the department (e.g.: 75, 01, 37…)
            code = department['properties']['code']
            # Looks up in the accounts the records for this particular department
            department['properties'].update({
                'deceased': accounts.get(code)['deceased'],
                'rea': accounts.get(code)['rea'],
                'hosp': accounts.get(code)['hosp'],
                'incidence': accounts.get(code)['incidence'],
            })
            # As a JSON formatted stream
            json.dump(department, jsonfile)
            if (idx + 1) < len(output['features']):
                jsonfile.write(',\n')
        # Closes the FeatureCollection and the geoJSON file
        jsonfile.write('\n]}\n')

    # Writes the nationwide metrics and the specific ones to a department
    for sector in accounts:
        if sector:
            with open(f'../data/metrics-{sector}.json', 'w') as jsonfile:
                json.dump(accounts[sector], jsonfile)

#
#   Main
#
if __name__ == '__main__':
    main()
