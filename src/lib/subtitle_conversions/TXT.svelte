<script lang="ts" context="module">
    /*
     *  The Goal of this file is to convert Whisper captions to TXT 
     * So users can download the exact output from whisper.
     */
    import { writable } from 'svelte/store';

    export let HREF = writable("")
    let FILENAME = writable("")

    export const convert_to_txt = function(sub_array) {
        /**
         * Convert Whisper Output to WebVTT
         * param sub_array: The Subtitles whisper returned
         */
        let result: string = '';

        sub_array.forEach((elem) => {
            result += `${elem}\n`
        })
        download('download.txt', result)
        return result
    }

    
    function download(filename: string, text: string) {
        /**
         * Given a Filename, and the text contents create a download for a file.
        */
        HREF.set(`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`)
        FILENAME.set(filename);
    }
</script>

<script lang="ts">
    let file_contents: string = ""
    let filename: string = ""

    $: $HREF, file_contents = $HREF
    $: $FILENAME, filename = $FILENAME
</script>

<a href={file_contents} download={filename}><button class="btn btn-success">
    Download TXT
</button></a>