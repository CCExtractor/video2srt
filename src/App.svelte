<script lang="ts">
  import FileHandler from "./lib/components/FileHandler.svelte";
  import CircularProgress from '@smui/circular-progress';
  import Model from "./lib/pickers/Model.svelte";
  import Languages from "./lib/pickers/Languages.svelte";

  let audio_data;
  let useWhisper;
  let whisper_text;
  let whisper_captions;
  let stored_model;

  let SUB_DATA = [];
  let language = "en";

  function extract_subs () {
    if(audio_data == undefined) {
      return;
    }
    console.log(audio_data)
    useWhisper(audio_data, language)
  }

  $: audio_data, extract_subs()

  function handleSubs(e) {
    SUB_DATA = window.SUB_DATA;
    console.log(SUB_DATA)
  }
  
  window.addEventListener('newSubsAdded', handleSubs);

</script>

<main>
  <h3>Settings</h3>
  <Model bind:useWhisper={useWhisper} bind:WHISPER_RETURN_DATA={whisper_captions} bind:STORED_MODEL={stored_model}></Model>
  <Languages bind:value={language}></Languages>
  {#if stored_model}
    <p style="color:green">Model Ready to use!</p>
  {/if}
  <hr>
  <FileHandler bind:audio_data={audio_data}></FileHandler>
  <hr>
  {#if whisper_captions == 0 && window.SUB_DATA.length == 0}
    <CircularProgress></CircularProgress>
    <p>Loading... Depending on the audio length it may take time</p>
    {whisper_captions}
  {:else if whisper_captions == 0 && window.SUB_DATA.length != 0}
  <h5>You will see progress in realtime</h5>
    {#each SUB_DATA as sub}
      <p>{sub}</p>
    {/each}
    <p>Full Array: {SUB_DATA}</p>
  {/if}
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
