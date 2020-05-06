var app = new Vue({
    el: '#app',
    components: {
        'timeline': timelineCmpnt,
        'fr-covid-map': frCovidMapCmpnt
    },
    methods: {
        /*
        *   When a day is picked up on the timeline,
        *   it triggers a new GeoJSON layer.
        */
        changeDate: function(date) {
            // A call to the method initGeoJSON() in the frCovidMapCmpnt
            // to set a new layer.
            this.$refs.map.initGeoJSON(date);
        }
    }
})