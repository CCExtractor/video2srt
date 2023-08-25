<script lang="ts">
    /**
     * Model.svelte <- All the interactions with the Whisper Model and IndexDB.
     */
    let popup:HTMLDialogElement;
    let downloadingmodel:boolean = false;
    let progressCur: number = 0;

    import { 
        REQUEST_FAILED, 
        NOT_SUPPORTED, 
        CANNOT_ACCESS_INDEXDB,
        CANNOT_RETRIEVE_DATA,
        INDEXDB_BLOCKED,
        INDEXDB_ABORT,
        FAILED_TO_STORE_IN_DB,
        FAILED_QUERYING_MODELS,
        FAILED_DELETING_DB

    } from './errors.js';

    import { MODEL_TO_SIZE } from './file_sizes.js';


    export let threads: number = 16;
    // Values for the UI
    export let value: string = undefined;
    export let WHISPER_RETURN_DATA: boolean = undefined;
    export let STORED_MODEL: boolean = false;
    export let TRANSLATE_FILE: boolean = false;

    // Values for the Modal
    let MODEL_TITLE: string = "Download Model?";
    let INTERNET_NOT_AVAILABLE: boolean = false;
    // Available Models
    const original_models: {[key: string]: string} = {
        "ggml-model-whisper-base.bin": "Base",
        "ggml-model-whisper-base.en.bin": "Base EN",
        "ggml-model-whisper-small.bin": "Small",
        "ggml-model-whisper-small.en.bin": "Small EN",
        "ggml-model-whisper-tiny.bin": "Tiny",
        "ggml-model-whisper-tiny.en.bin": "Tiny EN"
    }
    let available_models = Object.assign({}, original_models);
    let BUILT_MENU: boolean = false;

    // Values for the Database
    const DB_NAME: string = "WHISPER_TRANSCRIBE";
    const DB_VERSION: number = 1;

    const WHISPER_FILE_NAME: string = "whisper.bin";
    
    let CANCEL_DOWNLOAD: boolean = false;

    // values for Error Dialog;
    let ERROR_EXISTS: boolean = false;
    let ERROR_MESSAGE: string = undefined;

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
            ERROR_EXISTS = true;
            ERROR_MESSAGE = NOT_SUPPORTED;
            throw new Error(NOT_SUPPORTED);
        }

        // Initialize a connection to the database
        let connection = indexedDB.open(DB_NAME, DB_VERSION)

        // Something Went Wrong
        connection.onerror = function(error) {
            ERROR_EXISTS = true;
            ERROR_MESSAGE = CANNOT_ACCESS_INDEXDB;
            console.error(error);
            throw new Error(CANNOT_ACCESS_INDEXDB)
        }

        // An Error connecting to the database
        connection.onblocked = function(error) {
            ERROR_EXISTS = true;
            ERROR_MESSAGE = INDEXDB_BLOCKED;
            console.error(error);
            throw new Error(INDEXDB_BLOCKED)
        }

        // A Transaction was aborted
        connection.onabort = function(error) {
            ERROR_EXISTS = true;
            ERROR_MESSAGE = INDEXDB_ABORT;
            console.error(error);
            throw new Error(INDEXDB_ABORT)
        }

        // There was a change of the database version
        connection.onupgradeneeded = function(event) {
            const db = event.target.result;
            if(db.version == 1) {
                let os = db.createObjectStore('models', {autoIncrement: true});
            } else {
                let os = event.currentTarget.transaction.objectStore('models')
                os.clear();
            }
        }

        build_menu()

        // We have Succesfully connected to the database
        connection.onsuccess = function(event) {
            let db = event.target.result
            let transaction = db.transaction(['models'], 'readonly')
            let store = transaction.objectStore('models')
            let connection = store.get(MODEL_NAME)

            // Failure to Retrieve data
            connection.onerror = function(event) {
                ERROR_EXISTS = true;
                ERROR_MESSAGE = CANNOT_RETRIEVE_DATA;
                throw new Error(CANNOT_RETRIEVE_DATA)
            }

            connection.onsuccess = function(event) {
                if(connection.result) {
                    // Found Model
                    storeFS(connection.result);
                } else {
                    if (value != "Select Model for Whisper"){
                    popup.classList.add("modal-open");
                    }
                }
            }

        }

    }

    function LoadModelToDB (data) {
        if (data) {
            let connection = indexedDB.open(DB_NAME, DB_VERSION)

             // Something Went Wrong
            connection.onerror = function(error) {
                ERROR_EXISTS = true;
                ERROR_MESSAGE = CANNOT_ACCESS_INDEXDB;
                console.error(error);
                throw new Error(CANNOT_ACCESS_INDEXDB)
            }

            // An Error connecting to the database
            connection.onblocked = function(error) {
                ERROR_EXISTS = true;
                ERROR_MESSAGE = CANNOT_ACCESS_INDEXDB;
                console.error(error);
                throw new Error(INDEXDB_BLOCKED)
            }

            // A Transaction was aborted
            connection.onabort = function(error) {
                ERROR_EXISTS = true;
                ERROR_MESSAGE = INDEXDB_ABORT;
                console.error(error);
                throw new Error(INDEXDB_ABORT)
            }

            connection.onupgradeneeded = function(err) {
                console.log("CALLED")
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
                    ERROR_EXISTS = true;
                    ERROR_MESSAGE = FAILED_TO_STORE_IN_DB;
                    throw new Error(FAILED_TO_STORE_IN_DB);
                }

                request.onsuccess = function (event) {
                    storeFS(data)
                    console.log("STORED MODEL!")

                    // Update Menu
                    BUILT_MENU = false;
                    build_menu()
                }

                request.onerror = function (error) {
                    ERROR_EXISTS = true;
                    ERROR_MESSAGE = FAILED_TO_STORE_IN_DB;
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
       popup.classList.remove("modal-open");
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
                ERROR_EXISTS = true;
                ERROR_MESSAGE = REQUEST_FAILED;
                throw new Error(REQUEST_FAILED)
            }

            const contentLength = data.headers.get('content-length');
            const total = parseInt(contentLength, 10);
            const reader = data.body.getReader();
            downloadingmodel = true;
            let chunks = [];
            let receivedLength = 0;
            let progressLast = -1;
            let completed = false

            while (!completed) {

                if (CANCEL_DOWNLOAD){
                    downloadingmodel = false;
                    reader.cancel()
                    break
                }

                const { done, value } = await reader.read();

                completed = done;

                if(value == undefined){
                    break;
                }

                chunks.push(value);
                receivedLength += value.length;

                if (contentLength) {
                    progressCur = Math.round((receivedLength / total) * 100);
                }
            }

            if (!CANCEL_DOWNLOAD){
                let position = 0;
                let chunksAll = new Uint8Array(receivedLength);

                for (var chunk of chunks) {
                    chunksAll.set(chunk, position);
                    position += chunk.length;
                }
                
                LoadModelToDB(chunksAll);
            }
            else{
                CANCEL_DOWNLOAD = false;
            }

        }).catch((err: Error) => {
            console.error(err)
            ERROR_EXISTS = true;
            ERROR_MESSAGE = err.message;
            console.log("EXECUTED ERROR")
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
        WHISPER_RETURN_DATA = Module.full_default(model, audio, lang, `${threads}`, TRANSLATE_FILE);

        
        console.log(WHISPER_RETURN_DATA);
    }

    function build_menu() {
        /**
         * This function aims to retrieve all models so we can show the user
         * which models they have and which not
        */
        if (BUILT_MENU) {
            return;
        } else {
            BUILT_MENU = true
        }

        available_models = original_models;
        let connection = indexedDB.open(DB_NAME, DB_VERSION)

        // Something Went Wrong
        connection.onerror = function(error) {
            ERROR_EXISTS = true;
            ERROR_MESSAGE = CANNOT_ACCESS_INDEXDB;
            console.error(error);
            throw new Error(CANNOT_ACCESS_INDEXDB)
        }

        // An Error connecting to the database
        connection.onblocked = function(error) {
            ERROR_EXISTS = true;
            ERROR_MESSAGE = CANNOT_ACCESS_INDEXDB;
            console.error(error);
            throw new Error(INDEXDB_BLOCKED)
        }

        // A Transaction was aborted
        connection.onabort = function(error) {
            ERROR_EXISTS = true;
            ERROR_MESSAGE = INDEXDB_ABORT;
            console.error(error);
            throw new Error(INDEXDB_ABORT)
        }

        // We have established connection to IndexDB
        connection.onsuccess = function (event) {
            let db = event.target.result
            let transaction;
            try {
                transaction = db.transaction(['models'], 'readonly') 
            } catch (err) {
                return;
            }
            let store = transaction.objectStore('models')

            // Fetch All Entries
            let request = store.openCursor();
            request.onerror = function(event) {
                console.error(`Failed Fetching Data: ${event}`);
                ERROR_EXISTS = true;
                ERROR_MESSAGE = FAILED_QUERYING_MODELS;
                throw new Error(FAILED_QUERYING_MODELS)
            };

            request.onsuccess = function(event2) {
                let cursor = event2.target.result;
                if (cursor) {
                    // Append a Check Mark to all downloaded objects!
                    let key = cursor.primaryKey;
                    let value = cursor.value;

                    available_models[key] = `${available_models[key]} ✅`

                    console.log(key, value);
                    cursor.continue();
                }
            };

            Object.keys(available_models).forEach((elem) => {
                available_models[elem] = `${available_models[elem]}`
            })
            db.close();
        }
    }

    const deleteDatabase = function() {
        /**
         * Drops all models by deleting the model
        */
        let connection = indexedDB.open(DB_NAME, DB_VERSION);
        connection.onsuccess = function(event) {
            let db = event.target.result
            let transaction;

            try {
                transaction = db.transaction(['models'], 'readwrite') 
            } catch (err) {
                return;
            }

            let store = transaction.objectStore('models').clear()

            store.onsuccess = function(event2) {
                db.close();
                
                // Authors Note: When executing this
                // the object original_model also gets changed
                // If Deep Copying doesn't work what edits that object?

                //BUILT_MENU = false;
                //build_menu()

                alert("Models have been deleted")
                location.reload()
            }

            store.onerror = function(event2) {
                ERROR_EXISTS = true;
                ERROR_MESSAGE = FAILED_DELETING_DB;
                console.error(FAILED_DELETING_DB)
            }
        }
    } 

    // Check if the User can Download Models 
    window.addEventListener('offline', () => {
        MODEL_TITLE = "⚠️ You are offline!"
        INTERNET_NOT_AVAILABLE = true;
        console.log('Became offline')
    });

    window.addEventListener('online', () => {
        MODEL_TITLE = "Download Model?"
        INTERNET_NOT_AVAILABLE = false;
        console.log('Became online')
    });


    $: value, loadModel();
    
</script>

{#if !downloadingmodel}
<select class="select select-bordered w-[60%]" bind:value id="models-selector">
    <option disabled selected>Select Model for Whisper</option>
    {#each Object.keys(available_models) as elem}
        <!--- Idk how this one shows up tbh. -->
        {#if elem != "src/models/ggml-model-whisper-tiny.en.bin"}
            <option value={elem}>{available_models[elem]}</option>
        {/if}
    {/each}
</select>
{/if}

{#if downloadingmodel}
<progress class="progress w-[60%]"  value="{progressCur}" max="100"></progress><span>{progressCur}%</span><button class="btn btn-square btn-sm btn-outline btn-error" on:click={()=>{CANCEL_DOWNLOAD=true}}>X</button>
{/if}

<dialog bind:this={popup} class="modal">
    <form method="dialog" class="modal-box">
      <h3 class="font-bold text-lg">{MODEL_TITLE}</h3>
        {#if !INTERNET_NOT_AVAILABLE}
            <p class="py-4">The Model could not be found on your device. This will start a download operation of the selected model which weight: <b>{MODEL_TO_SIZE[value]}</b> MB. Do you want to proceed?</p>
        {:else}
            <p class="py-4">Video2SRT is currently offline! You can transcribe your video files with the downloaded models! If you wish to download more models, an internet connection is required!</p>
        {/if}
        <div class="modal-action">
        <!-- if there is a button in form, it will close the modal -->
        {#if !INTERNET_NOT_AVAILABLE}
        <button on:click={() => popup.classList.remove("modal-open")}>
            No
        </button>
        <button on:click={() => downloadModel()}>
            Yes
        </button>
        {:else}
        <button on:click={() => popup.classList.remove("modal-open")}>
            Understood
        </button>
        {/if}
      </div>
    </form>
</dialog>

<button class="btn-outline rounded-md. absolute bottom-4 left-4 btn-error" on:click={() => deleteDatabase()} id="delete-models-button">
    Delete Models
</button>

{#if ERROR_EXISTS}
<div class="alert alert-error">
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span>{ERROR_MESSAGE}</span>
  </div>
{/if}