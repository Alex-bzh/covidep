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

#
#   User functions
#
def main():

    # Paths to the files
    path_to_geo = '../data/departements.geojson'
    path_to_data = '../data/donnees-hospitalieres.csv'
    path_to_geo_full = '../data/covid-france.json'

    stats = {}

    # Reading the CSV file
    with open(path_to_data, newline='') as csvfile:
        fieldnames = ['dep', 'sexe', 'jour', 'hosp', 'rea', 'rad', 'dc']
        lines = csv.DictReader(csvfile, delimiter=';', fieldnames=fieldnames)
        for line in lines:
            if line['jour'] == '2020-04-30':
                if line['sexe'] == '0':
                    stats[line['dep']] = {'T': line['dc']}
                if line['sexe'] == '1':
                    stats[line['dep']].update({'M': line['dc']})
                if line['sexe'] == '2':
                    stats[line['dep']].update({'W': line['dc']})

    # Reading the geoJSON file
    with open(path_to_geo) as geojson:
        output = json.load(geojson)

    with open(path_to_geo_full, 'w') as jsonfile:
        jsonfile.write('{"type":"FeatureCollection","features":[')
        for idx, department in enumerate(output['features']):
            code = department['properties']['code']
            department['properties'].update({
                'deceased': stats.get(code)
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