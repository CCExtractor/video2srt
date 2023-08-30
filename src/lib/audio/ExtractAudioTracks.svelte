<script lang="ts">
    /* ExtractAudioTracks.svelte
    */
    import { FFmpeg } from '@ffmpeg/ffmpeg';
    import { fetchFile } from '@ffmpeg/util'; 
    
    let progress: number = 0;
    let ProgressMeter:HTMLDivElement;

    const ffmpeg = new FFmpeg();
    

    let started: boolean = false;
    let player: HTMLAudioElement;
    let show_audio: boolean = false;
    let src;

    export let BUFFER_AUDIO_DATA = undefined;
    export let TOTAL_AUDIO_LENGTH: number = 0;

    export async function extractAudio(ind: Number, file: File) {
        /** Extract an audio track given a particular audio file and an index
        * @param ind: The Index of the Track
        * @param file: The file we're extracting the track.
        */
        
        
        if(ind == 0 && file == undefined) {
            return;
        }
        
        ffmpeg.on("log", ({ message }) => {            
            console.log(message);
        });


        ffmpeg.on("progress", (p) => {
                console.log(p);
                progress = p.ratio * 100;
                ProgressMeter.style.setProperty("--value", String(progress));
        });
        
        console.log("FFMPEG LOADING....");
        await ffmpeg.load();
        console.log("FFMPEG LOADING COMPLETED!");

        await ffmpeg.writeFile(file['name'], await fetchFile(file));
        started = true;
        await ffmpeg.exec('-i', file['name'], '-ar', '16000', '-map', `0:${ind}`, 'output_audio.wav');
        started = false;

        const audio_data = await ffmpeg.readFile('output_audio.wav');
        
        show_audio = true;
        const blob = new Blob([audio_data.buffer], { type: 'audio/wav' })
        src = URL.createObjectURL(blob);

        // Convert the Audio Stream to a Buffer for Whisper
        const audioContext = new AudioContext({
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: false,
            autoGainControl:  true,
            noiseSuppression: true,
        });

        let fileReader = new FileReader();
        let buffer;

        fileReader.onloadend = () => {
            buffer = new Uint8Array(fileReader.result);

            audioContext.decodeAudioData(buffer.buffer).then(function(decodedData) {
                console.log(decodedData)
                TOTAL_AUDIO_LENGTH = decodedData.duration

                var offlineContext = new OfflineAudioContext(decodedData.numberOfChannels, decodedData.length, decodedData.sampleRate);
                var source = offlineContext.createBufferSource();
                source.buffer = decodedData;
                source.connect(offlineContext.destination);
                source.start(0);

                offlineContext.startRendering()

                offlineContext.oncomplete = function(renderedBuffer) {
                    console.log(renderedBuffer)
                    console.log(renderedBuffer.renderedBuffer.getChannelData(0))
                    console.log(renderedBuffer.renderedBuffer.getChannelData(1))
                    BUFFER_AUDIO_DATA = renderedBuffer.renderedBuffer.getChannelData(0)
                    return renderedBuffer.renderedBuffer.getChannelData(0)
                };

            }).catch(function(error) {
                console.error('Error decoding audio data:', error);
            });

        }

        fileReader.readAsArrayBuffer(blob);

    }

</script>

{#if started}
    <div class="radial-progress" bind:this={ProgressMeter} style="--value:0">{progress.toFixed(2)}%</div>
    {/if}

{#if show_audio}
    <audio bind:this={player} {src} controls/>
{/if}