// map.js
let frCovidMapCmpnt = {
    template: `<div id="map"></div>`,
    data: function() {
        return {
            dateToDisplay: null,
            layer: null,
            map: null,
            mostRecentDate: null
        }
    },
    mounted: function() {
        this.fetchData();
        this.initMap();
    },
    methods: {
        /*
        *   Sets a color according to the value of a stat
        */
        covidColor(n) {
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
        *   Fetches the data
        */
        fetchData() {
            fetch('./data/covid-france.json')
            .then(stream => stream.json())
            .then(data => {
                this.mostRecentDate = data.date;
                this.departments = data.features;
                // Initializes the GeoJSON layer only after
                // data is loaded.
                this.$nextTick(() => this.initGeoJSON());
            });
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
        initGeoJSON(date = null) {
            // If defined, the previous layer is removed for optimization purposes
            if (this.layer) this.map.removeLayer(this.layer);
            // If no date is selected, then considers the property date
            // from the data
            this.dateToDisplay = (date == null) ? moment(this.mostRecentDate) : moment(date);
            // GeoJSON layer
            this.layer = L.geoJSON(this.departments, {
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
        setStyle(department) {
            let date = this.dateToDisplay.format("YYYY-MM-DD");
            return {
                fillColor: this.covidColor(department.properties.deceased[date][0]),
                weight: 1,
                color: 'white',
                fillOpacity: 1
            };
        },
        /*
        *   Provokes a zoom on the map, to the bounds of the department
        */
        zoomToFeature(event) {
            this.map.fitBounds(event.target.getBounds());
        }
    }
}