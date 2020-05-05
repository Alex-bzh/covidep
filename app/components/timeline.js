// timeline.js
let timelineCmpnt = {
    template: `
        <select v-model="selected" @change="transmitSelected">
            <option v-bind:value="date.value" v-for="date in dates">{{ date.text }}</option>
        </select>
    `,
    data: function() {
        return {
            selected: moment().subtract(1, "days").format('YYYY-MM-DD'),
            dates: Array()
        }
    },
    mounted: function() {
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
        transmitSelected: function() {
            this.$emit('change-date', this.selected)
        }
    }
}