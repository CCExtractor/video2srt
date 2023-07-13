<script lang="ts">
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
              HIDE_NOTIFICATION_BUTTON = true;
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

</script>

{#if !HIDE_NOTIFICATION_BUTTON }
<button on:click={setup_notifications}>Subscribe to Notifications</button>
{/if}