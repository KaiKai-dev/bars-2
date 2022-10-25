<script>
    import {db} from '$lib/stores/firebase.js';
    // import { randomStrings } from "$lib/stores/ticketGenerator.js"
    import { collection, doc, addDoc, setDoc, Timestamp } from "firebase/firestore";

    let documents = [];

    async function submitHandler() {
        const name = document.getElementById('fName').value;
        const address = document.getElementById('address').value;
        const contact = document.getElementById('contact').value;
        const birthDate = document.getElementById('birthDate').value;
        const age = document.getElementById('age').value;
        const email = document.getElementById('email').value;

        const collectionRef = collection(db, 'docRequests');

        if(documents.length > 0 || documents != ""){
            try {
                const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890QWERTYUIOPLKJHGFDSAZXCVBNM0987654321";
                let string = "";

                // ticketId Generator
                for(let index = 0; index <                                                                                                                                                                                                                       9; index++){
                    let modulus = index % 3;
                    if(modulus == 0 && index != 0){
                        string += "-"
                    }
                    string += letters.charAt(Math.floor(Math.random() * letters.length));
                }
                // console.log(string);

                const docRef = doc(db, "docRequests", string)

                await setDoc(docRef, {
                    name: name,
                    address: address,
                    contactNo: contact,
                    birthDate: birthDate,
                    age: age, 
                    email: email,
                    dateAdded: Timestamp.now(),
                    documents: documents
                    // ticketId: string
                }, string).then(console.log('request successfully, ticket id: ' + string))
                
            } catch (error) {
                const errorMessage = error.errorMessage;
                console.log(errorMessage);
            }
            console.log(name, address, contact, birthDate, age, email, documents)

        } else {
            alert("Select at least one document");
        }
    }

    function idGenerator(string){
        for(let index = 0; index <                                                                                                                                                                                                                       9; index++){
                    let modulus = index % 3;
                    if(modulus == 0 && index != 0){
                        string += "-"
                    }
                    string += letters.charAt(Math.floor(Math.random() * (letters.length)));
                }
                console.log(string);
    }

    function clearForm() {
        
    }
</script>

<main class=" min-h-screen left-0 mx-2 md:mx-0 mt-3 md:mt-5" >
    <form on:submit|preventDefault={submitHandler} class="bg-white p-3 border-2 border-white grid grid-cols-1 md:grid-cols-2 gap-3 rounded-md">

        <!-- Basic Information-->
        <div class="w-full">
            <div class="w-full flex justify-center">
                <p class="w-fit text-center mb-4 p-2 text-white bg-gray-500 rounded-3xl">Basic Information</p>
            </div>
            <div class="grid grid-flow-row grid-cols-2 gap-4">
                <!-- Full Name -->
                <input type="text" id="fName" placeholder="Full Name (first name, middle initial, surname)" class="md:w-full col-span-2 p-2 bg-gray-500 rounded-3xl placeholder:text-white" required>
                <!-- Address -->
                <input type="text" id="address" placeholder="Address" class="md:w-full col-span-2 p-2 bg-gray-500 rounded-3xl placeholder:text-white" required>
                <!-- Contact No. -->
                <input type="tel" id="contact" placeholder="Contact No." maxlength=11 class="md:w-full col-span-2 p-2 bg-gray-500 rounded-3xl placeholder:text-white" required>
                <!-- BirthDate -->
                <input type="date" id="birthDate" placeholder="Birthdate" class="md:w-full p-2 bg-gray-500 rounded-3xl placeholder:text-white placeholder:" required>
                <!-- Age -->
                <input type="number" id="age" placeholder="Age" class="md:w-full p-2 bg-gray-500 rounded-3xl placeholder:text-white" required>
                <!-- Email Address -->
                <input type="email" id="email" placeholder="Email Address" class="md:w-full col-span-2 p-2 bg-gray-500 rounded-3xl placeholder:text-white" required>
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
            <button type="submit">Submit</button>
            <button >Clear Form</button>
        </div>
    </form>
</main>

