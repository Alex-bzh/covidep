var app = new Vue({
    el: '#app',
    data: {
        today: moment(),
        dayToDisplay: null,
        map: null,
        layer: null
    },
    components: {
        'timeline': timelineCmpnt
    },
    created: function() {
        this.dayToDisplay = this.today.subtract(1, "days");
    },
    mounted: function() {
        this.initMap();
        this.initGeoJSON();
    },
    methods: {
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
        initGeoJSON: function() {
            fetch('./data/covid-france.json')
            .then(stream => stream.json())
            .then(departments => {
                // GeoJSON layer
                this.layer = L.geoJSON(departments, {
                    style: this.setStyle,
                    onEachFeature: this.setPopup
                });
                this.layer.addTo(this.map);
            });
        },
        initMap: function(departments) {
            // Setting a new Leaflet instance
            this.map = L.map('map').setView([47,2], 6);
            // OSM tiles
            L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Données géographiques © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributeurs, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                maxZoom: 18
            }).addTo(this.map);
        },
        setPopup: function (department, layer) {
            let day = this.dayToDisplay.format('YYYY-MM-DD');
            if (department.properties && department.properties.nom && department.properties.deceased) {
                let content = `<h6>${department.properties.nom} (${department.properties.code})</h6>\
                <p><b>Décès :</b> ${department.properties.deceased[day][0]}<br />\
                <b>Hommes :</b> ${department.properties.deceased[day][1]}<br />\
                <b>Femmes :</b> ${department.properties.deceased[day][2]}</p>`;
                layer.bindPopup(content);
            }
        },
        setStyle: function(department) {
            let day = this.dayToDisplay.format("YYYY-MM-DD");
            return {
                fillColor: this.covidColor(department.properties.deceased[day][0]),
                weight: 1,
                color: 'white',
                fillOpacity: 1
            };
        },
        changeLayer: function(day) {
            this.dayToDisplay = moment(day);
            this.initGeoJSON();
        }
    }
})