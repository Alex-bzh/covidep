// metrics.js
let metricsCmpnt = {
    template: `<canvas id="metrics"></canvas>`,
    data() {
        return {
            dates: Array(),
            data: {
                "deceased": Array(),
                "rea": Array()
            }
        }
    },
    created() {
        this.getMetrics();
    },
    methods: {
        getMetrics() {
            /*
            *   Fetches the metrics
            */
            fetch('./data/metrics.json')
            .then(stream => stream.json())
            .then(data => {
                this.dates = Object.keys(data);
                for (date in data) {
                    this.data['deceased'].push(data[date]['deceased'][0])
                    this.data['rea'].push(data[date]['rea'][0])
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
                type: 'line',

                // The data for datasets
                data: {
                    labels: this.dates,
                    datasets: [
                        {
                            label: 'Décès (cumul)',
                            borderColor: 'hsl(180, 100%, 30%)',
                            backgroundColor: 'hsl(180, 100%, 30%)',
                            data: this.data['deceased'],
                            fill: false,
                            radius: 0
                        },
                        {
                            label: 'Réanimation',
                            borderColor: 'hsl(180, 100%, 50%)',
                            backgroundColor: 'hsl(180, 100%, 50%)',
                            data: this.data['rea'],
                            fill: false,
                            radius: 0
                        }
                    ]
                }
            });
        }
    }
}