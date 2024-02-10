// set API key for YouTube
const apiKey = 'AIzaSyBVMC9Bj8CDO9dRFEED3EI6jr3-UTXGwrs';

// ASLU Signs YouTube channel ID
const asluChannelId = 'UCZy9xs6Tn9vWqN_5l0EEIZA';

// get HTML elements by their IDs
const showTextInputButton = document.getElementById('showTextInputButton');
const showSpeakerButton = document.getElementById('showSpeakerButton');
const textBox = document.getElementById('textBox');
const micButton = document.getElementById('micButton');
const convertButton = document.getElementById('convertButton');
const gifBox = document.getElementById('gifBox');

// event listener for showing text input and convert button
showTextInputButton.addEventListener('click', () => {
    textBox.style.display = 'block';
    convertButton.style.display = 'block';
    micButton.style.display = 'none';
    textBox.value = '';
    gifBox.innerHTML = '';
});

// event listener for showing speaker input, mic button, and convert button
showSpeakerButton.addEventListener('click', () => {
    textBox.style.display = 'block';
    micButton.style.display = 'block';
    convertButton.style.display = 'block';
    startSpeechToText();
});

// event listener for convert button, checks if sentence is entered
convertButton.addEventListener('click', () => {
    const sentence = textBox.value.trim();
    if (sentence !== '') {
        generateVideosForSentence(sentence);
    } else {
        alert('Please enter a sentence before converting.');
    }
});

// function to display a YouTube video
function displayVideo(videoId) {
    const videoFrame = document.createElement('iframe');
    videoFrame.id = 'youtube-player';
    videoFrame.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=0&showinfo=0`;
    videoFrame.width = '560';
    videoFrame.height = '315';
    videoFrame.allowFullscreen = true;
    videoFrame.setAttribute('allow', 'autoplay');
    gifBox.appendChild(videoFrame);

    // Hide menu elements

}

// function to play the YouTube video
function playVideo() {
    const player = document.getElementById('youtube-player');
    if (player) {
        player.contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*');
    }
}

// function to clear the YouTube video
function clearVideo() {
    const player = document.getElementById('youtube-player');
    if (player) {
        player.parentNode.removeChild(player);
    }
}

// function to start speech-to-text recognition
function startSpeechToText() {
    const recognition = new webkitSpeechRecognition() || new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // handle recognition results
    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript; // adding into text box
        textBox.value = transcript;
    };

    // handle recognition errors
    recognition.onerror = function (event) {
        console.error('Speech recognition error:', event.error);
    };

    // handle recognition end
    recognition.onend = function () {
        console.log('Speech recognition ended.');
    };

    // start speech recognition
    recognition.start();
}

// arrays of words to skip in gif generation
const conjunctionsToSkip = ['and', 'but', 'or', 'so', 'nor', 'for', 'yet'];
const prepositionsToSkip = ['in', 'on', 'under', 'over', 'above', 'below', 'through', 'across', 'around', 'between', 'among', 'of', 'to', 'with', 'by', 'at'];
const definiteArticlesToSkip = ['the'];
const verbsToSkip = ['are']

// function to parse ISO 8601 duration
function parseISO8601Duration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    const hours = (match[1] ? parseInt(match[1], 10) : 0) || 0;
    const minutes = (match[2] ? parseInt(match[2], 10) : 0) || 0;
    const seconds = (match[3] ? parseInt(match[3], 10) : 0) || 0;

    return hours * 3600 + minutes * 60 + seconds;
}

// function to generate videos for a sentence
function generateVideosForSentence(sentence) {
    const words = sentence.split(' ');

    // recursive function to search and display video for each word
    function searchAndDisplayWord(index) {
        if (index < words.length) {
            const word = words[index].toLowerCase();

            // check conditions before fetching video
            if (word.length > 2 && !conjunctionsToSkip.includes(word) && !prepositionsToSkip.includes(word) && !definiteArticlesToSkip.includes(word) && !verbsToSkip.includes(word)) {
                fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(word)}&type=video&channelId=${asluChannelId}&key=${apiKey}`)
                    .then(response => response.json())
                    .then(data => {
                      
                            const videoId = data.items.length > 0 ? data.items[0].id.videoId : '';
                            const videoTitle = data.items.length > 0 ? data.items[0].snippet.title : '';

                            if (videoTitle.length <= 10) {
                            displayVideo(videoId);

                            // automatically play the video
                            playVideo();

                            // get video duration from YouTube Data API
                            fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${apiKey}`)
                                .then(response => response.json())
                                .then(data => {
                                    const duration = parseISO8601Duration(data.items[0].contentDetails.duration);

                                    // clear video after the video duration
                                    setTimeout(() => {
                                        clearVideo();
                                        // proceed to the next word
                                        searchAndDisplayWord(index + 1);
                                    }, duration * 1000); // convert duration to milliseconds
                                })
                                .catch(error => {
                                    console.error('Error fetching video duration:', error);

                                    // proceed to the next word in case of an error
                                    setTimeout(() => searchAndDisplayWord(index + 1), 0);
                                });
                        }
                    }) // Add closing parenthesis and semicolon here
                    .catch(error => {
                        console.error('Error fetching video:', error);

                        // proceed to the next word in case of an error
                        setTimeout(() => searchAndDisplayWord(index + 1), 0);
                    });
            } else {
            // proceed to the next word
            setTimeout(() => searchAndDisplayWord(index + 1), 0);
        }
    }
}

// start searching and displaying videos for the first word
searchAndDisplayWord(0);
}
