<script lang="ts">
    /**
     * The goal of this file is to retrieve all available tracks
     * and make only audio tracks available for use
    */
    import { INVALID_FILE } from "./errors";

    let tracks = [];
    const worker = new Worker('js/ffprobe-worker.js');

    export async function listAudioTracks(file: File) {
        /**
         * Given a File, Retrieve all Audio Tracks
         * @param file: A Video / Audio File
         */
        let promise = new Promise(function(resolve, reject){ 
        // Invoke FFProbe on file
            let fileInfo;

            worker.onerror = (e) => {
                // Reproduced this error by submitting images, and other type of files
                console.log(e)
                if (e.message.includes('out of bounds')){
                    reject(new Error(INVALID_FILE));
                }

                if (e.message.includes('FS error')) {
                    reject(new Error("PROBLEM READING FILE"))
                }
            }

            worker.onmessage = (event_data) => {
                // This should be all the data from FFProbe related to all the tracks
                // We're going to save only audio tracks
                let counter = 0;
                event_data.data['streams'].forEach((track: Object) => {
                    if(track['codec_type'] == 1){
                        track['index'] = counter;
                        tracks.push(track);
                    }
                    counter++;
                })
                resolve(tracks);
                
            }
            worker.postMessage([ 'get_file_info', file ]);
        })
        return promise
    }    

</script>
