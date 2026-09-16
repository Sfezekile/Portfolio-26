const widget = document.getElementById('widget');
const openWidget = document.getElementById('widgetBtn');
// const closeWidget = document.getElementById('menuClose');

openWidget.addEventListener('click', (e) => {
    e.stopPropagation();
    widget.classList.toggle('open');
});

// close on outside click, like a real start menu
document.addEventListener('click', (e) => {
    if (widget.classList.contains('open') && !widget.contains(e.target) && e.target !== openWidget) {
        widget.classList.remove('open');
    }
});


/* 

*/

const songDetails = [
    { title: "Before I Forget", artist: "The Kid LAROI", album: "BEFORE I FORGET" },
    { title: "FOR ALL THE DOGS", artist: "Drake", album: "FOR ALL THE DOGS" },
    { title: "Happier Than Ever", artist: "Billie Eilish", album: "Happier Than Ever" }
];

let currentIndex = 0;

function nextSong() {
    currentIndex = (currentIndex + 1) % songDetails.length;
    
    // Update song details
    document.querySelector('.song-name').textContent = songDetails[currentIndex].title;
    document.querySelector('.song-artist').textContent = songDetails[currentIndex].artist;
}
function prevSong() {
    currentIndex = (currentIndex - 1 + songDetails.length) % songDetails.length;

    // Update song details
    document.querySelector('.song-name').textContent = songDetails[currentIndex].title;
    document.querySelector('.song-artist').textContent = songDetails[currentIndex].artist;
}
