<script lang="ts">
    /**
     * The goal of this file is to retrieve all available tracks
     * and make only audio tracks available for use
    */
    import { FFprobeWorker } from "ffprobe-wasm";
    import { INVALID_FILE } from "./errors";

    let tracks = [];

    export async function listAudioTracks(file: File) {
        /**
         * Given a File, Retrieve all Audio Tracks
         * @param file: A Video / Audio File
         */

        // Invoke FFProbe on file
        let fileInfo;
        try {
            const worker = new FFprobeWorker();
            fileInfo = await worker.getFileInfo(file);
            console.log(fileInfo);
        } catch (e) {
            if (e.message.includes('index out of bounds')){
                // Reproduced this error by submitting images, and other type of files
                throw new Error(INVALID_FILE);
            }
        }
            

        // This should be all the data from FFProbe related to all the tracks
        // We're going to save only audio tracks
        fileInfo['streams'].forEach((track: Object) => {
            if(track['codec_type'] == 'audio'){
                tracks.push(track);
            }
        })

        return tracks

    }    
</script>
