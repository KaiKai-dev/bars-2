<script>
    import {db} from '$lib/stores/firebase.js';
    import { collection, doc, onSnapshot, setDoc, Timestamp, query } from "firebase/firestore";

    let uploadModal = false;

    let docuList = [
        // {document: "document", requirement1: "requirement1", requirement2: "requirement2"}
    ];
    let documents = [];
    const status = "Successful";

    const docRef = query(collection(db, "documents"));

    const unsubscribe = onSnapshot(docRef, (querySnapshot) => {
        
        let document = [];

        querySnapshot.forEach((doc) => {
            let reqs = [];
            document["document"] = doc.id;
            for(let index = 0; index < doc.data().requirements.length; index++){
                reqs.push({
                    requirement: doc.data().requirements[index]
                })
                
            }
            document.push({
                document: doc.id,
                requirements: reqs
            })
            docuList = [...document]
        })
        console.log(docuList)
    })

    async function submitHandler() {
        const name = document.getElementById('fName').value;
        const address = document.getElementById('address').value;
        const contact = document.getElementById('contact').value;
        const birthDate = document.getElementById('birthDate').value;
        const age = document.getElementById('age').value;
        const email = document.getElementById('email').value;
        const purpose = document.getElementById('purpose').value;

        const collectionRef = collection(db, 'docRequests');

        if(documents.length > 0 || documents != ""){
            try {
                const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890QWERTYUIOPLKJHGFDSAZXCVBNM0987654321";
                let string = "";

                // ticketId Generator
                for(let index = 0; index < 9; index++){
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
                    documents: documents,
                    purpose: purpose
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
                <input type="text" id="fName" placeholder="Full Name (first name, middle initial, surname)" class="md:w-full col-span-2 p-2 bg-gray-500 text-white rounded-3xl placeholder:text-white" required>
                <!-- Address -->
                <input type="text" id="address" placeholder="Address" class="md:w-full col-span-2 p-2 bg-gray-500 text-white rounded-3xl placeholder:text-white" required>
                <!-- Contact No. -->
                <input type="tel" id="contact" placeholder="Contact No." maxlength=11 class="md:w-full col-span-2 p-2 bg-gray-500 text-white rounded-3xl placeholder:text-white" required>
                <!-- BirthDate -->
                <input type="date" id="birthDate" placeholder="Birthdate" class="md:w-full p-2 bg-gray-500 text-white rounded-3xl placeholder:text-white placeholder:" required>
                <!-- Age -->
                <input type="number" id="age" placeholder="Age" min="0" max="125" class="md:w-full p-2 bg-gray-500 text-white rounded-3xl placeholder:text-white" required>
                <!-- Email Address -->
                <input type="email" id="email" placeholder="Email Address" class="md:w-full col-span-2 p-2 bg-gray-500 rounded-3xl text-white placeholder:text-white" required>
                <!-- Purpose of the Document -->
                <input type="text" id="purpose" placeholder="Purpose of the Document" class="md:w-full col-span-2 p-2 bg-gray-500 text-white rounded-3xl placeholder:text-white" required>
            </div>
        </div>

        <!-- Document Selection and Requirements -->
        <div class="w-full">
            <div class="w-full flex justify-center">
                <p class="w-fit text-center mb-4 p-2 text-white bg-gray-500 rounded-3xl">List of Documents</p>
            </div>
            <!-- {#await unsubscribe}
                <p>...fetching documents list</p>
            {:then docu} 
            {/await} -->
            {#each docuList as docu}
                <div>
                    <div class="flex justify-between">
                        <input type="checkbox" value={docu.document} bind:group={documents} class=""> <p class="w-full p-2 pl-3 ml-2 text-white bg-gray-500  rounded-3xl">{docu.document}</p> <br>
                    </div>
                    {#each docu.requirements as req}
                        <p class="ml-10 my-3">{req.requirement}</p>
                    {/each}
                </div>
            {/each}
            <h3>You selected: </h3>
            {#each documents as document}
                {document}
            {/each}
        </div>
        
        

        <!-- Submit and Clear Form Buttons -->
        <div>
            <button on:click={() => uploadModal = true}>Next</button>
            <button >Clear Form</button>
        </div>
    </form>
</main>

