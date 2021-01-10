<template>
  <div>      
      <div class="label"> Milisecs: {{count}} </div>
      <div class="label"> Seconds: {{count / 1000}} </div>
      <div class="label"> minutes: {{count / 60000}} </div>
  </div>
</template>

<script>
export default {
    props: {
        value: {
            type: Number,
            default: null,
        }
    },
    data(){
        return {
            innerCount: 0,
            interval: null
        }
    },
    computed: {
        count: {
            get() {
                if (this.value !== null) {
                    return this.value;
                }

                return this.innerCount;
            },
            set(value) {
                if (this.value !== null) {
                    this.$emit('input', value);
                    return;
                }

                this.innerCount = value;
            },
        },
    },
    methods: {
        reset(){
            this.count = 0;
            this.interval = null;
        },
        start(){
            this.interval = setInterval(() => this.count++, 1);
        },
        stop(){
            clearInterval(this.interval)
        },
    }
}
</script>

<style scoped>

.label {
    display: block;
    margin: 15px 0;
}

</style>