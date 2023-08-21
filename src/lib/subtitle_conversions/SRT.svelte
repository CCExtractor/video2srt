
<script lang="ts" context="module">
    /**
     * The Goal of this file is to convert Whisper captions to SRT
     * and allow for the ability to download them
    */
    import { writable } from 'svelte/store';
    let HREF = writable("")
    let FILENAME = writable("")

    const regex = /\[(\d{2}:\d{2}:\d{2})\.(\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2})\.(\d{3})\]/;

    export const convert_to_srt = function(sub_array: string[]) {
        /**
         * convert_to_srt - Given Whisper's Output convert it to SRT
         * @param sub_array - An Array of Strings containing a timestamp and text
         */
        let result: string = '';
        let index: number = 1;

        sub_array.forEach((elem) => {
            let temp_result: string = `${index}\n`;
            elem = elem.replace(regex, '$1,$2 --> $3,$4\n')

            console.log(temp_result)

            temp_result += `${elem}\n\n`
            result += temp_result;
            index += 1;
        })
        download('download.srt', result)
        return result
    }

    function download(filename: string, text: string) {
        /**
         * Given a Filename, and the text contents create a download for a file.
        */
        HREF.set(`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`)
        FILENAME.set(filename);
        console.log(`SRT HREF: ${HREF}`)
    }
    
</script>

<script lang="ts">
    let file_contents: string = ""
    let filename: string = ""

    $: $HREF, file_contents = $HREF
    $: $FILENAME, filename = $FILENAME
</script>

<a href={file_contents} download={filename}><button class="btn btn-success">
    Download SRT
</button></a>