var app = new Vue({
    el: '#app',
    data: {
        departments: null,
        dateToDisplay: moment()
    },
    mounted() {
        /*
        *   Fetches the GeoJSON data when the component is mounted.
        */
        this.fetchData();
    },
    components: {
        'timeline': timelineCmpnt,
        'fr-covid-map': frCovidMapCmpnt,
        'chart': chartCmpnt
    },
    computed: {
        /*
        *   Converts the date to display into a Moment format.
        */
        displayDate() {
            return moment(this.dateToDisplay).format('LL');
        }
    },
    methods: {
        /*
        *   When a day is picked up on the timeline,
        *   it triggers a new GeoJSON layer.
        */
        changeLayer: function(date) {
            // A call to the method initGeoJSON() in the frCovidMapCmpnt
            // to set a new layer.
            this.$refs.map.initGeoJSON(this.departments, date);
            this.dateToDisplay = date;
        },
        /*
        *   Fetches the data
        */
        fetchData() {
            fetch('./data/covid-france.json')
            .then(stream => stream.json())
            .then(data => {

                this.departments = data.features;
                this.dateToDisplay = data.date;

                // Initializes the GeoJSON layer
                this.$refs.map.initGeoJSON(data.features, data.date);
                this.$refs.timeline.listDates([2020, 2, 18], data.date);

            });
        },
        /*
        *   When a day is picked up on the timeline,
        *   it alse triggers a new Chart.
        */
        setPit(pit) {
            // Removes the old chart.
            this.$refs.chart.removeChart();
            // Sets a new Chart with accurate metrics.
            this.$refs.chart.getMetrics(pit);
        },
        /*
        *   A simple way to show all the data in the chart.
        */
        showAll() {
            this.setPit(null);
        }
    }
})