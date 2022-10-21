<script>
    let announcements = [
        {id: 1, postedBy: 'admin1', dateCreated: 'October 21, 2022 at 3:10:03 PM', title: 'test', content: 'test'}, 
    ];
</script>

{#each announcements as announcement}
    <div class="m-2 bg-gray-300 p-3 rounded">
        <p class="w-full text-center text-xl ">{announcement.title}</p>
        <p class="w-full text-sm">Posted by: {announcement.postedBy} <br> {announcement.dateCreated}</p>
        <p class="w-full text-start text-base mt-5">{announcement.content}</p>
    </div>
{/each}
