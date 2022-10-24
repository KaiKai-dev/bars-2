<script>
    
let documents = [];
</script>

<main class=" min-h-screen left-0 mx-2 md:mx-0 mt-3 md:mt-5" >
    <form class="bg-white p-3 border-2 border-white grid grid-cols-1 md:grid-cols-2 gap-3 rounded-md                                                                                                                                                                    ">

        <!-- Basic Information-->
        <div class="w-full">
            <div class="w-full flex justify-center">
                <p class="w-fit text-center mb-4 p-2 text-white bg-gray-500 rounded-3xl">Basic Information</p>
            </div>
            <div class="grid grid-flow-row grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name (first name, middle initial, surname)" class="md:w-full col-span-2 p-2 bg-gray-500 rounded-3xl placeholder:text-white">
                <input type="text" placeholder="Address" class="md:w-full col-span-2 p-2 bg-gray-500 rounded-3xl placeholder:text-white">
                <input type="text" placeholder="Contact No." class="md:w-full col-span-2 p-2 bg-gray-500 rounded-3xl placeholder:text-white">
                <input type="text" placeholder="Birthdate" class="md:w-[50%] p-2 bg-gray-500 rounded-3xl placeholder:text-white">
                <input type="text" placeholder="Age" class="md:w-[50%] p-2 bg-gray-500 rounded-3xl placeholder:text-white">
                <input type="text" placeholder="Email Address" class="md:w-full col-span-2 p-2 bg-gray-500 rounded-3xl placeholder:text-white">
            </div>
        </div>

        <!-- Document Selection and Requirements -->
        <div class="w-full">
            <div class="w-full flex justify-center">
                <p class="w-fit text-center mb-4 p-2 text-white bg-gray-500 rounded-3xl">List of Documents</p>
            </div>
            <div>
                <div class="flex justify-between">
                    <input type="checkbox" value="Document 1" bind:group={documents} class=""> <p class="w-full p-2 pl-3 ml-2 text-white bg-gray-500  rounded-3xl">Document 1</p> <br>
                </div>
                <p class="ml-10 my-3">Document Requirement 1</p>
                <p class="ml-10 my-3">Document Requirement 2</p>
            </div>
            <div>
                <div class="flex justify-between">
                    <input type="checkbox" value="Document 2" bind:group={documents} class=""> <p class="w-full p-2 pl-3 ml-2 text-white bg-gray-500 rounded-3xl ">Document 2</p><br>
                </div>
                <p class="ml-10 my-3">Document Requirement 1</p>
                <p class="ml-10 my-3">Document Requirement 2</p>
            </div>
            <div>
                <div class="flex justify-between">
                    <input type="checkbox" value="Document 3" bind:group={documents} class=""> <p class="w-full p-2 pl-3 ml-2 text-white bg-gray-500 rounded-3xl ">Document 3</p><br>
                </div>
                <p class="ml-10 my-3">Document Requirement 1</p>
                <p class="ml-10 my-3">Document Requirement 2</p>
            </div>
            <h3>You selected: </h3>
            {#each documents as document}
                {document}
            {/each}
        </div>
        
        <!-- Submit and Clear Form Buttons -->
        <div>
            <button>Submit</button>
            <button>Clear Form</button>
        </div>
    </form>
</main>

