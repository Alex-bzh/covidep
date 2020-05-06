// map.js
let frCovidMapCmpnt = {
    template: `<div id="map"></div>`,
    data: function() {
        return {
            dateToDisplay: null,
            map: null,
            layer: null
        }
    },
    mounted: function() {
        this.initMap();
        this.initGeoJSON();
    },
    methods: {
        /*
        *   Sets a color according to the value of a stat
        */
        covidColor: function(n) {
            return  n > 1000 ? 'hsl(180, 100%, 9%)' :
                    n > 750 ? 'hsl(180, 100%, 19%)' :
                    n > 500 ? 'hsl(180, 100%, 25%)' :
                    n > 400 ? 'hsl(180, 100%, 30%)' :
                    n > 300 ? 'hsl(180, 100%, 35%)' :
                    n > 200 ? 'hsl(180, 100%, 40%)' :
                    n > 100 ? 'hsl(180, 100%, 45%)' :
                    n > 50 ? 'hsl(180, 100%, 50%)' :
                    n > 25 ? 'hsl(180, 100%, 70%)' :
                              'hsl(180, 100%, 90%)';
        },
        /*
        *   Initializes a GeoJSON layer.
        */
        initGeoJSON: function(date = null) {
            fetch('./data/covid-france.json')
            .then(stream => stream.json())
            .then(departments => {
                // If no date is selected, then considers the property date
                // from the data
                this.dateToDisplay = (date == null) ? moment(departments.date) : moment(date);
                // GeoJSON layer
                this.layer = L.geoJSON(departments, {
                    style: this.setStyle,
                    onEachFeature: this.setPopup
                });
                this.layer.addTo(this.map);
            });
        },
        /*
        *   Initializes an OpenStreetMap.
        */
        initMap: function() {
            // Setting a new Leaflet instance
            this.map = L.map('map').setView([47,2], 6);
            // OSM tiles
            L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Données géographiques © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributeurs, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                maxZoom: 18
            }).addTo(this.map);
        },
        /*
        *   Sets the popup on a particular department.
        */
        setPopup: function (department, layer) {
            let date = this.dateToDisplay.format('YYYY-MM-DD');
            if (department.properties && department.properties.nom && department.properties.deceased) {
                let content = `<h6>${department.properties.nom} (${department.properties.code})</h6>\
                <p><b>Décès :</b> ${department.properties.deceased[date][0]}<br />\
                <b>Hommes :</b> ${department.properties.deceased[date][1]}<br />\
                <b>Femmes :</b> ${department.properties.deceased[date][2]}</p>`;
                layer.bindPopup(content);
            }
        },
        /*
        *   Defines the style properties of a department.
        */
        setStyle: function(department) {
            let date = this.dateToDisplay.format("YYYY-MM-DD");
            return {
                fillColor: this.covidColor(department.properties.deceased[date][0]),
                weight: 1,
                color: 'white',
                fillOpacity: 1
            };
        }
    }
}