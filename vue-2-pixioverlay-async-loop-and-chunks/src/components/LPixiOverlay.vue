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
        chunksNumber: {
            type: Number,
            default: 50,
        },
        renderChunkPerSecond: {
            type: Number,
            default: 1,
        },
    },
    methods: {
        getRandom(min, max) {
            return min + Math.random() * (max - min);
        },
        createFakeArray(length){
            const fakeArray = [];
            
            for (let i = 0; i < length; i++) {
                fakeArray.push(i)   
            }

            return fakeArray;
        },
        asyncLoopChunks(items, callback, callbackFinishChunk) {
            return new Promise(resolve => {
                let counter = 0;
                
                const iterator = () => {
                    
                    for (let i = 0; i < this.chunksNumber; i++) {
                        if (items[counter] === undefined) {
                            resolve();
                            return;
                        }
                        callback(items[counter], counter)
                        counter++;
                    }

                    console.log(`chunk-${Math.floor(counter / this.chunksNumber)}: render ${counter +1} items of ${items.length}`)

                    if (callbackFinishChunk) {
                        callbackFinishChunk();
                    }

                    if (counter < items.length) {
                        setTimeout(iterator, this.renderChunkPerSecond)
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
            const innerContainer = new PIXI.ParticleContainer(this.markersLength, {vertices: true});
            const fakeArray = this.createFakeArray(this.markersLength);

            container.addChild(innerContainer)

            const doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            let initialScale;
            let lastZoom = 0;

            this.pixiOverlay = L.pixiOverlay((utils, event) => {
                    const zoom = utils.getMap().getZoom();
                    const container = utils.getContainer();
                    const renderer = utils.getRenderer();
                    const project = utils.latLngToLayerPoint;
                    const scale = utils.getScale();
                    var getScale = utils.getScale;
					var invScale = 1 / getScale();

                    
    
                    if (event.type === 'add') {
                        var origin = project([(48.7 + 49) / 2, (2.2 + 2.8) / 2]);
						innerContainer.x = origin.x;
						innerContainer.y = origin.y;
                        initialScale = invScale / 8;
                        lastZoom = zoom;

                        innerContainer.localScale = initialScale;

                        this.asyncLoopChunks(fakeArray, (_, index) => {

                            const coords = project([this.getRandom(48.7, 49), this.getRandom(2.2, 2.8)]);

                            const markerSprite = new PIXI.Sprite(texture);
                            markerSprite.x = coords.x - origin.x;
                            markerSprite.y = coords.y - origin.y;
                            markerSprite.anchor.set(0.5, 0.5);
                            markerSprite.scaleIcon = 0.5;
                            markerSprite.scale.set((1 / scale) * markerSprite.scaleIcon);

                            innerContainer.addChild(markerSprite);

                            if ((this.markersLength * 0.25) === index) {
                                renderer.render(container)
                            }
                            
                            if ((this.markersLength * 0.5) === index) {
                                renderer.render(container)
                            }

                            if ((this.markersLength * 0.75) === index) {
                                renderer.render(container)
                            }

                        })
                        .then(() => {
                            this.$emit('markers-rendered')
                            renderer.render(container)
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

                    if (event.type === 'redraw' && lastZoom !== zoom) {
                        lastZoom = zoom;
                        this.$emit('start-redraw')
                        this.asyncLoopChunks(innerContainer.children, (_, index) => {
                            const item = innerContainer.children[index];
                            item.scale.set((1 / scale) * item.scaleIcon);
                            
                            if ((this.markersLength * 0.25) === index) {
                                renderer.render(container)
                            }
                            
                            if ((this.markersLength * 0.5) === index) {
                                renderer.render(container)
                            }

                            if ((this.markersLength * 0.75) === index) {
                                renderer.render(container)
                            }
                        })
                        .then(() => {
                            renderer.render(container)
                            this.$emit('stop-redraw')
                        })
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