<script lang="ts">
    function downloadModel(url: URL) {
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/octet-stream',
            },
        }).then((data) => {
            console.log(data)
        });
    }
</script>