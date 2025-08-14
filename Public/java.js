console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let res = await fetch(`/api/songs?folder=${folder}`);
    songs = await res.json();

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    songs.forEach((songUrl, i) => {
        let name = songUrl.split("/").pop();
        songUL.innerHTML += `
            <li>
                <img class="invert" width="34" src="img/music.svg">
                <div class="info"><div>${name}</div></div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg">
                </div>
            </li>`;
    });

    Array.from(songUL.querySelectorAll("li")).forEach((li, i) => {
        li.addEventListener("click", () => playMusic(songs[i]));
    });

    return songs;
}


const playMusic = (track, pause = false) => {
    currentSong.src = track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").textContent = decodeURI(track.split("/").pop());
    document.querySelector(".songtime").textContent = "00:00 / 00:00";
};


async function displayAlbums() {
    let res = await fetch(`/api/albums`);
    let albums = await res.json();
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    albums.forEach(album => {
        cardContainer.innerHTML += `
        <div data-folder="${album.name}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M5 20V4L19 12L5 20Z" fill="#000"/></svg>
            </div>
            <img src="${album.cover}" alt="">
            <h2>${album.title}</h2>
            <p>${album.description}</p>
        </div>`;
    });

    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async e => {
            songs = await getSongs(card.dataset.folder);
            playMusic(songs[0]);
        });
    });
}


async function main() {
    await displayAlbums();
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    // Auto play next song when current ends
    currentSong.addEventListener("ended", () => {
        let currentPath = decodeURI(currentSong.src.replace(window.location.origin, ""));
        let index = songs.indexOf(currentPath);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        } else {
            // Optional: Loop to first song
            playMusic(songs[0]);
        }
    });


    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    previous.addEventListener("click", () => {
        let currentPath = decodeURI(currentSong.src.replace(window.location.origin, ""));
        let index = songs.indexOf(currentPath);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });


    // Next button
    next.addEventListener("click", () => {
        let currentPath = decodeURI(currentSong.src.replace(window.location.origin, ""));
        let index = songs.indexOf(currentPath);
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });


    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })





}

main() 