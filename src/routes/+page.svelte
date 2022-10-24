<script>
	import Annnouncement from '../lib/components/annnouncement.svelte';
    import {db} from "$lib/stores/firebase.js"
    import { collection, query, onSnapshot, Timestamp} from "firebase/firestore";

    let announcements = [
        // {id: 1, postedBy: 'admin1', dateCreated: 'October 21, 2022 at 3:10:03 PM', title: 'test', content: 'test'}, 
    ];

    const q = query(collection(db, "announcements"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const announcement = [];

        querySnapshot.forEach((doc) => {
            announcement.push({
                postedBy: doc.data().postedBy,
                dateCreated: doc.data().dateCreated.toDate(),
                title: doc.data().title,
                content: doc.data().content
            })
        })
        announcements = [...announcement];
        
    })

</script>

<main>
    <div class="mt-3 mx-2 mb-2 md:mt-5 md:mx-3 bg-white rounded p-3">
        <p>Welcome to</p> <br>
        <h1>Barangay United Bayanihan Appointment and Request System</h1>
    </div>
    <div class="mt-2 mx-2 mb-2 md:mx-3 bg-white rounded p-3">
        <p>Announcements:</p>
        {#each announcements as announcement}
            <Annnouncement
                announcementTitle = {announcement.title}
                postOwner = {announcement.postedBy}
                date = {announcement.dateCreated}
                announcementContent = {announcement.content}
            />
            
        {/each}
    </div>

</main>


