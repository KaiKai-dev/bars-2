<script>
    import { db, storage} from '$lib/stores/firebase.js';
    import { collection, doc, onSnapshot, setDoc, Timestamp, query } from "firebase/firestore";
	import { getStorage, ref, uploadBytesResumable } from 'firebase/storage';
	import { goto } from '$app/navigation';

    let formValidated = false;
    let filesComplete = false;
    let uploadModal = false;
    let submitModal = false;

    let requestSubmitted = false;

    let docuList = [];
    let documents = [];
    // const status = "Successful";
    let requestId = "";

    let lastName = "";
    let firstName = "";
    let middleName = "";
    let address = "";
    let contact = "";
    let ageComputed = 0;
    let birth ;
    let emailAddress = "";
    let purpose = "";

    const docRef = query(collection(db, "documents"));

    const unsubscribe = onSnapshot(docRef, (querySnapshot) => {
        
        let document = [];

        querySnapshot.forEach((doc) => {
            let reqs = [];
            // document["document"] = doc.id;
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

    async function uploadFiles() {
        const formElement = document.getElementById('form');
        const docGroups = Array.from(formElement.querySelectorAll('.docGroup'));

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
                        alert(error.message);
                    },
                    () => {
                        // Handle successful uploads on complete
                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                        // getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        // console.log('File available at', downloadURL);
                        // });
                        // filesComplete = true
                    }
                );

            })

        })

        // filesComplete = true;
    }

    async function submitHandler() {
        
        const collectionRef = collection(db, 'docRequests');

        if(documents.length > 0 || documents != ""){
            try {
                const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890QWERTYUIOPLKJHGFDSAZXCVBNM9876543210";

                // requesttId Generator
                for(let index = 0; index < 9; index++){
                    if(requestId.length <= 11) {
                        let modulus = index % 3;
                        if(modulus == 0 && index != 0){
                            requestId += "-"
                        }
                        requestId += letters.charAt(Math.floor(Math.random() * letters.length));
                    }
                }
                
                
                
                const docRef = doc(db, "docRequests", requestId);

                await setDoc(docRef, {
                    lastName: lastName,
                    firstName: firstName,
                    middleName: middleName,
                    completeAddress: address,
                    contactNo: contact,
                    birthDate: birth,
                    age: ageComputed, 
                    email: emailAddress,
                    dateAdded: Timestamp.now(),
                    docsRequested: documents,
                    docPurpose: purpose
                    // ticketId: string
                }, requestId)
                .then(
                    console.log('request successfully added to the database' + requestId)
                )
                uploadFiles();
                submitModal = false;
                requestSubmitted = true;
                
            } catch (error) {
                const errorMessage = error.errorMessage;
                console.log(errorMessage);
            }
            console.log(lastName, firstName, middleName, address, contact, birth, ageComputed, emailAddress, documents, requestId)

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
                    } else {
                        if(parseInt((yearAge - 1), 10) > 125){
                            return label.textContent + " is beyond the max age (125)"
                        } else if(parseInt((yearAge - 1), 10) < 0){
                            return label.textContent + " is below the minimum age (0)"
                        }
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
    }

    
    
    // $: filesValidator();
    function filesChecker() {
        const formElement = document.getElementById('form');
        let docGroups = Array.from(formElement.querySelectorAll('.docGroup'));

        const docValidator = docGroups.every((docGroup) => {
            const reqGroups = Array.from(document.querySelectorAll('.reqGroup'))

            const filesValidator = reqGroups.every((reqGroup) => {
                const input = reqGroup.querySelector('input')

                return input.files.length != 0; 
                
            })

            return filesValidator;
        })

        if(docValidator){
            filesComplete = true
            // uploadFiles();
        } else {
            alert("Your requirements are not complete, please upload all the requirements")
            filesComplete = false;
        }
    

    }
    
    let textCopied = false;
    function copy() {
        
        // navigator.clipboard.writeText(requestId)
        // textCopied = true;

        // setTimeout(() => {
        //     textCopied = false;
        // }, 3000)
    }
    

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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css" 
			integrity="sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w==" 
			crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>

<main class=" min-h-screen max-w-screen left-0 mx-2 md:mx-0 mt-3 md:mt-5" >
    {#if !requestSubmitted}
        <form class="{requestSubmitted ? "hidden" : ""}bg-white p-3 border-2 border-white grid grid-cols-1 md:grid-cols-5 gap-3 shadow-lg rounded-md" id="form" on:submit|preventDefault={submitHandler} novalidate>

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
                        bind:value={lastName}
                        class="w-full p-2 row-span-1 font-medium text-black bg-orange-300 rounded-xl placeholder:text-black placeholder:pl-1 outline-orange-300 focus:outline-offset-4 focus:outline-orange-300 focus:outline-[3px] transition-all duration-100 input" 
                        required >
                        <div class=" error  text-red-600 text-sm pl-3"></div>
                    </div>
                    <div class="w-full col-span-6 md:col-span-2 formGroup">
                        <label for="fName" class="hidden col-span-0">First Name </label>
                        <input type="text" id="fName" placeholder="First Name"  bind:value={firstName} class="w-full p-2 row-span-1 text-black bg-orange-300 rounded-xl placeholder:text-black placeholder:pl-1 outline-orange-300 focus:outline-offset-4 focus:outline-orange-300 focus:outline-[3px] transition-all duration-100 input" required>
                        <div class=" error text-red-600 text-sm pl-3"></div>
                    </div>
                    <div class="w-full col-span-6 md:col-span-2 formGroup">
                        <label for="mName" class="hidden">Middle Name </label>
                        <input type="text" id="mName"placeholder="Middle Name" bind:value={middleName} class="w-full p-2 row-span-1 text-black bg-orange-300 rounded-xl placeholder:text-black placeholder:pl-1 outline-orange-300 focus:outline-offset-4 focus:outline-orange-300 focus:outline-[3px] transition-all duration-100 input" required>
                        <div class=" error text-red-600 text-sm pl-3"></div>
                    </div>

                    <!-- Address -->
                    <div class="col-span-6 formGroup">
                        <label for="address" class="hidden">Complete Address</label>
                        <input type="text" id="address"placeholder="Complete Address" bind:value={address} class="w-full p-2 text-black bg-orange-300 rounded-xl placeholder:text-black placeholder:pl-1 outline-orange-300 focus:outline-offset-4 focus:outline-orange-300 focus:outline-[3px] transition-all duration-100" required>
                        <div class=" error text-red-600 text-sm pl-3"></div>
                    </div>

                    <!-- Contact No. -->
                    <div class="col-span-6 formGroup">
                        <label for="contact" class="hidden">Phone Number</label>
                        <input type="tel" id="contact" placeholder="Phone Number" bind:value={contact} class="w-full p-2 text-black bg-orange-300 rounded-xl placeholder:text-black placeholder:pl-1 outline-orange-300 focus:outline-offset-4 focus:outline-orange-300 focus:outline-[3px] transition-all duration-100" required phone>
                        <div class=" error text-red-600 text-sm pl-3"></div>
                    </div>

                    <!-- BirthDate -->
                    <div class="col-span-3 formGroup">
                        <label for="birthDate" class="hidden">Birthdate</label>
                        <input type="text" id="birthDate" placeholder="Birthdate" class="w-full p-2 text-black bg-orange-300 rounded-xl placeholder:text-black outline-orange-300 focus:outline-offset-4 focus:outline-orange-300 focus:outline-[3px] transition-all duration-100 date:text-none" required onfocus="(this.type='date')" customdate bind:value={birth}>
                        <div class=" error text-red-600 text-sm pl-3"></div>
                    </div>

                    <!-- Age -->
                    <div class="col-span-1 formGroup">
                        <label for="age" class="hidden">Age</label>
                        <input type="number" id="age" placeholder="Age" class="w-full p-2 text-black bg-orange-300 rounded-3xl placeholder:text-black placeholder:pl-0 outline-orange-300 focus:outline-offset-4 focus:outline-orange-300 focus:outline-[3px] transition-all duration-100" required custommaxvalue="125" customminvalue="0" bind:value={ageComputed}>
                        <div class=" error col-span-3 text-red-600 text-sm pl-3"></div>
                    </div>
                    <p class="col-span-2 p-2 pl-1">years old</p>
                    <!-- Email Address -->
                    <div class="col-span-6 formGroup">
                        <label for="email" class="hidden">Email Address</label>
                        <input type="text" id="email" placeholder="Email Address" bind:value={emailAddress} class="w-full p-2 text-black bg-orange-300 rounded-3xl placeholder:text-black placeholder:pl-1 outline-orange-300 focus:outline-offset-4 focus:outline-orange-300 focus:outline-[3px] transition-all duration-100" required email>
                        <div class=" error text-red-600 text-sm pl-3"></div>
                    </div>
                    <!-- Purpose of the Document -->
                    <div class="col-span-6 formGroup">
                        <label for="purpose" class="hidden">Purpose of the Document</label>
                        <input type="text" id="purpose" placeholder="Purpose of the Document" bind:value={purpose} class="w-full p-2 text-black bg-orange-300 rounded-3xl placeholder:text-black placeholder:pl-1 outline-orange-300 focus:outline-offset-4 focus:outline-orange-300 focus:outline-[3px] transition-all duration-100" required>
                        <div class=" error text-red-600 text-sm pl-3"></div>
                    </div>
                </div>
            </div>

            <!-- Document Selection and Requirements --> 
            <div class="w-full md:col-span-2">
                <div class="w-full flex justify-center">
                    <p class="w-fit text-center mb-4 p-2 text-black bg-orange-300 rounded-3xl">List of Documents</p>
                </div>
                <!-- {#await unsubscribe}
                    <p>...fetching documents list</p>
                {:then docu} 
                {/await} -->

                <div class="overflow-auto max-h-[300px] md:max-h-[400px]">
                    {#each docuList as docu}
                        <div>
                            <div class="flex justify-between">
                                <input type="checkbox" value={docu} bind:group={documents} class=""> <p class="w-full p-2 pl-3 ml-2 bg-orange-300 text-black rounded-3xl">{docu.document}</p> <br>
                            </div>
                            {#each docu.requirements as req}
                                <p class="ml-10 my-3">{req.requirement}</p>
                            {/each}
                        </div>
                    {/each}
                </div>
                <h3 class="my-2">You selected: </h3>
                <div class="h-5">
                    {#each documents as document}
                        <span class="text-sm p-2 mr-2 bg-blue-500 rounded-3xl text-white">
                            {document.document}
                            <!-- <button class="ml-2" on:click={() => document = ""}>x</button> -->
                        </span>
                    {/each}
                </div>
            </div>
            
            <!-- Upload Requirements -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="{uploadModal ? "" : "hidden"} fixed bg-black bg-opacity-50 min-h-screen w-full top-[-0.01%] left-[-0.5px] flex items-center justify-center transition-all duration-300 h-max" on:click|self={() => uploadModal = false}>
                <div class="bg-white max-h-[80%] w-[85%] md:h-max md:w-max p-3 rounded-lg">
                    <div class="w-full h-max flex justify-end">
                        <button type="button" on:click={() => uploadModal = false} class="mb-3">
                            <!-- <div class="w-5 h-1 bg-white rotate-45"></div>
                            <div class="w-5 h-1 bg-white ] translate-y-[-4px] rotate-[135deg]"></div> -->
                            <i class="fa-solid fa-circle-xmark text-[30px] text-red-600"></i>
                        </button>
                    </div>
                    <p>Please upload the requirements for the following:</p>
                    <div class="overflow-auto max-h-[400px] md:max-w-[500px] rounded-xl p-2 ">
                        {#each documents as doc}
                            <div class="docGroup w-max pb-2 border-b-2 border-dashed border-orange-300">
                                <p class="docName">{doc.document}</p>
                                {#each doc.requirements as req}
                                    <div class="reqGroup mb-2">
                                        <p class="reqName">{req.requirement}</p>
                                        <div class="relative w-[260px] h-[100px] md:w-[460px] bg-black bg-opacity-30 group rounded-xl flex justify-center items-center md:h-48 ">
                                            <input 
                                                type="file" 
                                                accept=".jpg, .jpeg .png, .svg, .webp"
                                                title="Click here to choose a file"
                                                id="{doc.document}File" 
                                                class="relative md:w-full h-full z-10 pt-[27.5px] md:pt-20 pl-[20px] md:pl-[140px] text-white file:bg-orange-400 file:p-2 file:text-white file:border-none file:rounded-xl file:shadow-xl cursor-pointer ">  
                                                <section class="absolute w-full h-full mb-2 text-white bottom-2 m-auto flex items-center justify-center"></section>     
                                        </div>
                                        <p class="hidden uploadStatus"></p>                            
                                    </div>
                                {/each}
                            </div>
                        {/each}
                    </div>
                    <br>
                    {#if filesComplete}
                        <button 
                            type="button"
                            on:click={() => {
                                console.log('button pressed')
                                uploadModal = false; 
                                submitModal = true;
                            }}  
                            class="bg-blue-400 text-white p-2 rounded-2xl shadow-md mt-2"
                        >Next</button>
                    {:else}
                        <button 
                            type="button"
                            on:click={() => {
                                console.log('button pressed')
                                filesChecker();
                            }} 
                            class="bg-blue-400 text-white p-2 rounded-2xl shadow-md mt-2"
                            
                        >Check Files</button>
                    {/if}
                </div>
            </div>

            <!-- Submit Modal -->
            <div class="{submitModal ? "" : "hidden "} fixed bg-black bg-opacity-50 min-h-screen w-full top-[-0.01%] left-[-0.5px] flex items-center justify-center transition-all duration-300 h-max">
                <div class="bg-white h-max w-max p-3 rounded-lg">
                    <p class="mb-3">Your Inputs</p>
                    <div class="flex items-center justify-start gap-2 mb-2">
                        <p>Full Name: </p>
                        <p class="p-[2px] px-[3px] bg-blue-500 text-white text-sm border-2 border-slate-800 rounded-xl">{firstName} {middleName} {lastName}</p>
                    </div>
                    <div class="flex items-center justify-start gap-2 mb-2">
                        <p>Address: </p>
                        <p class="p-[2px] px-[3px] bg-blue-500 text-white text-sm border-2 border-slate-800 rounded-xl">{address}</p>
                    </div>
                    <div class="flex items-center justify-start gap-2 mb-2">
                        <p>Phone Number: </p>
                        <p class="p-[2px] px-[3px] bg-blue-500 text-white text-sm border-2 border-slate-800 rounded-xl">#{contact}</p>
                        
                    </div>
                    <div class="flex items-center justify-start gap-2 mb-2">
                        <p>Birthdate: </p>
                        <p class="p-[2px] px-[3px] bg-blue-500 text-white text-sm border-2 border-slate-800 rounded-xl">{birth}</p>
                        
                    </div>
                    <div class="flex items-center justify-start gap-2 mb-2">
                        <p>Age: </p>
                        <p class="p-[2px] px-[3px] bg-blue-500 text-white text-sm border-2 border-slate-800 rounded-xl">{ageComputed} years old</p>
                    </div>
                    <div class="flex items-center justify-start gap-2 mb-2">
                        <p>Email Address: </p>
                        <p class="p-[2px] px-[3px] bg-blue-500 text-white text-sm border-2 border-slate-800 rounded-xl">{emailAddress}</p>
                        
                    </div>
                    <div class="flex items-center justify-start gap-2 mb-2">
                        <p>Purpose: </p>
                        <p class="p-[2px] px-[3px] bg-blue-500 text-white text-sm border-2 border-slate-800 rounded-xl">{purpose}</p>
                    </div>

                    <p>Documents Requested</p>
                    {#each documents as document}
                        <p>{document.document}</p>
                    {/each}

                    <button type="button" on:click={() => submitModal = false}>Go back and edit</button>
                    <button type="submit">Submit Request</button>
                </div>
            </div>

            <!-- Submit and Clear Form Buttons -->
            <div class="mt-3 flex justify-start gap-3">
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
                    class="p-2 bg-green-500 text-white rounded-2xl shadow-md">Upload Requirements</button>
                {:else if formValidated == false}
                    <button type="button" on:click={formValidation} class="p-2 bg-sky-600 text-white rounded-2xl shadow-md">Validate</button>
                    {/if}
                <button class="p-2 bg-blue-900 text-white rounded-2xl shadow-lg" type="reset" 
                on:click={() => {
                    formValidated = false;
                    filesComplete = false;
                }}>Clear Form</button>
                <!-- <button class="p-2 bg-blue-900 text-white rounded-2xl shadow-lg">Submit</button> -->
            </div>
        </form>

    

    {:else}
        <div id="afterSubmit" class="md:h-[300px] bg-white p-3 border-2 border-white flex flex-col items-center justify-center gap-3 shadow-lg rounded-md">
            <p>Your request have been submitted, you will be notified if your document is ready. Thank you!</p>
            <p>Below is your request id. Write it down or press the button to copy it.</p>
            <div class="flex items-center w-[150px]">
                <p id="requestID" class="p-3 mr-2 bg-orange-400 text-white rounded-xl hover:underline">{requestId}</p>
                <button 
                    title="Press to copy your request ID" 
                    class="p-2 mr-2 flex items-center gap-2 bg-orange-400 text-white rounded-xl shadow-lg hover:scale-[1.1] active:scale-[.9] transition-transform duration-100" 
                    on:click={() => {
                        navigator.clipboard.writeText(requestId);
                        textCopied = true;
                        setTimeout(() => {textCopied = false}, 2000)
                        }}>
                    <p class="text-[10px]">{textCopied ? "Copied": "Copy"}</p>
                    <i class="fa-regular fa-copy"></i>
                </button>
                <!-- <p class="{textCopied ? "" : "hidden"} copy-message p-2 text-[8px] relative text-white bg-slate-800 rounded-xl">Copied</p> -->
            </div>
            <!-- <div class="flex items-center gap-2"> -->
                <button type="button" class="p-2" on:click={() => window.location.reload()}>Finish</button>
                <!-- <button type="button" on:click={homepage}>Back to Homepage</button> -->

            <!-- </div> -->
        </div>
    {/if}
    
</main>

 