<script lang="ts">
    import Button, { Label } from '@smui/button';
    const regex = /\[(\d{2}:\d{2}:\d{2})\.(\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2})\.(\d{3})\]/;

    let HREF = ""
    let FILENAME = ""

    
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
        HREF = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
        FILENAME = filename;
    }
</script>

<a href={HREF} download={FILENAME}><Button color="secondary"variant="raised">
    <Label>Download SRT</Label>
</Button></a>