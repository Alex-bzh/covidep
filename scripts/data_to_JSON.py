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

#
#   User functions
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
    days = set()        # All the days listed
    departments = set() # All the departments listed

    # Reading the CSV file
    with open(path_to_data, newline='') as csvfile:
        fieldnames = ['code', 'sex', 'day', 'hosp', 'rea', 'rad', 'dc']
        lines = csv.DictReader(csvfile, delimiter=';', fieldnames=fieldnames)
        for idx, line in enumerate(lines):
            if idx != 0:
                days.add(line['day'])
                departments.add(line['code'])

    for department in departments:
        accounts.update({
            department: { day: dict() for day in days }
        })

    with open(path_to_data, newline='') as csvfile:
        fieldnames = ['code', 'sex', 'day', 'hosp', 'rea', 'rad', 'dc']
        lines = csv.DictReader(csvfile, delimiter=';', fieldnames=fieldnames)
        for idx, line in enumerate(lines):
            if idx != 0:
                accounts[line['code']][line['day']][line['sex']] = line['dc']

    # Reading the geoJSON file
    with open(path_to_geo) as geojson:
        output = json.load(geojson)

    with open(path_to_geo_full, 'w') as jsonfile:
        jsonfile.write('{"type":"FeatureCollection","features":[')
        for idx, department in enumerate(output['features']):
            code = department['properties']['code']
            department['properties'].update({
                'deceased': accounts.get(code)
                })
            json.dump(department, jsonfile)
            if (idx + 1) < len(output['features']):
                jsonfile.write(',\n')
        jsonfile.write('\n]}\n')

#
#   Main
#
if __name__ == '__main__':
    main()
