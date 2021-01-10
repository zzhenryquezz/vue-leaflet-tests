<script>
import L from 'leaflet';
import 'leaflet-pixi-overlay';
import * as PIXI from 'pixi.js';

export default {
    props: {
        markersLength: {
            type: Number,
            default: 10000,
        },
        renderMarkerPerSecond: {
            type: Number,
            default: 1,
        },
    },
    methods: {
        getRandom(min, max) {
            return min + Math.random() * (max - min);
        },
        asyncLoop: function (items, callback) {
            let loopTimes = 0;
            
            if (Array.isArray(items)) {
                loopTimes = items.length;
            }

            if (typeof items === 'number') {
                loopTimes = items;
            }

            return new Promise(resolve => {
                let counter = 0;
                
                const iterator = () => {
                    
                    callback(items[counter], counter);
                    
                    counter++;

                    console.log(counter, loopTimes)

                    if (counter < loopTimes) {
                        setTimeout(iterator, this.renderMarkerPerSecond * 0.1)
                    } else {
                        return resolve()
                    }
                    
                }

                iterator();
            })
        },
    },
    render() {
        return null;
    },
    mounted() {
        this.mapObject = this.$parent.mapObject;
        this.loader = new PIXI.Loader();
        this.loader.add('marker', require('@/assets/marker-icon.png'));

        this.loader.load((loader, resources) => {
            const texture = resources.marker.texture;
            const container = new PIXI.Container();
            const innerContainer = new PIXI.ParticleContainer(this.markersLength, {vertices: true,  scale: true,});

            container.addChild(innerContainer)

            const doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            let initialScale;

            this.pixiOverlay = L.pixiOverlay((utils, event) => {
                    const zoom = utils.getMap().getZoom();
                    const container = utils.getContainer();
                    const renderer = utils.getRenderer();
                    const project = utils.latLngToLayerPoint;
                    var getScale = utils.getScale;
					var invScale = 1 / getScale();

                    
    
                    if (event.type === 'add') {
                        var origin = project([(48.7 + 49) / 2, (2.2 + 2.8) / 2]);
						innerContainer.x = origin.x;
						innerContainer.y = origin.y;
                        initialScale = invScale / 8;

                        innerContainer.localScale = initialScale;



                        this.asyncLoop(this.markersLength, () => {
                            const coords = project([this.getRandom(48.7, 49), this.getRandom(2.2, 2.8)]);

                            const markerSprite = new PIXI.Sprite(texture);
                            markerSprite.x = coords.x - origin.x;
                            markerSprite.y = coords.y - origin.y;
                            markerSprite.anchor.set(0.5, 0.5);
                            markerSprite.scaleIcon = invScale;
                            markerSprite.scale.set((1 / utils.getScale()) * markerSprite.scaleIcon);

                            innerContainer.addChild(markerSprite);

                            renderer.render(container)
                        }).then(() => {
                            this.$emit('markers-rendered')
                        })
                    }

                    if (event.type === 'zoomanim') {
						var targetZoom = event.zoom;
						if (targetZoom >= 16 || zoom >= 16) {
							var targetScale = targetZoom >= 16 ? 1 / utils.getScale(event.zoom) : initialScale;
							innerContainer.currentScale = innerContainer.localScale;
							innerContainer.targetScale = targetScale;
						}
						return;
					}

                    if (event.type === 'redraw') {
                        this.asyncLoop(innerContainer.children, (_, index) => {
                            const item = innerContainer.children[index];
                            item.scale.set((1 / utils.getScale()) * item.scaleIcon);
                        })
                        .then(() => renderer.render(container))
					}
    
                    renderer.render(container);
    
                }, container, {
                    doubleBuffering: doubleBuffering,
                    destroyInteractionManager: true,
                    layerType: 'overlay',
                    preserveDrawingBuffer: true,
                    padding: 0,

                })

            this.pixiOverlay.addTo(this.mapObject);

            this.$emit('ready')

            var ticker = new PIXI.Ticker();
            
            ticker.add((delta) => {
				this.pixiOverlay.redraw({type: 'redraw', delta: delta});
			});
            
            this.mapObject.on('zoomstart', function() {
				ticker.start();
			});
            
            this.mapObject.on('zoomend', function() {
				ticker.stop();
			});
            
            this.mapObject.on('zoomanim', this.pixiOverlay.redraw, this.pixiOverlay);
        })

        
        return null;
    },
    beforeDestroy: function () {
        if (!this.pixiOverlay) {
            return
        }

        const renderer = this.pixiOverlay.utils.getRenderer();

        renderer.destroy();

        this.mapObject.removeLayer(this.pixiOverlay);

    },
}
</script>

<style>

</style>