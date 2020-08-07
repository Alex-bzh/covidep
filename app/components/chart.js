// metrics.js
let chartCmpnt = {
    template: `<canvas id="chart" height="300"></canvas>`,
    props: {
        type: {
            type: String(),
            required: true
        }
    },
    data() {
        return {
            labels: Array(),
            data: {
                'deceased': {
                    'A': Array(),
                    'M': Array(),
                    'W': Array()
                },
                'rea': {
                    'A': Array(),
                    'M': Array(),
                    'W': Array()
                }
            },
            title: "Données hospitalières (hors EHPAD) – France entière",
            zone: 'france'
        }
    },
    created() {
        this.getMetrics(this.zone);
    },
    methods: {
        /*
        *   Adds metrics to data for a point in time.
        */
        addMetrics(metrics, limit) {
            this.data['deceased']['A'].push(metrics['deceased'][limit][0]);
            this.data['deceased']['M'].push(metrics['deceased'][limit][1]);
            this.data['deceased']['W'].push(metrics['deceased'][limit][2]);
            this.data['rea']['A'].push(metrics['rea'][limit][0]);
            this.data['rea']['M'].push(metrics['rea'][limit][1]);
            this.data['rea']['W'].push(metrics['rea'][limit][2]);
        },
        /*
        *   Fetches the metrics, according to a point in time (eventually).
        */
        getMetrics(zone, limit = null) {

            // Defines the zone to display
            this.zone = zone;

            // Fix the title of the chart
            if (this.zone != 'france') this.title = "Données hospitalières (hors EHPAD) – Département " + this.zone;
            else this.title = "Données hospitalières (hors EHPAD) – France entière";

            // Fetch API
            fetch('./data/metrics-' + this.zone + '.json')
            .then(stream => stream.json())
            .then(metrics => {
                // Point in time chart
                if (this.type == 'pit') {
                    this.labels = ['Décès (cumul)', 'Réanimation'];
                    this.addMetrics(metrics, limit);
                }
                // Time serie chart
                else if (this.type == 'time-serie') {
                    if (limit) labels = this.labels = Object.keys(metrics['deceased']).filter(date => date <= limit);
                    else labels = this.labels = Object.keys(metrics['deceased'])
                    for (date in labels) {
                        this.addMetrics(metrics, labels[date]);
                    }
                }
                // Initializes the chart
                this.initChart();
            });
        },
        /*
        *   Initializes a chart
        */
        initChart() {
            // Datasets
            if (this.type == '') {
                var datasets = [
                    {
                        label: 'Hommes',
                        borderColor: 'hsl(180, 100%, 25%)',
                        backgroundColor: 'hsla(180, 100%, 25%)',
                        data: [this.data['deceased']['M'], this.data['rea']['M']],
                        stack: 'men'
                    },
                    {
                        label: 'Femmes',
                        borderColor: 'hsl(180, 100%, 55%)',
                        backgroundColor: 'hsla(180, 100%, 55%)',
                        data: [this.data['deceased']['W'], this.data['rea']['W']],
                        stack: 'women'
                    }
                ];
                var scales = {
                    xAxes: [{
                        stacked: true,
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                };
            } else if (this.type == 'time-serie') {
                var datasets = [
                    {
                        label: 'Décès (cumul)',
                        borderColor: 'hsl(180, 100%, 25%)',
                        backgroundColor: 'hsl(180, 100%, 25%)',
                        data: this.data['deceased']['A']
                    },
                    {
                        label: 'Réanimation',
                        borderColor: 'hsl(170, 80%, 60%)',
                        backgroundColor: 'hsl(170, 80%, 60%)',
                        data: this.data['rea']['A']
                    }
                ];
                var scales = Object();
            }
            // Data
            let data = {
                labels: this.labels,
                datasets: datasets
            }

            let ctx = document.getElementById('chart').getContext('2d');
            let chart = new Chart(ctx, {
                // Type of chart
                type: 'bar',
                data: data,
                options: {
                    title: {
                        display: true,
                        text: this.title
                    },
                    scales: scales
                }
            });
        },
        /*
        *   Removes an obsolete chart
        */
        removeChart() {
            // Restores data to default value
            this.data = {
                'deceased': {
                    'A': Array(),
                    'M': Array(),
                    'W': Array()
                },
                'rea': {
                    'A': Array(),
                    'M': Array(),
                    'W': Array()
                }
            };
            // Replaces the canvas with a fresh one.
            $('#chart').replaceWith('<canvas id="chart" height="300" class="mt-5"></canvas>');
        }
    }
}