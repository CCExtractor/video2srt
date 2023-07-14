<script lang="ts">
    /**
     * The go
    */

    import ExtractAudioTracks from "../audio/ExtractAudioTracks.svelte";
    import FindAudioTracks from "../audio/FindAudioTracks.svelte";
    import Model from '../pickers/Model.svelte';

    let files: FileList;
    let audio_tracks;
    let track_extract;
    let value = 0;

    let track_data: Array<object> = [];

    let executed: boolean = false;
    let hide_tracks: boolean = false;

    export let video_url;
    export let audio_data;
    export let video_type;



    $: if (files) {
        if(!executed) {
            // 1. Retrieve the File Tracks
            console.log(files);
            console.log(`${files[0].name}: ${files[0].size} bytes`);
            video_url = URL.createObjectURL(files[0]);
            video_type = files[0].type;

            // 2. Look Up Audio Tracks
            audio_tracks.listAudioTracks(files[0]).then((data) => {
                track_data = data;
                console.log(track_data)
                executed = true;
            }).catch((err: Error) => {
                alert(err)
            });
            executed = true;
        }
	}

    async function extract_audio () {
        console.log('exec')
        console.log(value)
        
        if(value != undefined){
            await track_extract.extractAudio(value, files[0]).then((data) => {
                hide_tracks = true;
                console.log(data)
                console.log('FILEHANDLER')
                console.log(audio_data)
            }).catch((err: Error) => {
                console.log(err)
            });
        }
    }

    $: value, extract_audio();

</script>
<div class="flex flex-row gap-3 items-center">
{#if !executed}
  <input 
    type="file" 
    accept="video/*, audio/*"
    bind:files
  />
{/if}

  <FindAudioTracks bind:this={audio_tracks}></FindAudioTracks>
  <ExtractAudioTracks bind:this={track_extract} bind:BUFFER_AUDIO_DATA={audio_data  }></ExtractAudioTracks>

{#if !hide_tracks}

    <select bind:value class="select select-bordered">
    <option selected disabled>Select Audio Track</option>
    {#each track_data as track}
            <option value={track['index']}>
                {track["codec_name"]} - 
                {track['tags']['language'] != undefined ? track['tags']['language'] : ''} - 
                {track['tags']['title'] != undefined ? track['tags']['title'] : ''}
            </option>
    {/each}
    </select>
{/if}
</div>