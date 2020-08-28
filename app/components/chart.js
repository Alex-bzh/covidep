// metrics.js
let chartCmpnt = {
    template: `
        <div>
            <form>
                <fieldset class="form-group">
                    <div class="row">
                        <legend class="col-form-label col-5">Série de données :</legend>
                        <div class="form-check form-check-inline col-3">
                            <input class="form-check-input" type="radio"
                                name="typeOfChart"
                                checked="checked"
                                id="time-serie"
                                value="time-serie"
                                @click="changeTypeOfChart">
                            <label class="form-check-label" for="time-serie">temporelle</label>
                        </div>
                        <div class="form-check form-check-inline col-3">
                            <input class="form-check-input" type="radio"
                                name="typeOfChart"
                                id="pit"
                                value="pit"
                                @click="changeTypeOfChart">
                            <label class="form-check-label" for="pit">ponctuelle</label>
                        </div>
                    </div>
                </fieldset>
            </form>
            <canvas id="chart" height="300"></canvas>
        </div>`,
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
                },
                'hosp': {
                    'A': Array(),
                    'M': Array(),
                    'W': Array()
                }
            },
            limit: null,
            typeOfChart: 'time-serie',
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
            this.data.deceased.A.push(metrics.deceased[limit][0]);
            this.data.deceased.M.push(metrics.deceased[limit][1]);
            this.data.deceased.W.push(metrics.deceased[limit][2]);
            this.data.rea.A.push(metrics.rea[limit][0]);
            this.data.rea.M.push(metrics.rea[limit][1]);
            this.data.rea.W.push(metrics.rea[limit][2]);
            this.data.hosp.A.push(metrics.hosp[limit][0]);
            this.data.hosp.M.push(metrics.hosp[limit][1]);
            this.data.hosp.W.push(metrics.hosp[limit][2]);
        },
        changeTypeOfChart(e) {
            this.typeOfChart = e.target.value;
            this.removeChart();
            this.getMetrics(this.zone, this.limit);
        },
        /*
        *   Fetches the metrics, according to a point in time (eventually).
        */
        getMetrics(zone, limit = null) {

            // Defines the zone to display
            this.zone = zone;

            // Sets a limit to the temporal extent of the data
            this.limit = limit

            // Fix the title of the chart
            if (this.zone != 'france') this.title = "Données hospitalières (hors EHPAD) – Département " + this.zone;
            else this.title = "Données hospitalières (hors EHPAD) – France entière";

            // Fetch API
            fetch('./data/metrics-' + this.zone + '.json')
            .then(stream => stream.json())
            .then(metrics => {
                // If limit is still null, make it the last entry of the datasets
                if (limit == null) {
                    entrys = Object.keys(metrics.deceased);
                    limit = entrys[entrys.length - 1];
                }
                // Point in time chart
                if (this.typeOfChart == 'pit') {
                    this.labels = ['Décès (cumul)', 'Hospitalisations', 'Réanimation'];
                    this.addMetrics(metrics, limit);
                }
                // Time serie chart
                else if (this.typeOfChart == 'time-serie') {
                    if (limit) labels = this.labels = Object.keys(metrics.deceased).filter(date => date <= limit);
                    else labels = this.labels = Object.keys(metrics.deceased)
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
            if (this.typeOfChart == 'pit') {
                var datasets = [
                    {
                        label: 'Hommes',
                        borderColor: 'hsl(180, 100%, 25%)',
                        backgroundColor: 'hsla(180, 100%, 25%)',
                        data: [this.data.deceased.M, this.data.hosp.M, this.data.rea.M],
                        stack: 'men'
                    },
                    {
                        label: 'Femmes',
                        borderColor: 'hsl(180, 100%, 55%)',
                        backgroundColor: 'hsla(180, 100%, 55%)',
                        data: [this.data.deceased.W, this.data.hosp.W, this.data.rea.W],
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
            } else if (this.typeOfChart == 'time-serie') {
                var datasets = [
                    {
                        label: 'Décès (cumul)',
                        borderColor: 'hsl(180, 100%, 25%)',
                        backgroundColor: 'hsl(180, 100%, 25%)',
                        data: this.data.deceased.A
                    },
                    {
                        label: 'Hospitalisations',
                        borderColor: 'hsl(130, 50%, 70%)',
                        backgroundColor: 'hsl(130, 50%, 70%)',
                        data: this.data.hosp.A
                    },
                    {
                        label: 'Réanimation',
                        borderColor: 'hsl(170, 80%, 60%)',
                        backgroundColor: 'hsl(170, 80%, 60%)',
                        data: this.data.rea.A
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
                },
                'hosp': {
                    'A': Array(),
                    'M': Array(),
                    'W': Array()
                }
            };
            // Replaces the canvas with a fresh one.
            $('#chart').replaceWith('<canvas id="chart" height="300" class="mt-3"></canvas>');
        }
    }
}