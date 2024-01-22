// set API key for Giphy
const apiKey = 'A1VVG9w2RogKYp7O58qZ8pzmZfQU0cq2';

// get HTML elements by their IDs
const showTextInputButton = document.getElementById('showTextInputButton');
const showSpeakerButton = document.getElementById('showSpeakerButton');
const textBox = document.getElementById('textBox');
const micButton = document.getElementById('micButton');
const convertButton = document.getElementById('convertButton');
const imageBox = document.getElementById('imageBox');
const gifBox = document.getElementById('gifBox');

// event listener for showing text input and convert button
showTextInputButton.addEventListener('click', () => {
    textBox.style.display = 'block';
    convertButton.style.display = 'block';
    micButton.style.display = 'none';
    textBox.value = '';
    imageBox.innerHTML = '';
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
        generateGifsForSentence(sentence);
    } else {
        alert('Please enter a sentence before converting.');
    }
});

// function to generate GIFs for each word in a sentence
function generateGifsForSentence(sentence) {
    const words = sentence.split(' ');

    // recursive function to search and display GIF for each word
    function searchAndDisplayWord(index) {
        if (index < words.length) {
            const word = words[index].toLowerCase();

            // check conditions before fetching GIF
            if (word.length > 2 && !conjunctionsToSkip.includes(word) && !prepositionsToSkip.includes(word) && !definiteArticlesToSkip.includes(word)) {
                fetch(`https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent('Sign Language Asl by Sign with Robert ' + word)}&api_key=${apiKey}`)
                    .then(response => response.json())
                    .then(data => {
                        const gifUrl = data.data.length > 0 ? data.data[0].images.original.url : '';
                        displayGif(gifUrl);
                        
                        // clear GIF after 3 seconds and proceed to the next word
                        setTimeout(() => {
                            gifBox.innerHTML = '';
                            searchAndDisplayWord(index + 1);
                        }, 3000);
                    })
                    .catch(error => {
                        console.error('Error fetching GIF:', error);
                        
                        // proceed to the next word in case of an error
                        setTimeout(() => searchAndDisplayWord(index + 1), 0);
                    });
            } else {
                // proceed to the next word
                setTimeout(() => searchAndDisplayWord(index + 1), 0);
            }
        } 
    }

    // start searching and displaying GIFs for the first word
    searchAndDisplayWord(0);
}

// function to display a GIF
function displayGif(url) {
    const gifImage = document.createElement('img');
    gifImage.src = url;
    gifImage.alt = 'GIF';
    gifImage.style.maxWidth = '100%';
    gifImage.style.height = 'auto';
    gifBox.appendChild(gifImage);
}

// function to start speech-to-text recognition
function startSpeechToText() {
    const recognition = new webkitSpeechRecognition() || new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // handle recognition results
    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
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

// arrays of words to skip in GIF generation
const conjunctionsToSkip = ['and', 'but', 'or', 'so', 'nor', 'for', 'yet'];
const prepositionsToSkip = ['in', 'on', 'under', 'over', 'above', 'below', 'through', 'across', 'around', 'between', 'among', 'of', 'to', 'with', 'by', 'at'];
const definiteArticlesToSkip = ['the'];
