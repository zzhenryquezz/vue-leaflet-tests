<template>
  <div>      
      <div class="label"> Fps: {{fps}} </div>
      <hr>
      <div class="label"> Milisecs: {{count}} </div>
      <div class="label"> Seconds: {{count / 1000}} </div>
      <div class="label"> minutes: {{(count / 60000).toFixed(3)}} </div>
      <hr>
      <div class="label"> Redraw Milisecs: {{countRedraw}} </div>
      <div class="label"> Redraw Seconds: {{countRedraw / 1000}} </div>
      <div class="label"> Redraw minutes: {{(countRedraw / 60000).toFixed(3)}} </div>
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
            fps: 0,
            interval: null,
            redrawInterval: null,
            countRedraw: 0
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
    created: function () {
        this.startFpsCounter();
    },
    methods: {
        reset(){
            this.count = 0;
            this.interval = null;
        },
        start(){
            const startTime = Date.now();
            this.interval = setInterval(() => {
                const delta = Date.now() - startTime;
                this.count = Math.floor(delta);
            }, 1);
        },
        stop(){
            clearInterval(this.interval)
        },
        startRedraw(){
            clearInterval(this.redrawInterval)
            const startTime = Date.now();
            this.redrawInterval = setInterval(() => {
                const delta = Date.now() - startTime;
                this.countRedraw = Math.floor(delta);
            }, 100);
        },
        stopRedraw(){
            clearInterval(this.redrawInterval)
        },
        startFpsCounter() {
            let startTime = Date.now();
            let frame = 0;

            const tick = () => {
                var time = Date.now();
                frame++;
                if (time - startTime > 1000) {
                    this.fps = (frame / ((time - startTime) / 1000)).toFixed(1);
                    startTime = time;
                    frame = 0;
                }
                window.requestAnimationFrame(tick);
            }
            tick();
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