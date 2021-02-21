// incidence-rate.js
let iRateCmpnt = {
    template: `
        <canvas id="irate" height="300"></canvas>
    `,
    data() {
        return {
            labels: Array(),
            data: Array(),
            title: '',
            zone: 'france'
        }
    },
    created() {
        this.getMetrics(this.zone);
    },
    methods: {
        /*
        *   Fetches the metrics.
        */
        getMetrics(zone) {

            // Defines the zone to display
            this.zone = zone;

            // Fix the title of the chart
            if (this.zone != 'france') this.title = "Taux d’incidence – Département " + this.zone;
            else this.title = "Taux d’incidence – France entière";

            // Fetch API
            fetch('./data/metrics-' + this.zone + '.json')
            .then(stream => stream.json())
            .then(metrics => {
                // Keep only some of the dates
                var dates = Object.keys(metrics.incidence);
                for (var i in dates) {
                    // No data before 2020, May the 12th
                    if (i % 6 == 0 && dates[i] > '2020-05-12') {
                        this.labels.push(dates[i]);
                    }
                }
                for (var j in this.labels) {
                    this.data.push(metrics.incidence[this.labels[j]]);
                }
                // Initializes the chart
                this.initChart();
            });
        },
        /*
        *   Initializes a chart
        */
        initChart() {
            let taux2decimal = Array();
            this.data.forEach(
                element => taux2decimal.push(parseFloat(element).toFixed(2))
            );
            var datasets = [
                {
                    label: 'Taux d’incidence',
                    borderColor: 'hsl(21, 86%, 33%)',
                    backgroundColor: 'hsla(21, 86%, 70%)',
                    data: taux2decimal,
                    fill: false
                }
            ];
            // Data
            let data = {
                labels: this.labels,
                datasets: datasets
            }

            let ctx = document.getElementById('irate').getContext('2d');
            let chart = new Chart(ctx, {
                // Type of chart
                type: 'line',
                data: data,
                options: {
                    title: {
                        display: true,
                        text: this.title
                    }
                }
            });
        },
        /*
        *   Removes an obsolete chart
        */
        removeChart() {
            // Restore the labels
            this.labels = Array();
            // Restores data to default value
            this.data = Array();
            // Replaces the canvas with a fresh one.
            $('#irate').replaceWith('<canvas id="irate" height="300" class="mt-3"></canvas>');
        }
    }
}