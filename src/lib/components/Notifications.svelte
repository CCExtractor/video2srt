<script lang="ts">
  import { onMount } from "svelte";

    /**
     * Send Notifications when Transcription is complete.
    */
    let HIDE_NOTIFICATION_BUTTON = false;
    let State = "Subscribe to Notifications";
    let btn:HTMLButtonElement;

    const setup_notifications = function() {
        /*
        * Asks the user to enable notifications
        */
        Notification.requestPermission().then((result) => {
            // Hide the button if they have granted us permission 
            if (result == "granted") {
                HIDE_NOTIFICATION_BUTTON = true;
            }
            else if (result == "denied"){
                State = "Notifications denied"
                btn.classList.add("btn-error")
            }
        });
    }

    export const send_notification = function() {
        const text = `Video has been transcribed!`;
        const notification = new Notification("Video2Srt", { body: text });
        console.log(notification)

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

    function permissions_changed(){
        // Hide the button if they have granted us permission 
        if (Notification.permission == "granted") {
            HIDE_NOTIFICATION_BUTTON = true;
        }
        else if (Notification.permission == "denied"){
            State = "Notifications denied"
        }
    }
    $: if (("Notification" in window)) {Notification.permission,permissions_changed()};

</script>

{#if !HIDE_NOTIFICATION_BUTTON }
<button bind:this={btn} on:click={setup_notifications} class="btn btn-outline rounded-md. absolute top-4 left-4" id="subscribe-notifications-button">{State}</button>
{/if}