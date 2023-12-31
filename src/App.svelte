<script lang="ts">
  import FileHandler from "./lib/components/FileHandler.svelte";
  import Model from "./lib/pickers/Model.svelte";
  import Languages from "./lib/pickers/Languages.svelte";
  import SRT from "./lib/subtitle_conversions/SRT.svelte";
  import { convert_to_srt } from "./lib/subtitle_conversions/SRT.svelte";
  import { convert_to_txt } from "./lib/subtitle_conversions/TXT.svelte";
  import {
    convert_to_webvtt,
    HREF,
  } from "./lib/subtitle_conversions/WebVTT.svelte";
  import WebVtt from "./lib/subtitle_conversions/WebVTT.svelte";
  import TXT from "./lib/subtitle_conversions/TXT.svelte";
  import Notifications from "./lib/components/Notifications.svelte";
  import {getFinishedSeconds} from "./lib/get_seconds";

  let audio_data;
  let useWhisper;
  let whisper_text;
  let whisper_captions;
  let stored_model;
  let convert_button: HTMLButtonElement;
  let threads: number = 16;
  let HIDE_CONVERT_BUTTON: boolean = false;

  // Functions
  let send_notification;

  let video_url;
  let subtitles_URL;
  let video_type;

  let SUB_DATA = [];
  let language: string = "en";
  let sent_notification: boolean = false;
  let translate_file: boolean = false;

  // Progress Variables
  let TOTAL_VIDEO_LENGTH: number = undefined;
  let PERCENTAGE_TRANSCRIBED_VIDEO: number = undefined;
  let TRANSCRIPTION_COMPLETE: boolean = false;

  function extract_subs() {
    if (audio_data == undefined) {
      return;
    }
    console.log(audio_data);
    HIDE_CONVERT_BUTTON = true;
    useWhisper(audio_data, language);
  }

  function activateButton() {
    if (
      audio_data != undefined &&
      language != undefined &&
      stored_model != false
    ) {
      convert_button.classList.replace("btn-disabled", "btn-sucess");
    } else {
      //nothing
    }
  }

  $: audio_data, activateButton();
  $: stored_model, activateButton();
  $: language, activateButton();

  function handleSubs(e) {
    SUB_DATA = window.SUB_DATA;
    console.log(SUB_DATA);
    convert_to_srt(SUB_DATA);
    convert_to_webvtt(SUB_DATA);
    convert_to_txt(SUB_DATA);

    // Progress Stuff
    PERCENTAGE_TRANSCRIBED_VIDEO = (getFinishedSeconds(SUB_DATA[SUB_DATA.length - 1]) / TOTAL_VIDEO_LENGTH) * 100;
    PERCENTAGE_TRANSCRIBED_VIDEO = Math.round(PERCENTAGE_TRANSCRIBED_VIDEO * 100) / 100

  }

  function finishedSubs(e) {
    if (!sent_notification) {
      sent_notification = true;
      console.log("FINISHED!");
      send_notification();
      TRANSCRIPTION_COMPLETE = true;
    }
  }

  HREF.subscribe((value) => {
    subtitles_URL = value;
  });

  window.addEventListener("newSubsAdded", handleSubs);
  window.addEventListener("whisperFinished", finishedSubs);
</script>

<span class="flex justify-center font-bold text-5xl pb-10 w-full">Video 2 SRT</span>
<main class="flex flex-col gap-3 items-center">
  <div class="flex flex-col md:flex-row gap-3 w-full items-center">
    <Model
      bind:useWhisper
      bind:WHISPER_RETURN_DATA={whisper_captions}
      bind:STORED_MODEL={stored_model}
      bind:TRANSLATE_FILE={translate_file}
      {threads}
    />
    <Languages bind:value={language} class="w-full md:w-1/2" />

    {#if language != "en"}
      <label class="label cursor-pointer">
        <span class="label-text">Translate?</span> 
        <input type="checkbox" bind:checked={translate_file} class="checkbox checkbox-primary" />
      </label>
    {/if}

  </div>
  {#if stored_model}
    <p style="color:green">Model Ready to use!</p>
  {/if}
  <hr class="w-full" />
  <FileHandler bind:audio_data bind:video_url bind:total_video_length={TOTAL_VIDEO_LENGTH} class="w-full" />
  <hr class="w-full" />
  <div class="flex flex-col md:flex-row gap-3 w-full items-center">
    <input
      type="range"
      min="1"
      max="16"
      bind:value={threads}
      class="range w-full md:w-[70%] range-sm"
      step="1"
      id="stepper"
    />
    <label for="stepper" class="tooltip w-full md:w-[30%] text-lg" data-tip="Reducing the number of threads will increase the time required for generation but decrease the load on the machine" id="label-stepper">Threads in use: {threads} </label>
  </div>
  {#if !HIDE_CONVERT_BUTTON}
  <button
    class="btn btn-disabled w-full md:w-1/2"
    bind:this={convert_button}
    on:click={extract_subs}
    id="convert-button"
    >Convert</button
  >
  {/if}
  {#if whisper_captions == 0 && window.SUB_DATA.length == 0}
    <span class="loading loading-dots loading-lg"></span>
    <p>Loading... Depending on the audio length, it may take time</p>
  {:else if whisper_captions == 0 && window.SUB_DATA.length != 0}
    {#if !TRANSCRIPTION_COMPLETE}
    <h5>You will see progress in real-time.</h5>
    <h2>Transcribed: <b>{PERCENTAGE_TRANSCRIBED_VIDEO}</b>%</h2>
    <progress class="progress progress-info w-56" value={PERCENTAGE_TRANSCRIBED_VIDEO} max="100"></progress>
    {:else}
    <h2 style="color:green">Transcribed!</h2>
    {/if}
    {#each SUB_DATA as sub}
      <p>{sub}</p>
    {/each}
    <video controls width="100%" height="360">
      <source src={video_url} type={video_type} />
      <track label="Output" kind="captions" src={subtitles_URL} default />
    </video>
    <WebVtt />
    <SRT />
    <TXT />
  {/if}
  <Notifications bind:send_notification />
</main>
<span class="forkongithub"
  ><a href={import.meta.env.VITE_GITHUB_URL}>Fork me on GitHub</a></span
>

<style>
  .forkongithub a {
    background: #000;
    color: #fff;
    text-decoration: none;
    font-family: arial, sans-serif;
    text-align: center;
    font-weight: bold;
    padding: 5px 40px;
    font-size: 1rem;
    line-height: 2rem;
    position: relative;
    transition: 0.5s;
  }
  .forkongithub a:hover {
    background: #c11;
    color: #fff;
  }
  .forkongithub a::before,
  .forkongithub a::after {
    content: "";
    width: 100%;
    display: block;
    position: absolute;
    top: 1px;
    left: 0;
    height: 1px;
    background: #fff;
  }
  .forkongithub a::after {
    bottom: 1px;
    top: auto;
  }
      .forkongithub {
      position: fixed;
      display: block;
      top: 0;
      right: 0;
      width: 200px;
      overflow: hidden;
      height: 200px;
      z-index: 9999;
    }
    .forkongithub a {
      width: 200px;
      position: absolute;
      top: 12px;
      right: -55px;
      transform: rotate(45deg);
      -webkit-transform: rotate(45deg);
      -ms-transform: rotate(45deg);
      -moz-transform: rotate(45deg);
      -o-transform: rotate(45deg);
      box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.8);
    }
</style>
