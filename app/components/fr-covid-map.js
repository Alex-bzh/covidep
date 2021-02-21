// fr-covid-map.js
let frCovidMapCmpnt = {
    template: `<div id="map"></div>`,
    data: function() {
        return {
            dateToDisplay: null,
            layer: null,
            map: null
        }
    },
    mounted: function() {
        this.initMap();
    },
    methods: {
        /*
        *   Sets a color according to the value of a stat
        */
        covidColor(n) {
            return  n > 90 ? 'hsl(21, 86%, 7%)' :
                    n > 80 ? 'hsl(21, 86%, 13%)' :
                    n > 70 ? 'hsl(21, 86%, 23%)' :
                    n > 60 ? 'hsl(21, 86%, 33%)' :
                    n > 50 ? 'hsl(21, 86%, 43%)' :
                    n > 40 ? 'hsl(21, 86%, 53%)' :
                    n > 30 ? 'hsl(21, 86%, 63%)' :
                    n > 20 ? 'hsl(21, 86%, 73%)' :
                    n > 10 ? 'hsl(21, 86%, 83%)' :
                    n > 5 ? 'hsl(180, 100%, 45%)' :
                    n > 2 ? 'hsl(180, 100%, 60%)' :
                    n > 1 ? 'hsl(180, 100%, 75%)' :
                    n > 0.5 ? 'hsl(180, 100%, 85%)' :
                              'hsl(180, 100%, 95%)';
        },
        /*
        *   Highlights a department
        */
        highlightFeature(event) {
            // Sets a specific style
            event.target.setStyle({
                weight: 2,
                color: 'hsl(21, 91%, 53%)',
                fillColor: 'hsl(21, 91%, 73%)',
            });

            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                event.target.bringToFront();
            }
        },
        /*
        *   Initializes a GeoJSON layer.
        */
        initGeoJSON(departments, date) {
            // If defined, the previous layer is removed for optimization purposes
            if (this.layer) this.map.removeLayer(this.layer);
            // If no date is selected, then considers the property date
            // from the data
            this.dateToDisplay = moment(date);
            // GeoJSON layer
            this.layer = L.geoJSON(departments, {
                style: this.setStyle,
                onEachFeature: this.onEachFeature
            });
            this.layer.addTo(this.map);
        },
        /*
        *   Initializes an OpenStreetMap.
        */
        initMap() {
            // Setting a new Leaflet instance
            this.map = L.map('map').setView([47, 2], 6);
            // OSM tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Données géographiques © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributeurs, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                maxZoom: 18
            }).addTo(this.map);
        },
        /*
        *   Defines all the actions to set on a department
        */
        onEachFeature(feature, layer) {
            // Place a popup
            this.setPopup(feature, layer);
            // Associates events with methods
            layer.on({
                click: this.zoomToFeature,
                mouseout: this.resetHighlight,
                mouseover: this.highlightFeature
            });
        },
        /*
        *   Resets the state of a feature
        */
        resetHighlight(event) {
            this.layer.resetStyle(event.target);
        },
        /*
        *   Sets the popup on a particular department.
        */
        setPopup(department, layer) {
            let date = this.dateToDisplay.format('YYYY-MM-DD');
            if (department.properties && department.properties.nom && department.properties.deceased) {
                let content = `<h6>${department.properties.nom} (${department.properties.code})</h6>
                <table class="table table-borderless table-hover">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">H</th>
                            <th scope="col">F</th>
                            <th scope="col">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">Décès (cumul)</th>
                            <td>${department.properties.deceased[date][1]}</td>
                            <td>${department.properties.deceased[date][2]}</td>
                            <td>${department.properties.deceased[date][0]}</td>
                        </tr>
                        <tr>
                            <th scope="row">Hospitalisations</th>
                            <td>${department.properties.hosp[date][1]}</td>
                            <td>${department.properties.hosp[date][2]}</td>
                            <td>${department.properties.hosp[date][0]}</td>
                        </tr>
                        <tr>
                            <th scope="row">Réanimation</th>
                            <td>${department.properties.rea[date][1]}</td>
                            <td>${department.properties.rea[date][2]}</td>
                            <td>${department.properties.rea[date][0]}</td>
                        </tr>
                        <tr>
                            <th scope="row">Taux d’incidence</th>
                            <td colspan="3">${parseFloat(department.properties.incidence[date]).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>`;
                layer.bindPopup(content);
            }
        },
        /*
        *   Defines the style properties of a department.
        */
        setStyle(department) {
            let date = this.dateToDisplay.format("YYYY-MM-DD");
            return {
                fillColor: this.covidColor(department.properties.incidence[date]),
                weight: 1,
                color: 'white',
                fillOpacity: 1
            };
        },
        /*
        *   Selects the metrics of a specific department
        */
        zoomToFeature(event) {
            this.$emit('zoom-dept', this.dateToDisplay.format('YYYY-MM-DD'), event.target.feature.properties.code);
        }
    }
}