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
    if '/' in date:
        date = date.split('/')
        date = f'{date[2]}-{date[1]}-{date[0]}'

    return date

#
#   Main function
#
def main():

    # Now
    date = datetime.datetime.now()
    today = f'{date.year}-{date.month}-{date.day}'

    # Paths to the files
    path_to_geo = '../data/departements.geojson'
    path_to_data = '../data/donnees-hospitalieres.csv'
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
            department: { date: dict() for date in dates }
        })

    # Reading the CSV file a second time
    with open(path_to_data, newline='') as csvfile:
        fieldnames = ['code', 'sex', 'date', 'hosp', 'rea', 'rad', 'dc']
        lines = csv.DictReader(csvfile, delimiter=';', fieldnames=fieldnames)
        for idx, line in enumerate(lines):
            if idx != 0:
                # Dates do not all respect the same format
                date = format_date(line['date'])
                # Updates the account of each department with the number
                # of deceased people, day by day
                accounts[line['code']][date][line['sex']] = line['dc']

    # Reading the geoJSON file of the departments
    with open(path_to_geo) as geojson:
        output = json.load(geojson)

    # Writes a geoJSON file
    with open(path_to_geo_full, 'w') as jsonfile:
        # The most recent recorded date
        recent = max(dates)
        jsonfile.write('{"date":"' + recent + '","type":"FeatureCollection","features":[')
        for idx, department in enumerate(output['features']):
            # Code of the department (e.g.: 75, 01, 37…)
            code = department['properties']['code']
            # Looks up in the accounts the records for this particular department
            department['properties'].update({
                'deceased': accounts.get(code)
            })
            # As a JSON formatted stream
            json.dump(department, jsonfile)
            if (idx + 1) < len(output['features']):
                jsonfile.write(',\n')
        # Closes the FeatureCollection and the geoJSON file
        jsonfile.write('\n]}\n')

#
#   Main
#
if __name__ == '__main__':
    main()
