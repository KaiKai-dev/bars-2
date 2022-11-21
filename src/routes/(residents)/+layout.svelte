<script>
        let openMenu = false;


function menu(){
    let list = document.querySelector("ul");                                            

    openMenu = !openMenu;
}
</script>


<div class="md:p-7 bg-gradient-to-t from-orange-200 to-orange-300 min-h-screen">
    <nav class="md:px-5 md:pt-5 bg-white shadow-lg flex md:fit md:pb-0 md:justify-between md:rounded-md">
        <div class=" m-2">
            <img src="../../" alt="brgy logo" class="h-16 w-16 md:h-20 md:w-20 border-gray-500 border-2 rounded-[50%]">
        </div>
        <div class="w-full flex flex-col ml-2 mb-0 p-0 ">
            <div class="w-auto py-5 flex justify-between md:justify-center">
                <span class="md:mb-5 text-md md:text-2xl md:text-center align-middle">Barangay Appointment and Request System</span>
 
                <button class="md:hidden block mr-2 align-middle" on:click={menu}>
                    {#if !openMenu} 
 
                    <div class="w-5 h-1 bg-orange-400 mb-1"></div>
 
                    <div class="w-5 h-1 bg-orange-400 mb-1"></div>
 
                    <div class="w-5 h-1 bg-orange-400"></div>
 
                    {:else}
                    <div class="w-5 h-1 bg-orange-400 rotate-45"></div>
 
                    <div class="w-5 h-1 bg-orange-400 ] translate-y-[-4px] rotate-[135deg]"></div>
                    {/if}
 
                </button>
            </div>
            <button class="" on:click={menu}>
                <ul id="navlist" class="mt-8 md:mb-0 md:mt-0 md:flex md:items-center justify-between md:static bg-white absolute left-0 top-12 w-full text-center py-4 md:py-0 md:opacity-100 transition-all ease-in duration-300 {openMenu ? '' : 'hidden'}">
                    <li class="mx-4 my-6 md:my-0">
                        <a href="/" class="text-md md:text-xl md:px-3 md:pt-1 md:top-[2px] md:bg-orange-300 md:border-b-2 md:border-orange-300 md:text-gray-800 md:rounded-t-md md:hover:text-white hover:text-gray-500 hover:underline md:hover:no-underline duration-300">Homepage</a>
                    </li>
                    <li class="mx-4 my-6 md:my-0">
                        <a href="./docRequest" class="text-md md:text-xl md:px-3 md:pt-1 md:bg-orange-300 md:border-b-2 md:border-orange-300 md:text-gray-800 md:rounded-t-md md:hover:text-white hover:text-gray-500 hover:underline md:hover:no-underline duration-300">Document Request</a>
                    </li>
                    <li class="mx-4 my-6 md:my-0">
                        <a href="./aptRequest" class="text-md md:text-xl md:px-3 md:pt-1 md:bg-orange-300 md:border-b-2 md:border-orange-300 md:text-gray-800 md:rounded-t-md md:hover:text-white hover:text-gray-500 hover:underline md:hover:no-underline duration-300">Appointment Booking</a>
                    </li>
                    <li class="mx-4 my-6 md:my-0">
                        <a href="./reqTracker" class="text-md md:text-xl md:px-3 md:pt-1 md:bg-orange-300 md:border-b-2 md:border-orange-300 md:text-gray-800 md:rounded-t-md md:hover:text-white hover:text-gray-500 hover:underline md:hover:no-underline duration-300">Track Request</a>
                    </li>
                </ul>
 
            </button>
        </div>
    </nav>
    <main>
        <slot></slot>
    
    </main>

</div>
<footer class="bg-black bg-opacity-80 h-[200px] text-white">
    Footer
</footer>