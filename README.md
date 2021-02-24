# Covidep

Visualize the evolution of the mortality of the SARS-CoV-2 in France, since the start of confinement pronounced on March 18, 2020, department by department. The datasets also provide insight into the global capacity of intensive care units in hospital alongside with the extent of contamination through the incidence rate in the departments.

A demonstration is available at https://apps.roulois.fr/covidep/

## How to run this application on local?

You need a Web server to launch the application. There are several ways to do so. On Linux and MacOS platforms, you can for example call `python` or `php` utilities:

```shell
$ python -m http.server 8080
```

```shell
$ php -S localhost:8080
```

Then, open your web browser and navigate to the URL `http://localhost:8080`.

## How to update the data?

SPF (Santé publique France) provide updated data day by day through their information systems:
- [Hospital data](https://www.data.gouv.fr/fr/datasets/donnees-hospitalieres-relatives-a-lepidemie-de-covid-19/).
- [Système d’Informations de DEPistage (SI-DEP)](https://www.data.gouv.fr/fr/datasets/taux-dincidence-de-lepidemie-de-covid-19/)

1. on the first link, download the CSV file called `donnees-hospitalieres-covid19-2021\*.csv`
2. on the second one, download the files `sp-pe-std-quot-dep.csv` and `sp-pe-std-quot-fra.csv` (useful to calculate the incidence rate)
3. save it in the `script` folder
4. run the script `data_to_JSON.py`
```shell
$ python data_to_JSON.py
```

This procedure will update the files in the `data` folder on which the application is based.

## Credits

The borders of the departments come from the <a href="https://github.com/gregoiredavid/france-geojson">France GeoJSON</a> project by Grégoire David.

All the data are provided by <a href="https://www.data.gouv.fr/fr/organizations/sante-publique-france/">Santé publique France</a>.