// metrics.js
let metricsCmpnt = {
    template: `<canvas id="metrics" height="300"></canvas>`,
    data() {
        return {
            dates: Array(),
            metrics: {
                "deceased": Array(),
                "rea": Array()
            },
            title: "Données hospitalières sur la France entière (hors EHPAD)"
        }
    },
    created() {
        this.getMetrics();
    },
    methods: {
        getMetrics(limit = moment().format("YYYY-MM-DD")) {
            /*
            *   Fetches the metrics according to a limit date.
            */
            fetch('./data/metrics.json')
            .then(stream => stream.json())
            .then(data => {
                this.dates = Object.keys(data).filter(date => date <= limit);
                for (date in data) {
                    if (date <= limit) {
                        this.metrics['deceased'].push(data[date]['deceased'][0])
                        this.metrics['rea'].push(data[date]['rea'][0])
                    }
                }
                this.initChart();
            });
        },
        initChart() {
            /*
            *   Initializes the chart
            */
            var ctx = document.getElementById('metrics').getContext('2d');
            var chart = new Chart(ctx, {
                // Type of chart
                type: 'bar',

                // The data for datasets
                data: {
                    labels: this.dates,
                    datasets: [
                        {
                            label: 'Décès (cumul)',
                            borderColor: 'hsl(180, 100%, 30%)',
                            backgroundColor: 'hsl(180, 100%, 30%)',
                            data: this.metrics['deceased']
                        },
                        {
                            label: 'Réanimation',
                            borderColor: 'hsl(180, 100%, 50%)',
                            backgroundColor: 'hsl(180, 100%, 50%)',
                            data: this.metrics['rea']
                        }
                    ]
                },
                options: {
                    title: {
                        display: true,
                        text: this.title
                    }
                }
            });
        },
        removeChart() {
            /*
            *   Removes an obsolete chart
            */
            $('#metrics').replaceWith('<canvas id="metrics" height="300"></canvas>');
        }
    }
}