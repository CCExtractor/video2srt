<script lang="ts">
  import FileHandler from "./lib/components/FileHandler.svelte";
  import Model from "./lib/pickers/Model.svelte";
  import Languages from "./lib/pickers/Languages.svelte";
  import SRT from "./lib/subtitle_conversions/SRT.svelte";
  import {convert_to_srt} from "./lib/subtitle_conversions/SRT.svelte";
  import {convert_to_webvtt, HREF} from "./lib/subtitle_conversions/WebVTT.svelte";
  import WebVtt from "./lib/subtitle_conversions/WebVTT.svelte";
  import Notifications from "./lib/components/Notifications.svelte";

  let audio_data;
  let useWhisper;
  let whisper_text;
  let whisper_captions;
  let stored_model;
  let convert_button:HTMLButtonElement;
  let threads = 16;

  // Functions 
  let send_notification;

  let video_url;
  let subtitles_URL;
  let video_type;

  let SUB_DATA = [];
  let language = "en";
  let sent_notification = false;

  //let convert_to_srt;

  function extract_subs() {
    if (audio_data == undefined) {
      return;
    }
    console.log(audio_data);
    useWhisper(audio_data, language);
  }

  function activateButton(){
    if (audio_data != undefined && language != undefined && stored_model != false){
      convert_button.classList.replace("btn-disabled","btn-sucess");
    }
    else{
      //nothing
    }
  }

  $: audio_data,activateButton()
  $: stored_model,activateButton()
  $: language,activateButton()

  function handleSubs(e) {
    SUB_DATA = window.SUB_DATA;
    console.log(SUB_DATA);
    convert_to_srt(SUB_DATA);
    convert_to_webvtt(SUB_DATA);

  }

  function finishedSubs(e) {
    if (!sent_notification) {
      sent_notification = true;
      console.log("FINISHED!");
      send_notification();
    }
  }

  HREF.subscribe((value) => {
    subtitles_URL = value;
  })

  window.addEventListener("newSubsAdded", handleSubs);
  window.addEventListener("whisperFinished", finishedSubs);
</script>

<main class="flex flex-col gap-3 items-center">
  <span class="block text-6xl pb-4 text-center w-full">Video 2 SRT</span>
  <div class="flex flex-row gap-3 w-full items-center">
    <Model
      bind:useWhisper
      bind:WHISPER_RETURN_DATA={whisper_captions}
      bind:STORED_MODEL={stored_model}
      {threads}
    />
    <Languages bind:value={language} />
  </div>
  {#if stored_model}
    <p style="color:green">Model Ready to use!</p>
  {/if}
  <hr class="w-full" />
  <FileHandler bind:audio_data bind:video_url />
  <hr class="w-full" />
  <div class="flex flex-row gap-3 w-full items-center">
    <input
      type="range"
      min="1"
      max="16"
      bind:value={threads}
      class="range w-[70%] range-sm"
      step="1"
    />
    <div
      class="tooltip w-[30%]"
      data-tip="Reducing the number of threads will increase the time required for generation but decrease the load on the machine"
    >
      Threads in use: {threads}
    </div>
  </div>
  <button class="btn btn-disabled w-1/2" bind:this={convert_button} on:click={extract_subs}>Convert</button>
  {#if whisper_captions == 0 && window.SUB_DATA.length == 0}
    <!-- arbitary values currently you can update this with the real variables recieved from svelte store  -->
    <!-- <div class="radial-progress" style="--value:70;">70%</div> -->
    <p>Loading... Depending on the audio length it may take time</p>
    {whisper_captions}
  {:else if whisper_captions == 0 && window.SUB_DATA.length != 0}
    <h5>You will see progress in realtime</h5>
    {#each SUB_DATA as sub} 
      <p>{sub}</p>
    {/each}
    <!-- <p>Full Array: {SUB_DATA}</p> -->
    <video controls width="360" height="360">
      <source src={video_url} type={video_type} />
      <track label="Output" kind="captions" src={subtitles_URL} default />
    </video>
    <WebVtt></WebVtt>
    <SRT></SRT>
  {/if}
  <Notifications bind:send_notification />
</main>

<style>
</style>
