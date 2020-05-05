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
            // A call to the method setLayer() in the frCovidMapCmpnt
            this.$refs.map.setLayer(date);
        }
    }
})