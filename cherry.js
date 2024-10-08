document.addEventListener('DOMContentLoaded', function() {
    // load saved values from local storage
    if (localStorage.getItem('noteInput')) {
        document.getElementById('noteInput').value = localStorage.getItem('noteInput');
    }
    if (localStorage.getItem('noteInput2')) {
        document.getElementById('noteInput2').value = localStorage.getItem('noteInput2');
    }

    // save button click
    document.getElementById('saveButton').addEventListener('click', function() {
        // get current date and time
        var now = new Date();
        var formattedTime = now.toLocaleString();

        // update last saved time in the footer
        document.getElementById('lastSaved').textContent = 'Last saved: ' + formattedTime;

        // get values from noteInput and noteInput2
        var noteInputValue = document.getElementById('noteInput').value;
        var noteInput2Value = document.getElementById('noteInput2').value;

        // save notes (storage)
        localStorage.setItem('noteInput', noteInputValue);
        localStorage.setItem('noteInput2', noteInput2Value);
    });
});

// Download .txt file button
saveTxtButton.addEventListener('click', function() {
    const blob = new Blob([noteInput.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'CherryNote.txt';
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});


 
// copy button

document.getElementById('noteInput').addEventListener('focus', () => {
    lastActiveTextarea = document.getElementById('noteInput');
});

document.getElementById('noteInput2').addEventListener('focus', () => {
    lastActiveTextarea = document.getElementById('noteInput2');
});

// Copy button functionality
document.addEventListener("DOMContentLoaded", function() {
    var copyButton = document.getElementById("copyButton");

    copyButton.addEventListener("click", function() {
        if (!lastActiveTextarea) return;

        lastActiveTextarea.focus();
        lastActiveTextarea.setSelectionRange(0, lastActiveTextarea.value.length);

        document.execCommand("copy");

        console.log("Text copied: " + lastActiveTextarea.value);
    });
});



// Paste content Input & Input 2

document.getElementById('noteInput').addEventListener('focus', () => {
    lastActiveTextarea = document.getElementById('noteInput');
});

document.getElementById('noteInput2').addEventListener('focus', () => {
    lastActiveTextarea = document.getElementById('noteInput2');
});

document.getElementById('pasteButton').addEventListener('click', async () => {
    try {
        if (!lastActiveTextarea) return;

        const text = await navigator.clipboard.readText();
        const startPos = lastActiveTextarea.selectionStart;

        lastActiveTextarea.setRangeText(text, startPos, startPos, 'end');
        lastActiveTextarea.dataset.lastPastedContent = JSON.stringify({
            text: text,
            startPos: startPos
        });

    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
    }
});



document.getElementById('noteInput').addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        const textarea = document.getElementById('noteInput');
        const pastedContent = JSON.parse(textarea.dataset.lastPastedContent || '{}');

        if (pastedContent.text) {
            // calculate the end position of the pasted content
            const endPos = pastedContent.startPos + pastedContent.text.length;

            // remove the pasted content
            textarea.setRangeText('', pastedContent.startPos, endPos, 'end');

            // prevent the default undo behavior
            e.preventDefault();
        }
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const versionButton = document.getElementById('versionButton');
    const noteInput = document.getElementById('noteInput2');

    if (versionButton && noteInput) {
        versionButton.addEventListener('click', function() {
            const textToToggle = " 🍒 Hello there! You've discovered an Easter egg! 🍒 Have a nice day! ";
            if (noteInput.value.includes(textToToggle)) {
                // remove the text if it's already there
                noteInput.value = noteInput.value.replace(textToToggle, '');
            } else {
                // Add the text if it's not there
                noteInput.value += textToToggle;
            }
        });
    }
});


        // emoji panel functionality
document.addEventListener('DOMContentLoaded', function() {
    const emojiButton = document.getElementById('emojiButton');
    const emojiPanel = document.getElementById('emojiPanel');
    const noteInput1 = document.getElementById('noteInput');
    const noteInput2 = document.getElementById('noteInput2');
    let activeInput = null; // track the currently active input

    // focusing on the input fields
    noteInput1.addEventListener('focus', function() {
        activeInput = noteInput1;
    });

    noteInput2.addEventListener('focus', function() {
        activeInput = noteInput2;
    });

    emojiButton.addEventListener('click', function(event) {
        // prevent the click from propagating to the document event listener
        event.stopPropagation();
        emojiPanel.style.display = emojiPanel.style.display === 'block' ? 'none' : 'block';
    });

    emojiPanel.addEventListener('click', function(event) {
        if (event.target.classList.contains('emoji')) {
            // ensure that an active input is selected
            if (activeInput) {
                insertAtCursor(activeInput, event.target.textContent);
            }
        }
    });

    document.addEventListener('click', function(event) {
        if (!emojiButton.contains(event.target) && !emojiPanel.contains(event.target)) {
            emojiPanel.style.display = 'none';
        }
    });

    function insertAtCursor(input, textToInsert) {
        const startPos = input.selectionStart;
        const endPos = input.selectionEnd;
        const beforeValue = input.value.substring(0, startPos);
        const afterValue = input.value.substring(endPos, input.value.length);
        input.value = beforeValue + textToInsert + afterValue;
        // move the cursor to the end
        input.selectionStart = input.selectionEnd = startPos + textToInsert.length;
        // refocus the textarea after inserting
        input.focus();
    }
});



        document.addEventListener('DOMContentLoaded', function() { 
            // go to WebStore - Store
            document.getElementById('WebStoreButton').addEventListener('click', function() {
                window.open('https://chromewebstore.google.com/detail/cherrypad/fhneekooapbagkckacdlemielahijgfd', '_blank');
            });
        
            // go to Github
            document.getElementById('GithubButton').addEventListener('click', function() {
                window.open('https://github.com/cafali', '_blank');
            });
        });
        

        clearButton2.addEventListener('click', function() {
            noteInput2.value = '';
            localStorage.setItem('note2', '');
        });

        clearButton.addEventListener('click', function() {
            noteInput.value = '';
            localStorage.setItem('note', '');
        });
        

//CherryLogo message fullscreen
const logoImage = document.getElementById('logo-image');
const noteInput = document.getElementById('noteInput');
const toggleText = " 😡 STOP CLICKING RANDOM THINGS!!! 😡 ";

logoImage.addEventListener('click', function() {
    if (noteInput.value.includes(toggleText)) {
        noteInput.value = noteInput.value.replace(toggleText, '');  // Remove if it's already there
    } else {
        noteInput.value += toggleText;
    }
});


//Shortcuts Fullscreen

//Save Ctrl+S
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault(); 
        document.getElementById('saveButton').click(); 
    }
});

//Emoji Panel Ctrl+E
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'e') {
        event.preventDefault(); 
        document.getElementById('emojiButton').click(); 
    }
});

//Download Ctrl+D
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'd') {
        event.preventDefault(); 
        document.getElementById('saveTxtButton').click(); 
    }
});
