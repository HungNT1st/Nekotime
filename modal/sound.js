const playSound = (url) => {
    audio.src = url + '.mp3';
    audio.play();
}

const stopSound = (url) => {
    audio.src = url + 'mp3';
    audio.stop();
}