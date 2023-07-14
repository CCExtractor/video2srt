<script lang="ts">
    import { onMount } from "svelte";
    let state:string = "Subscribe to Notifications"
    let btn:HTMLButtonElement;
    /**
     * Send Notifications when Transcription is complete.
    */
    let HIDE_NOTIFICATION_BUTTON = false;

    const setup_notifications = function() {
        /*
        * Asks the user to enable notifications
        */
        Notification.requestPermission().then((result) => {
              console.log(result);
              if (result == "granted"){
                    //   Should only hide when permission granted
                    HIDE_NOTIFICATION_BUTTON = true;
              }
              else if (result == "denied" || Notification.permission == "denied"){
                state = "Notifications denied"
                btn.classList.add("btn-error")
              }
        });
    }

    export const send_notification = function() {
        const text = `Video has been transcribed!`;
        const notification = new Notification("Video2Srt", { body: text });
        
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                // The tab has become visible so clear the now-stale Notification.
                notification.close();
            }
        });
   
    }


    // Verify if the user's browser has notifications
    if (!("Notification" in window)) {
        HIDE_NOTIFICATION_BUTTON = true;
        console.log("This browser does not support notifications.");
    } 

    // Hide the button if they have granted us permission 
    if (Notification.permission == "granted") {
        HIDE_NOTIFICATION_BUTTON = true;
    }

    // Ask for notification as soon as the page is loaded instead of button click
    // onMount(setup_notifications)

</script>

{#if !HIDE_NOTIFICATION_BUTTON }
<button bind:this={btn}  class="btn btn-outline rounded-md. absolute top-4 right-4" on:click={setup_notifications}>{state}</button>
{/if}