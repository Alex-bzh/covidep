// map.js

// Color selection
function covidColor(n) {
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
}
// Popup
function setPopup(objet, layer) {
    if (objet.properties && objet.properties.nom && objet.properties.deceased) {
        let content = '<h3>' + objet.properties.nom + '</h3><b>Décès :</b> ' +  objet.properties.deceased.T;
        layer.bindPopup(content);
    }
}

// Setting a new Leaflet instance
let map = L.map('map').setView([47,2], 6);

let style = function style(department) {
    return {
        fillColor: covidColor(department.properties.deceased.T),
        weight: 1,
        color: 'white',
        fillOpacity: .7
    };
};

// OSM tiles
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Données géographiques © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributeurs, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxZoom: 18
}).addTo(map);

// Fetch API for departments
fetch('./data/covid-france.json')
    .then(stream => stream.json())
    .then(departments => {
        // GeoJSON layer
        L.geoJSON(departments, {
            style: style,
            onEachFeature: setPopup
        })
        .addTo(map);
    });