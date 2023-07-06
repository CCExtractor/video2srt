<script lang="ts">
    import Select, { Option } from '@smui/select';
    import Dialog, { Title, Content, Actions } from '@smui/dialog';
    import Button, { Label } from '@smui/button';

    import { 
        REQUEST_FAILED, 
        NOT_SUPPORTED, 
        CANNOT_ACCESS_INDEXDB,
        CANNOT_RETRIEVE_DATA,
        INDEXDB_BLOCKED,
        INDEXDB_ABORT,
        FAILED_TO_STORE_IN_DB
    } from './errors.js';

    import { MODEL_TO_SIZE } from './file_sizes.js';

    // Values for the UI
    export let value = undefined;
    export let WHISPER_RETURN_DATA = undefined;
    export let STORED_MODEL = false;

    let open = false;

    // Values for the Database
    const DB_NAME = "WHISPER_TRANSCRIBE";
    const DB_VERSION = 1;

    const WHISPER_FILE_NAME = "whisper.bin";

    let MODEL_TITLE = "Download Model?";

    const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB

    function loadModel() {
        /**
         * Load the selected model from IndexDB or begin downloading it.
        */
        const MODEL_NAME = value;

        if(value == undefined) {
            return;
        }

        if (!navigator.storage || !navigator.storage.estimate) {
            throw new Error(NOT_SUPPORTED);
        }

        // Initialize a connection to the database
        let connection = indexedDB.open(DB_NAME, DB_VERSION)

        // Something Went Wrong
        connection.onerror = function(error) {
            console.error(error);
            throw new Error(CANNOT_ACCESS_INDEXDB)
        }

        // An Error connecting to the database
        connection.onblocked = function(error) {
            console.error(error);
            throw new Error(INDEXDB_BLOCKED)
        }

        // A Transaction was aborted
        connection.onabort = function(error) {
            console.error(error);
            throw new Error()
        }

        // There was a change of the database version
        connection.onupgradeneeded = function(event) {
            const db = event.target.result;
            if(db.version == 1) {
                let os = db.createObjectStore('models', {autoIncrement: true});
            } else {
                let os = event.currentTarget.transaction.objectStore('models')
            }
        }

        // We have Succesfully connected to the database
        connection.onsuccess = function(event) {
            let db = event.target.result
            let transaction = db.transaction(['models'], 'readonly')
            let store = transaction.objectStore('models')
            let connection = store.get(MODEL_NAME)

            // Failure to Retrieve data
            connection.onerror = function(event) {
                throw new Error(CANNOT_RETRIEVE_DATA)
            }

            connection.onsuccess = function(event) {
                if(connection.result) {
                    // Found Model
                    storeFS(connection.result);
                } else {
                    open = true;
                }
            }

        }

    }

    function LoadModelToDB (data) {
        if (data) {
            let connection = indexedDB.open(DB_NAME, DB_VERSION)

             // Something Went Wrong
            connection.onerror = function(error) {
                console.error(error);
                throw new Error(CANNOT_ACCESS_INDEXDB)
            }

            // An Error connecting to the database
            connection.onblocked = function(error) {
                console.error(error);
                throw new Error(INDEXDB_BLOCKED)
            }

            // A Transaction was aborted
            connection.onabort = function(error) {
                console.error(error);
                throw new Error()
            }

            connection.onsuccess = function (event) {
                let db = event.target.result
                let transaction = db.transaction(['models'], 'readwrite')
                let store = transaction.objectStore('models')

                let request = undefined;
                try {
                    request = store.put(data, value);
                } catch (err) {
                    console.error(err)
                    throw new Error(FAILED_TO_STORE_IN_DB);
                }

                request.onsuccess = function (event) {
                    console.log("STORED MODEL!")
                    storeFS(connection.result)
                }

                request.onerror = function (error) {
                    throw new Error(FAILED_TO_STORE_IN_DB);
                }

            }
        }
    }

    function downloadModel () {
        /**
         * This Functions aims to download a model and store it on the client side
         * for a user to later use it.

        */
       if(value == undefined) {
        return
       }

       let url = ""
       if (import.meta.env.VITE_WHISPER_MODEL_URL_LOCATION == undefined) {
        url = `/src/models/${value}`
       } else {
        url = `${import.meta.env.VITE_WHISPER_MODEL_URL_LOCATION}/${value}`
       }
       

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/octet-stream',
            },
        }).then(async (data) => {
            if(data.status != 200) {
                throw new Error(REQUEST_FAILED)
            }

            const contentLength = data.headers.get('content-length');
            const total = parseInt(contentLength, 10);
            const reader = data.body.getReader();

            let chunks = [];
            let receivedLength = 0;
            let progressLast = -1;
            let completed = false

            while (!completed) {
                const { done, value } = await reader.read();

                completed = done;

                if(value == undefined){
                    break;
                }

                chunks.push(value);
                receivedLength += value.length;

                if (contentLength) {
                    var progressCur = Math.round((receivedLength / total) * 10);
                }
            }

            let position = 0;
            let chunksAll = new Uint8Array(receivedLength);

            for (var chunk of chunks) {
                chunksAll.set(chunk, position);
                position += chunk.length;
            }

            LoadModelToDB(chunksAll);

        }).catch((err: Error) => {
            console.error(err)
            throw new Error(REQUEST_FAILED)
        });

    }

    function storeFS(buf) {
        try {
            Module.FS_unlink(WHISPER_FILE_NAME);

        } catch (e) {
            // ignore
        }

        Module.FS_createDataFile("/", WHISPER_FILE_NAME, buf, true, true);
        console.log("STORED MODEL IN FILENAME!")
        STORED_MODEL = true;
    }   

    export function useWhisper(audio, lang) {
        const model = Module.init("whisper.bin")
        if(!model) {
            console.log("Failed to create!")
        }

        WHISPER_RETURN_DATA = "loading";
        WHISPER_RETURN_DATA = Module.full_default(model, audio, lang, '16', false);

        
        console.log(WHISPER_RETURN_DATA);
    }

    $: value, loadModel();

</script>

<Select bind:value label="Select Model for Whisper">
    <Option value="ggml-model-whisper-base.bin">Base</Option>
    <Option value="ggml-model-whisper-base.en.bin">Base EN</Option>
    <Option value="ggml-model-whisper-small.bin">Small</Option>
    <Option value="ggml-model-whisper-small.en.bin">Small EN</Option>
    <Option value="ggml-model-whisper-tiny.bin">Tiny</Option>
    <Option value="ggml-model-whisper-tiny.en.bin">Tiny EN</Option>
</Select>

<Dialog
  bind:open
  aria-labelledby="simple-title"
  aria-describedby="simple-content"
>
  <!-- Title cannot contain leading whitespace due to mdc-typography-baseline-top() -->
  <Title id="simple-title">{MODEL_TITLE}</Title>
  <Content id="simple-content">The Model could not be found on your device. This will start a download operation of the selected model which weight: <b>{MODEL_TO_SIZE[value]}</b> MB. Do you want to proceed?</Content>
  <Actions>
    <Button on:click={() => open = false}>
      <Label>No</Label>
    </Button>
    <Button on:click={() => downloadModel()}>
      <Label>Yes</Label>
    </Button>
  </Actions>
</Dialog>