// metrics.js
let chartCmpnt = {
    template: `<canvas id="chart" height="300"></canvas>`,
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
            title: "Données hospitalières sur la France entière (hors EHPAD)"
        }
    },
    created() {
        this.getMetrics();
    },
    methods: {
        /*
        *   Adds metrics to data for a point in time.
        */
        addMetrics(metrics, pit) {
            this.data['deceased']['A'].push(metrics[pit]['deceased'][0]);
            this.data['deceased']['M'].push(metrics[pit]['deceased'][1]);
            this.data['deceased']['W'].push(metrics[pit]['deceased'][2]);
            this.data['rea']['A'].push(metrics[pit]['rea'][0]);
            this.data['rea']['M'].push(metrics[pit]['rea'][1]);
            this.data['rea']['W'].push(metrics[pit]['rea'][2]);
        },
        /*
        *   Fetches the metrics, according to a point in time (eventually).
        */
        getMetrics(pit = null) {
            // Fetch API
            fetch('./data/metrics.json')
            .then(stream => stream.json())
            .then(metrics => {
                if (pit) {
                    this.labels = ['Décès (cumul)', 'Réanimation'];
                    this.addMetrics(metrics, pit);
                }
                else {
                    this.labels = Object.keys(metrics);
                    for (date in metrics) {
                        this.addMetrics(metrics, date);
                    }
                }
                // Initializes a chart
                this.initChart(pit);
            });
        },
        /*
        *   Initializes a chart
        */
        initChart(pit = null) {
            // Datasets
            if (pit) {
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
            } else {
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