<script>
    
    export let announcementTitle = "";
    export let postOwner = "";
    export let date = "";
    export let announcementContent = "";


</script>

<div class="m-2 bg-gray-300 p-3 rounded">
    <p class="w-full text-center text-xl ">{announcementTitle}</p>
    <p class="w-full text-sm">Posted by: {postOwner} <br> {date}</p>
    <p class="w-full text-start text-base mt-5">{announcementContent}</p>
</div>
