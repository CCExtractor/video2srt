<script lang="ts">
    /**
     * Handles the functionality behind the upload button and converting to an audio file
    */

    import ExtractAudioTracks from "../audio/ExtractAudioTracks.svelte";
    import FindAudioTracks from "../audio/FindAudioTracks.svelte";
    import {NO_AUDIO_TRACK} from './errors.js'
    import {INVALID_FILE} from '../audio/errors';

    let files: FileList;
    let audio_tracks;
    let track_extract;
    let value: number = 0;

    let track_data: Array<object> = [];

    let executed: boolean = false;
    let hide_tracks: boolean = true;
    let dragged_file: boolean = false;

    export let video_url;
    export let audio_data;
    export let video_type;
    export let total_video_length: number;

    // Error Dialog
    let ERROR_EXISTS: boolean = false;
    let ERROR_MESSAGE: string;

    $: if (files) {
        if(!executed) {
            // 1. Retrieve the File Tracks
            console.log(files);
            console.log(`${files[0].name}: ${files[0].size} bytes`);
            video_url = URL.createObjectURL(files[0]);
            video_type = files[0].type;
            dragged_file = true;

            // 2. Look Up Audio Tracks
            audio_tracks.listAudioTracks(files[0]).then((data) => {
                track_data = data;
                console.log(track_data)
                executed = true;

                if (track_data.length == 1) {
                    value = track_data[0]['index']
                    extract_audio()
                }

                if (track_data.length == 0) {
                    ERROR_MESSAGE = NO_AUDIO_TRACK
                    ERROR_EXISTS = true
                    executed = false;
                    files = null;
                    hide_tracks = true;
                    return;
                }
                
                hide_tracks = false;
                dragged_file = false;
            }).catch((err: Error) => {
                ERROR_EXISTS = true;
                if (err.message == INVALID_FILE) {
                    ERROR_MESSAGE = err.message
                    files = null
                    executed = false;
                }
            });
            executed = true;
        }
	}

    async function extract_audio () {
        console.log('exec')
        console.log(value)

        if(value == undefined) {
            return;
        }

        if(value != 0 || track_data.length != 0){
            await track_extract.extractAudio(value, files[0]).then((data) => {
                hide_tracks = false;
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
  <label for="attachment">File</label>
  <input 
    type="file" 
    accept="video/*, audio/*"
    bind:files
    id="attachment"
  />
{/if}

  <FindAudioTracks bind:this={audio_tracks}></FindAudioTracks>
  <ExtractAudioTracks bind:this={track_extract} bind:BUFFER_AUDIO_DATA={audio_data} bind:TOTAL_AUDIO_LENGTH={total_video_length}></ExtractAudioTracks>

{#if dragged_file && !ERROR_EXISTS}
    <progress class="progress w-56"></progress>
{/if}

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

{#if ERROR_EXISTS}
<div class="alert alert-error">
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span>{ERROR_MESSAGE}</span>
  </div>
{/if}