<script>
    import { db, storage} from '$lib/stores/firebase.js';
    import { collection, doc, onSnapshot, setDoc, Timestamp, query } from "firebase/firestore";
	import { getStorage, ref, uploadBytesResumable } from 'firebase/storage';

    let uploadModal = false;
    let formValidated = false;

    

    let docuList = [
        // {document: "document", requirement1: "requirement1", requirement2: "requirement2"}
    ];
    let documents = [];
    const status = "Successful";
    let requestId = "";

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
        // console.log(docuList)
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

    function formValidation() {
        const formElement = document.querySelector('#form');

        const validationOptions = [
            {
                attribute: "phone",
                isValid: (input) => {
                    const patternRegex = /(09|63[0-9]*)[0-9]{9}/;
                    const regex = new RegExp(patternRegex);

                    // return regex.test(input.value);
                    return regex.test(input.value) && input.value.length <= 11;
                },
                errorMessage: (input, label) => label.textContent + " format you entered is not valid"
            },
            {
                attribute: "email",
                isValid: (input) => {
                    const patternRegex = /[a-zA-Z0-9_\-\.]+[@][a-z]+([.][a-z]{2,3}){1,3}/;
                    const regex = new RegExp(patternRegex);

                    // return regex.test(input.value);
                    return regex.test(input.value);
                },
                errorMessage: (input, label) => label.textContent + " format you entered is not valid"
            },
            {
                attribute: "custommaxvalue",
                isValid: (input) => {
                    let today = new Date();
                    let bDay = new Date(document.getElementById('birthDate').value);

                    let age = Math.abs(today - bDay)
                    let yearAge = Math.ceil(age / (1000 * 60 * 60 * 24 * 365));
                    
                    return parseInt((yearAge - 1), 10) <= 125 && parseInt((yearAge - 1), 10) >= 0 && parseInt(input.value, 10) == parseInt((yearAge - 1), 10);
                },
                errorMessage: (input, label) => {
                    let today = new Date();
                    let bDay = new Date(document.getElementById('birthDate').value);

                    let age = Math.abs(today - bDay)
                    let yearAge = Math.ceil(age / (1000 * 60 * 60 * 24 * 365)); 

                    if(parseInt((yearAge - 1), 10) != input.value){
                        return "The birthdate and age you entered did not matched"
                    } else if(parseInt((yearAge - 1), 10) > 125){
                        return label.textContent + " is beyond the max age (125)"
                    } else if(parseInt((yearAge - 1), 10) < 0){
                        return label.textContent + " is below the minimum age (0)"
                    }
                }
            },
            {
                attribute: "customdate",
                isValid: (input) => {
                    let today = new Date();
                    let dateInput = new Date(input.value)
                    let year = today.getFullYear();
                    let month = today.getMonth();
                    let date = today.getDate();

                    // console.log(dateInput.getF)
                    if(dateInput.getFullYear() < today.getFullYear()){
                        return true;
                    } else if (dateInput.getFullYear == today.getFullYear){
                        return dateInput.getFullYear() <= year && dateInput.getMonth() <= month && dateInput.getDate() <= date ;
                    }
                },
                errorMessage: (input, label) => {
                    return "The birthdate you entered is not valid"
                }
            },
            {
                attribute: "required",
                isValid: (input) => input.value.trim() !== '',
                errorMessage: (input, label) => label.textContent + " is required"

            },
        ];

        const validateSingleFormGroup = formGroup => {
            const label = formGroup.querySelector('label')
            const input = formGroup.querySelector('input')
            const errorContainer = formGroup.querySelector('.error')

            let formGroupError = false;
            for(const option of validationOptions){
                if(input.hasAttribute(option.attribute) && !option.isValid(input)){
                    errorContainer.textContent =  option.errorMessage(input, label);
                    errorContainer.classList.remove('hidden')
                    input.classList.remove("border-2")
                    input.classList.remove("border-green-500")
                    input.classList.add("border-2")
                    input.classList.add("border-red-500")
                    // console.log(option.errorMessage)
                    formGroupError = true;
                    
                }
            }

            if(!formGroupError){
                errorContainer.textContent = "";
                errorContainer.classList.add('hidden');
                input.classList.remove("border-2")
                input.classList.remove("border-red-500")
                input.classList.add("border-2")
                input.classList.add("border-green-500")
            }
            
            return !formGroupError; 
            // if(formGroupError = false){
                //     return !formGroupError;
                // }
        }
        
        
        
        function validateAllFormGroups(formToValidate) {
            const formGroups = Array.from(formToValidate.querySelectorAll('.formGroup'));

            // console.log(formGroups)
            formGroups.forEach((formGroup) => validateSingleFormGroup(formGroup))
            return formGroups.every((formGroup) => validateSingleFormGroup(formGroup));
        }


        
        const formValid = validateAllFormGroups(formElement);
        
        console.log(formValid)
        if(formValid){
            formValidated = true;
            console.log("Form is Valid")
        } else {
            console.log("Form is not Valid")
        }
        // });

        


        // if()
    }

    function clearForm() {
        // const formElement = document.querySelector('#form');
        // const formGroups = Array.from(formElement.querySelectorAll('.formGroup'));

        // const defaultSingleFormGroup = formGroup => {
        //     const input = formGroup.querySelector('input')
        //     const errorMessage = formGroup.querySelector('.error')

            

        //     input.classList.remove("border-2")
        //     input.classList.remove("border-green-500")
        //     input.classList.remove("border-red-500")
        //     errorMessage.textContent = "";
        // }

        // formGroups.forEach( formGroup => {
        //     defaultSingleFormGroup(formGroup);
        // })
        
    }

    async function uploadFiles() {
        const formElement = document.getElementById('form');
        const docGroups = Array.from(formElement.querySelectorAll('.docGroup'));
        

        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890QWERTYUIOPLKJHGFDSAZXCVBNM0987654321";

        // ticketId Generator
        for(let index = 0; index < 9; index++){
            let modulus = index % 3;
            if(modulus == 0 && index != 0){
                requestId += "-"
            }
            if(requestId.length <=11){
                requestId += letters.charAt(Math.floor(Math.random() * letters.length));
            }
        }

        docGroups.forEach((docGroup) => {
            const reqGroups = Array.from(docGroup.querySelectorAll('.reqGroup'))

            reqGroups.forEach((reqGroup) => {
                const uploadState = reqGroup.querySelector('.uploadStatus')
                
                uploadState.classList.remove('hidden')
                uploadState.textContent = "Upload progress: 0%"
            })
        })

        docGroups.forEach(docGroup => {
            const reqGroups = Array.from(docGroup.querySelectorAll('.reqGroup'))
            const docName = docGroup.querySelector('.docName')

            reqGroups.forEach((reqGroup) => {
                const input = reqGroup.querySelector('input')
                const label = reqGroup.querySelector('.reqName')
                const uploadState = reqGroup.querySelector('.uploadStatus')
                
                const storageRef = ref(storage, 'docRequirements/' + requestId + "/" + docName.textContent + "/" + label.textContent + "/" + input.files[0].name)
                const uploadTask = uploadBytesResumable(storageRef, input.files[0])

                uploadTask.on('state_changed', 
                    (snapshot) => {
                        const progress = parseFloat((snapshot.bytesTransferred/snapshot.totalBytes) * 100).toFixed(2)
                        const mBytesTransferred = ((snapshot.bytesTransferred / 1000) / 1000);
                        const mBytesTotal = ((snapshot.totalBytes / 1000) / 1000)

                        uploadState.textContent = "Upload progress: " + progress + "%, " + mBytesTransferred + "Mb / " + mBytesTotal  + "Mb";
                        console.log("Upload progress: " + progress + "%, " + mBytesTransferred + "Mb / " + mBytesTotal  + "Mb");

                        switch (snapshot.state) {
                            case 'paused':
                                console.log('Upload is paused');
                                break;
                            case 'running':
                                console.log('Upload is running');
                                break;
                        }
                    }, 
                    (error) => {
                        console.log(error.message)
                    },
                    () => {
                        // Handle successful uploads on complete
                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        console.log('File available at', downloadURL);
                        });
                    }
                );

            })

        })
    }

    let ageComputed = 0;
    let birth ;

    $: {
        let birthdateInput = new Date(birth);
        let today = new Date();

        // let age = Math.abs(today - birthdateInput)
        let yearAge = Math.ceil(Math.abs(today - birthdateInput) / (1000 * 60 * 60 * 24 * 365));

        console.log(parseInt(yearAge - 1))
        if(parseInt(yearAge - 1) <= -1 || birthdateInput > today){
            ageComputed = 0;
        } else {
            ageComputed = parseInt(yearAge - 1);
        }
    }
    

    

</script>

<svelte:head>
    <title>Document Request | B.A.R.S.</title>
</svelte:head>

<main class=" min-h-screen max-w-screen left-0 mx-2 md:mx-0 mt-3 md:mt-5" >
    <form class="bg-orange-50 p-3 border-2 border-orange-50 grid grid-cols-1 md:grid-cols-5 gap-3 rounded-md" id="form" on:submit|preventDefault={formValidation} novalidate>

        <!-- Basic Information-->
        <div class="w-full md:col-span-3">
            <div class="w-full flex justify-center">
                <p class="w-fit text-center mb-4 p-2 text-black bg-orange-300 rounded-xl">Basic Information</p>
            </div>
            <div class="grid grid-flow-row grid-cols-6 gap-2">

                <!-- Full Name -->
                <div class="w-full col-span-6 md:col-span-2 formGroup" id="lastName">
                    <label for="lName" class="hidden">Last Name </label>
                    <input 
                    type="text" 
                    id="lName" 
                    placeholder="Last Name" 
                    class="w-full p-2 row-span-1 font-medium text-black bg-orange-300 rounded-xl placeholder:text-black placeholder:pl-1 focus:outline-offset-4 focus:outline-orange-300 input" 
                    required >
                    <div class=" error text-red-600 text-sm pl-3"></div>
                </div>
                <div class="w-full col-span-6 md:col-span-2 formGroup">
                    <label for="fName" class="hidden col-span-0">First Name </label>
                    <input type="text" id="fName" placeholder="First Name" class="w-full p-2 row-span-1 text-black bg-orange-300 rounded-xl placeholder:text-black placeholder:pl-1 focus:outline-offset-4 focus:outline-orange-300 input" required>
                    <div class=" error text-red-600 text-sm pl-3"></div>
                </div>
                <div class="w-full col-span-6 md:col-span-2 formGroup">
                    <label for="mName" class="hidden">Middle Name </label>
                    <input type="text" id="mName"placeholder="Middle Name" class="w-full p-2 row-span-1 text-black bg-orange-300 rounded-xl placeholder:text-black placeholder:pl-1 focus:outline-offset-4 focus:outline-orange-300 input" required>
                    <div class=" error text-red-600 text-sm pl-3"></div>
                </div>

                <!-- Address -->
                <div class="col-span-6 formGroup">
                    <label for="address" class="hidden">Complete Address</label>
                    <input type="text" id="address"placeholder="Complete Address" class="w-full p-2 text-black bg-orange-300 rounded-xl placeholder:text-black placeholder:pl-1 focus:outline-offset-4 focus:outline-orange-300" required>
                    <div class=" error text-red-600 text-sm pl-3"></div>
                </div>

                <!-- Contact No. -->
                <div class="col-span-6 formGroup">
                    <label for="contact" class="hidden">Phone Number</label>
                    <input type="tel" id="contact" placeholder="Phone Number" class="w-full p-2 text-black bg-orange-300 rounded-xl placeholder:text-black placeholder:pl-1 focus:outline-offset-4 focus:outline-orange-300" required phone>
                    <div class=" error text-red-600 text-sm pl-3"></div>
                </div>

                <!-- BirthDate -->
                <div class="col-span-3 formGroup">
                    <label for="birthDate" class="hidden">Birthdate</label>
                    <input type="text" id="birthDate" placeholder="Birthdate" class="w-full p-2 text-black bg-orange-300 rounded-xl placeholder:text-black placeholder:pl-1 focus:outline-offset-4 focus:outline-orange-300 date:text-none" required onfocus="(this.type='date')" customdate bind:value={birth}>
                    <!-- bind:value={birth} -->
                    <div class=" error text-red-600 text-sm pl-3"></div>
                </div>

                <!-- Age -->
                <div class="col-span-1 formGroup">
                    <label for="age" class="hidden">Age</label>
                    <input type="number" id="age" placeholder="Age" class="w-full p-2 text-black bg-orange-300 rounded-3xl placeholder:text-black placeholder:pl-0 focus:outline-offset-4 focus:outline-orange-300" required custommaxvalue="125" customminvalue="0" bind:value={ageComputed}>
                    <!-- bind:value={ageComputed} -->
                    <div class=" error col-span-3 text-red-600 text-sm pl-3"></div>
                </div>
                <p class="col-span-2 p-2 pl-1">years old</p>
                <!-- Email Address -->
                <div class="col-span-6 formGroup">
                    <label for="email" class="hidden">Email Address</label>
                    <input type="text" id="email" placeholder="Email Address" class="w-full p-2 text-black bg-orange-300 rounded-3xl placeholder:text-black placeholder:pl-1 focus:outline-offset-4 focus:outline-orange-300" required email>
                    <div class=" error text-red-600 text-sm pl-3"></div>
                </div>
                <!-- Purpose of the Document -->
                <div class="col-span-6 formGroup">
                    <label for="purpose" class="hidden">Purpose of the Document</label>
                    <input type="text" id="purpose" placeholder="Purpose of the Document" class="w-full p-2 text-black bg-orange-300 rounded-3xl placeholder:text-black placeholder:pl-1 focus:outline-offset-4 focus:outline-orange-300" required>
                    <div class=" error text-red-600 text-sm pl-3"></div>
                </div>
            </div>
        </div>

        <!-- Document Selection and Requirements -->
        <div class="w-full md:col-span-2">
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
                        <input type="checkbox" value={docu} bind:group={documents} class="" checked> <p class="w-full p-2 pl-3 ml-2 text-white bg-gray-500  rounded-3xl">{docu.document}</p> <br>
                    </div>
                    {#each docu.requirements as req}
                        <p class="ml-10 my-3">{req.requirement}</p>
                    {/each}
                </div>
            {/each}
            <h3 class="mb-2">You selected: </h3>
            <div>
                {#each documents as document}
                    <span class="text-sm p-2 mr-2 bg-slate-500 rounded-3xl text-white">
                        {document.document}
                        <!-- <button class="ml-2" on:click={() => document = ""}>x</button> -->
                    </span>
                {/each}
            </div>
        </div>
        
        <!-- Upload Requirements -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="{uploadModal ? "" : "hidden"} fixed bg-black bg-opacity-50 min-h-screen w-full top-[-0.01%] left-[-0.5px] flex items-center justify-center h-max" on:click|self={() => uploadModal = false}>
            <div class="bg-white h-max w-max p-3 rounded-lg">
                <button type="button" on:click={() => uploadModal = false} class="bg-red-400 py-2 px-3 rounded-3xl mb-3">
                    <!-- <div class="w-5 h-1 bg-white rotate-45"></div>
                    <div class="w-5 h-1 bg-white ] translate-y-[-4px] rotate-[135deg]"></div> -->
                    <p class="text-white text-sm">X</p>
                </button>
                <p>Please upload the requirements for the following:</p>
                {#each documents as doc}
                    <div class="docGroup">
                        <p class="docName">{doc.document}</p>
                        {#each doc.requirements as req}
                            <div class="reqGroup">
                                <p class="reqName">{req.requirement}</p>
                                <div class="relative bg-slate-400 group flex justify-center items-center h-48 ">
                                    <input 
                                        type="file" 
                                        accept=".jpg, .jpeg .png, .svg, .webp"
                                        title="Click here to choose a file"
                                        id="{doc.document}File" 
                                        class="relative w-full h-full z-10 pt-24 pl-20 cursor-pointer ">  
                                        <p class="absolute w-full h-full bottom-2 m-auto flex items-center justify-center">Drag here to upload or</p>     
                                </div>
                                <p class="hidden uploadStatus"></p>                            
                            </div>
                        {/each}
                    </div>
                {/each}
                <br>
                <button 
                    type="button"
                    on:click={() => {
                        console.log('button pressed')
                        uploadFiles()
                    }} 
                    class="bg-blue-400 text-white p-2 rounded-2xl shadow-md mt-3"
                >Upload All</button>
            </div>
        </div>

        <!-- Submit and Clear Form Buttons -->
        <div>
            {#if formValidated == true}
                <button 
                type="button"
                on:click={() => {
                    if(documents == "" || documents.length == 0){
                        alert("Please select at least one document")
                    } else {
                        uploadModal = true} 
                    }
                }
                class="p-2 bg-green-500 text-white rounded-2xl shadow-md">Proceed</button>
            {:else if formValidated == false}
                <button type="submit" class="p-2 bg-green-500 text-white rounded-2xl shadow-md">Validate</button>
                {/if}
            <button class="p-2 bg-red-400 text-white rounded-2xl shadow-lg" type="reset" 
            on:click={clearForm()}>Clear Form</button>
        </div>
    </form>
</main>
