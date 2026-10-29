const searchInput = document.querySelector("#music-search");
const audioPlayer = new Audio();
const playButton = document.querySelector('[data-player-action="play"]');
const trackTitle = document.querySelector("#track-title");
const trackArtist = document.querySelector("#track-artist");
const progressInput = document.querySelector("#progress");
const elapsedTime = document.querySelector("#elapsed-time");
const remainingTime = document.querySelector("#remaining-time");
const volumeInput = document.querySelector("#volume");

audioPlayer.volume = Number(volumeInput.value) / 100;

function updatePlayButton() {
    const isPlaying = !audioPlayer.paused;
    playButton.textContent = isPlaying ? "⏸️" : "▶️";
    playButton.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
}

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function updateProgress() {
    const duration = audioPlayer.duration;
    const currentTime = audioPlayer.currentTime;

    progressInput.value = Number.isFinite(duration) && duration > 0
        ? String((currentTime / duration) * 100)
        : "0";
    elapsedTime.textContent = formatTime(currentTime);
    remainingTime.textContent = `-${formatTime(
        Number.isFinite(duration) ? duration - currentTime : 0
    )}`;
}

function playCard(card) {
    audioPlayer.src = card.dataset.audio;
    trackTitle.textContent = card.querySelector("h3").textContent;
    trackArtist.textContent = card.querySelector("p").textContent;

    audioPlayer.play().catch((error) => {
        updatePlayButton();
        trackTitle.textContent = "Unable to play this file";
        console.error("Audio playback failed:", error);
    });
}

audioPlayer.addEventListener("play", updatePlayButton);
audioPlayer.addEventListener("pause", updatePlayButton);
audioPlayer.addEventListener("ended", updatePlayButton);
audioPlayer.addEventListener("timeupdate", updateProgress);
audioPlayer.addEventListener("loadedmetadata", updateProgress);

searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    document.querySelectorAll("[data-searchable]").forEach((card) => {
        card.hidden = !card.textContent.toLowerCase().includes(query);
    });
});

document.querySelectorAll("#songs .music-card[data-audio]").forEach((card) => {
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute(
        "aria-label",
        `Play ${card.querySelector("h3").textContent} by ${card.querySelector("p").textContent}`
    );
    card.addEventListener("click", () => playCard(card));
    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            playCard(card);
        }
    });
});

progressInput.addEventListener("input", () => {
    if (Number.isFinite(audioPlayer.duration)) {
        audioPlayer.currentTime = (Number(progressInput.value) / 100) * audioPlayer.duration;
        updateProgress();
    }
});

volumeInput.addEventListener("input", () => {
    audioPlayer.volume = Number(volumeInput.value) / 100;
    audioPlayer.muted = audioPlayer.volume === 0;
});

document.querySelectorAll("[data-player-action]").forEach((button) => {
    button.addEventListener("click", () => {
        const action = button.dataset.playerAction;

        if (action === "play") {
            if (!audioPlayer.src) return;

            if (audioPlayer.paused) {
                audioPlayer.play().catch((error) => {
                    updatePlayButton();
                    console.error("Audio playback failed:", error);
                });
            } else {
                audioPlayer.pause();
            }
            return;
        }

        if (["shuffle", "loop", "mute"].includes(action)) {
            const isPressed = button.getAttribute("aria-pressed") === "true";
            button.setAttribute("aria-pressed", String(!isPressed));
            if (action === "loop") audioPlayer.loop = !isPressed;
            if (action === "mute") audioPlayer.muted = !isPressed;
            button.setAttribute(
                "aria-label",
                action === "mute"
                    ? (isPressed ? "Mute" : "Unmute")
                    : button.textContent
            );
            button.textContent =
                action === "mute" ? (isPressed ? "Mute" : "Unmute") : button.textContent;
        }
    });
});