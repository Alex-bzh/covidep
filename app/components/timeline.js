// timeline.js
let timelineCmpnt = {
    template: `
        <div>
            <button class="btn btn-secondary dropdown-toggle" type="button" id="datesMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Choisissez une date
            </button>
            <div class="dropdown-menu scrollable-menu" aria-labelledby="datesMenu">
                <button class="dropdown-item" type="button"
                    :value="date.value"
                    v-for="date in dates"
                    @mouseover="transmitSelected">
                    {{ date.text }}
                </button>
            </div>
        </div>`,
    */
    data() {
        return {
            dates: Array()
        }
    },
    mounted() {
        this.listDates();
    },
    methods: {
        listDates() {
            /*
            *   Lists all the dates between now and March the 18th, 2020:
            *   the start date of the Covid accounts in France.
            */
            let start = moment([2020, 2, 18]);
            let today = moment();
            let diff = today.diff(start, "days");
            for (var i = diff - 1; i >= 0; i--) {
                this.dates.push({
                    text: today.subtract(1, 'days').format('LL'),
                    value: today.format('YYYY-MM-DD')
                });
            }
        },
        /*
        *   Triggers an event to change the key date
        */
        transmitSelected(e) {
            this.$emit('change-date', e.target.getAttribute('value'));
        }
    }
}