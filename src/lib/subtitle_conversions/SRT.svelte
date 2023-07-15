
<script lang="ts" context="module">
    import { writable } from 'svelte/store';
    let HREF = writable("")
    let FILENAME = writable("")

    const regex = /\[(\d{2}:\d{2}:\d{2})\.(\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2})\.(\d{3})\]/;

    export const convert_to_srt = function(sub_array) {
        let result = '';
        let index = 1;

        sub_array.forEach((elem) => {
            let temp_result = `${index}\n`;
            elem = elem.replace(regex, '$1,$2 --> $3,$4\n')

            console.log(temp_result)

            temp_result += `${elem}\n\n`
            result += temp_result;
            index += 1;
        })
        download('download.srt', result)
        return result
    }

    function download(filename, text) {
        HREF.set(`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`)
        FILENAME.set(filename);
        console.log(`SRT HREF: ${HREF}`)
    }
    
</script>

<script lang="ts">
    let file_contents = ""
    let filename = ""

    $: $HREF, file_contents = $HREF
    $: $FILENAME, filename = $FILENAME
</script>

<a href={file_contents} download={filename}><button class="btn-secondary">
    Download SRT
</button></a>