<script lang="ts" context="module">
    /**
     * The Goal of this file is to convert Whisper captions to WebVTT
     * So we can later use it in the video preview and offer it as an option to download
    */
    import { writable } from 'svelte/store';
    const regex = /\[(\d{2}:\d{2}:\d{2})\.(\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2})\.(\d{3})\]/;

    export let HREF = writable("")
    let FILENAME = writable("")

    export const convert_to_webvtt = function(sub_array) {
        /**
         * Convert Whisper Output to WebVTT
         * param sub_array: The Subtitles whisper returned
         */
        let result: string = 'WEBVTT\n';
        let index: number = 1;

        sub_array.forEach((elem) => {
            let temp_result = `${index}\n`;
            elem = elem.replace(regex, '$1.$2 --> $3.$4\n')

            console.log(temp_result)

            temp_result += `${elem}\n\n`
            result += `- ${temp_result}`;
            index += 1;
        })
        download('download.webvtt', result)
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
    Download WebVTT
</button></a>
