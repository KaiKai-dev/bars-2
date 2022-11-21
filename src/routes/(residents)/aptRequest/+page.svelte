<script>
    import { db } from '$lib/stores/firebase.js';
    import { collection, doc, onSnapshot, setDoc, Timestamp, query, orderBy } from 'firebase/firestore';

    const colRef = query(collection(db, "officials"), orderBy("name", "asc"));

    let officialsList = [];
    
    let requestId = "";

    let lastName;
    let firstName;
    let middleName;
    let address;
    let contact;
    let birth;
    let ageComputed;
    let emailAddress;
    let purpose;
    let date;

    let dateString;
    let timeFormat;
    let officialReserved = [];
    
    let formValidated = false;
   
    let dateTimeVisible = false;
    let dateDisplay;

    const unsubscribe = onSnapshot(colRef, (querySnapshot) => {
        const official = []
        querySnapshot.forEach((doc) => {
            official.push({
                name: doc.data().name,
                position: doc.data().position
            })
            officialsList = [...official]
            // console.log(official);
        })

        console.log(officialsList)
    })

    async function submitHandler(){
        try {

            if(dateString != null && timeFormat != null && officialReserved.length != 0){
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

                const appointmentRef = doc(db, "appointments", requestId);

                await setDoc(appointmentRef, {
                    lastName: lastName,
                    firstName: firstName,
                    middleName: middleName,
                    completeAddress: address,
                    contactNo: contact,
                    birthDate: birth,
                    age: ageComputed, 
                    email: emailAddress,
                    docPurpose: purpose,
                    dateAppointed: dateString,
                    timeAppointed: timeFormat,
                    dateAdded: Timestamp.now(),
                    officialAppointed: officialReserved
                }, requestId)
                .then(
                    console.log('request successfully added to the database' + requestId)
                )
            } else if (dateString == null && timeFormat == null) {
                alert("Please set an appointment date and time")
            } else if (officialReserved.length == 0){
                alert("Please select an official to appoint")
            }

            
            
        } catch (error) {
            const errorMsg = error.errorMessage;
            console.log(errorMsg);
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
    
    const months = ["January", "February", "March", 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const weekDays = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    $: {
        let dateFormat = new Date(date);
        let dateHours = dateFormat.getHours();
        let dateMins = dateFormat.getMinutes(); 


        dateString = weekDays[dateFormat.getDay()] + ", " + months.at(dateFormat.getMonth()) + " " + dateFormat.getDate();
        let ampm;

        if(dateHours < 12){
            ampm = "AM";
        } else if(dateHours >= 12){
            ampm = "PM";
        }

        switch(dateHours){
            case 12: 
                timeFormat = dateHours + ":" + dateMins + " " + ampm;
                break;
            case 0:
                timeFormat = '12:' + dateMins + " " + ampm;
                break;
            default:
                timeFormat = (dateHours % 12) + ":" + dateMins + ampm;
            
        }
        
        dateDisplay = dateString + " at " + timeFormat;
    }
       
    $: console.log(officialReserved);

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
    <title>Appointment Request | B.A.R.S.</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css" 
			integrity="sha512-MV7K8+y+gLIBoVD59lQIYicR65iaqukzvf/nwasF0nqhPay5w/9lJmVM2hMDcnK1OnMGCdVK+iQrJ7lzPJQd1w==" 
			crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>

<div class=" min-h-screen max-w-screen left-0 mx-2 md:mx-0 mt-3 md:mt-5 ">
    <form id="form" class="bg-white p-3 border-2 border-white grid grid-cols-1 md:grid-cols-11 gap-3 shadow-lg rounded-md" on:submit|preventDefault={submitHandler} novalidate>
        <div class="w-full md:col-span-5">
            <div class="w-full flex justify-center">
                <p class="w-fit text-center mb-4 p-2 text-black bg-orange-300 rounded-xl">Basic Information</p>
            </div>
            <div class="grid grid-flow-row grid-cols-6 gap-2 md:max-h-[470px]">

                <!-- Full Name -->
                <div class="w-full col-span-6 md:col-span-2 formGroup max-h-max" id="lastName">
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
                    <label for="purpose" class="hidden">Purpose of the Appointment</label>
                    <input type="text" id="purpose" placeholder="Purpose of the Appointment" bind:value={purpose} class="w-full p-2 text-black bg-orange-300 rounded-3xl placeholder:text-black placeholder:pl-1 outline-orange-300 focus:outline-offset-4 focus:outline-orange-300 focus:outline-[3px] transition-all duration-100" required>
                    <div class=" error text-red-600 text-sm pl-3"></div>
                </div>
            </div>
        </div>

        <!-- Appointment Date -->
        <div class="md:col-span-3">
            <div class="w-full flex justify-center">
                <p class="w-fit text-center mb-4 p-2 text-black bg-orange-300 rounded-xl">Appointment Schedule</p>
            </div>

            <div class="flex flex-col items-center h-[200px] md:h-max">
                <p class="w-full text-center">Kindly select an appointment date</p>
                <button type="button" class="w-[60%] md:w-full flex justify-between items-center p-[5px] bg-orange-300 rounded-xl" on:click={() => dateTimeVisible = !dateTimeVisible}>
                    {#if dateDisplay != "undefined, January NaN at NaN:NaNundefined"}
                        <p class="w-full text-center">{dateDisplay}</p>
                    {:else }
                        <p class="w-full text-center">Select a date</p>
                    {/if}
                    <i class="fa-regular fa-calendar"></i>
                </button>
                <div class="{dateTimeVisible ? "" : "hidden"} flex flex-col items-center transition-all duration-300">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="absolute top-0 left-0 w-screen min-h-screen" on:click|self={() => dateTimeVisible = !dateTimeVisible}></div>
                    <div class="relative w-5 h-5 bg-orange-300 top-[10px] rotate-45"></div>
                    <div class="w-full md:w-full h-max bg-orange-300 py-2 px-5 flex z-10 rounded-3xl">
                        <input type="datetime-local" id="date" class="date" bind:value={date} required>
                    </div>
                </div>
            </div>
        </div>
    
        <!-- Barangay Officials -->
        <div class="md:col-span-3 md:h-[550px] p-2 flex flex-col items-center md:items-center md:justify-center">
            <p class="p-[2px] bg-orange-300 mb-2 md:text-sm text-center rounded-xl">Who would you like to have an appointment with?</p>
            <p class="text-center text-sm">Below are the list of the Barangay Officials</p>
            <div class="overflow-auto h-[250px] w-full">
                <div class="p-1 w-full flex flex-col items-center md:items-start gap-2">
                    {#each officialsList as official}
                        <div class="flex flex-row gap-2">
                            <input type="radio" value={official} bind:group={officialReserved}>
                            <div class="w-full">
                                <p class="p-1 w-[300px] md:w-full md:text-sm bg-orange-300 rounded-lg">{official.name} <small>({official.position})</small></p>
                            </div>
                        </div>
                    {/each}
                </div>
                
            </div>
        </div>
    
        <!-- Submit Buttons -->
        <div class="flex items-center   justify-start gap-2">
            {#if !formValidated}
                <button type="button" 
                    on:click={()=>{
                    formValidation()
                    console.log('button pressed')
                    }}
                    class="{formValidated ? "hidden" : ""} h-[40px] p-2 bg-sky-600 text-white shadow-lg rounded-xl hover:scale-[1.05] active:scale-[0.95] transition-all duration-100"
                >Validate</button>
            {:else}
                <button type="submit" class="{formValidated ? "" : "hidden"}">Submit</button>
            {/if}
            <button type="reset"
                class="p-2 w-max bg-blue-900 text-white text-center rounded-2xl shadow-lg hover:scale-[1.05] active:scale-[0.95] transition-all duration-100"
                on:click={()=>formValidated=false}
            >
            <p>Clear Form</p>
        
        </button>
        </div>
    </form>

</div>