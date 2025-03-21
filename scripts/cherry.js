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

// AutoSave both fields
document.addEventListener('DOMContentLoaded', function() {
    const noteInput1 = document.getElementById('noteInput');
    const noteInput2 = document.getElementById('noteInput2');

    // Load saved values from localStorage
    if (localStorage.getItem('noteInput')) {
        noteInput1.value = localStorage.getItem('noteInput');
    }
    if (localStorage.getItem('noteInput2')) {
        noteInput2.value = localStorage.getItem('noteInput2');
    }

    // Save to localStorage on input
    function saveInput(key, element) {
        localStorage.setItem(key, element.value);
    }

    noteInput1.addEventListener('input', function() {
        saveInput('noteInput', noteInput1);
    });

    noteInput2.addEventListener('input', function() {
        saveInput('noteInput2', noteInput2);
    });
});

//blink logo Cherry when saving (fullscreen)
const cherryIcon = document.getElementById('logo-image');
const saveButton = document.getElementById('saveButton');

function blinkCherryIcon() {
    cherryIcon.style.filter = 'brightness(1.5)';

    setTimeout(function() {
        cherryIcon.style.filter = 'brightness(1)';
    }, 500);
}

saveButton.addEventListener('click', function() {
    blinkCherryIcon();
});

// Download .txt file button based on active window (noteInput/noteInput2)
let lastActiveTextarea = null;

document.getElementById('noteInput').addEventListener('focus', () => {
    lastActiveTextarea = document.getElementById('noteInput');
});

document.getElementById('noteInput2').addEventListener('focus', () => {
    lastActiveTextarea = document.getElementById('noteInput2');
});

document.getElementById('saveTxtButton').addEventListener('click', function() {
    if (!lastActiveTextarea) return;

    const content = lastActiveTextarea.value;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'CherryNote.txt';
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Copy button Fullscreen
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

// paste content on active field (Input 1&2)
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

        // insert the text at the cursor position
        lastActiveTextarea.setRangeText(text, startPos, startPos, 'end');
        lastActiveTextarea.focus(); // ensure the textarea is focused
        lastActiveTextarea.selectionStart = startPos + text.length; // move cursor to end of pasted text
        lastActiveTextarea.selectionEnd = startPos + text.length;

        // save the updated content to localStorage
        if (lastActiveTextarea.id === 'noteInput') {
            localStorage.setItem('noteInput', lastActiveTextarea.value);
        } else if (lastActiveTextarea.id === 'noteInput2') {
            localStorage.setItem('noteInput2', lastActiveTextarea.value);
        }
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

//version buttton

// when you click the version button - a message should appear (noteinput 2)
document.addEventListener('DOMContentLoaded', function() {   //1.5.0 fix
    const versionButton = document.getElementById('versionButton');
    const noteInput = document.getElementById('noteInput2');

    if (versionButton && noteInput) {
        versionButton.addEventListener('click', function() {
            const textToToggle = " 🍒 Something interesting is happening... Keep going! 🍒 ";
            const textWithNewline = textToToggle + '\n\n';
            const currentValue = noteInput.value;

            if (currentValue.startsWith(textWithNewline)) {
                // Remove the text and its newline if it's already at the top
                noteInput.value = currentValue.replace(textWithNewline, '');
            } else {
                // Add the text to the top with a newline
                noteInput.value = textWithNewline + currentValue;
            }
        });
    }
});

// versionButton eastereggclick -> redirect
let clickCount = 0;

document.addEventListener('DOMContentLoaded', function() {
    const versionButton = document.getElementById('versionButton');

    versionButton.addEventListener('click', function() {
        clickCount++;

        if (clickCount === 5) {
            window.location.href = 'hidden.html';
        }
    });
});

// emoji panel

// emoji panel display on hover 1.5.2
document.addEventListener('DOMContentLoaded', function() {
    const emojiButton = document.getElementById('emojiButton');
    const emojiPanel = document.getElementById('emojiPanel');
    const buttonsToClose = document.querySelectorAll('.button:not(#emojiButton)');

    // open emoji panel when hovering over emoji button
    emojiButton.addEventListener('mouseenter', function() {
        emojiPanel.style.display = 'block';
    });

    // close emoji panel when hovering over other buttons
    buttonsToClose.forEach(function(button) {
        button.addEventListener('mouseenter', function() {
            emojiPanel.style.display = 'none';
        });
    });

    // no collapsing when hovering overpanel
    emojiPanel.addEventListener('mouseenter', function() {
        emojiPanel.style.display = 'block';
    });
});

// emoji panel functionality
document.addEventListener('DOMContentLoaded', function() {
    const emojiButton = document.getElementById('emojiButton');
    const emojiPanel = document.getElementById('emojiPanel');
    const noteInput1 = document.getElementById('noteInput');
    const noteInput2 = document.getElementById('noteInput2');
    let activeInput = null; // track the currently active input

    // Focusing on the input fields
    noteInput1.addEventListener('focus', function() {
        activeInput = noteInput1;
    });

    noteInput2.addEventListener('focus', function() {
        activeInput = noteInput2;
    });

    emojiButton.addEventListener('click', function(event) {
        // Prevent the click from propagating to the document event listener
        event.stopPropagation();
        emojiPanel.style.display = emojiPanel.style.display === 'block' ? 'none' : 'block';
    });

    emojiPanel.addEventListener('click', function(event) {
        if (event.target.classList.contains('emoji')) {
            // Ensure that an active input is selected
            if (activeInput) {
                insertAtCursor(activeInput, event.target.textContent);
                // Save to localStorage after inserting emoji
                if (activeInput === noteInput1) {
                    localStorage.setItem('noteInput', activeInput.value);
                } else if (activeInput === noteInput2) {
                    localStorage.setItem('noteInput2', activeInput.value);
                }
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
        // Move the cursor to the end
        input.selectionStart = input.selectionEnd = startPos + textToInsert.length;
        // Refocus the textarea after inserting
        input.focus();
    }
});



        //Bottom Buttons CherryPad.html
        document.addEventListener('DOMContentLoaded', function() { 
            // go to WebStore
            document.getElementById('WebStoreButton').addEventListener('click', function() {
                window.open('https://chromewebstore.google.com/detail/cherrypad/fhneekooapbagkckacdlemielahijgfd', '_blank');
            });
            // go to Github 
            document.getElementById('GithubButton').addEventListener('click', function() {
                window.open('https://github.com/cafali/CherryPad', '_blank');
            });
            // go to About
            document.getElementById('AboutButton').addEventListener('click', function() {
                window.location.href = 'about.html';
            });
        });
        
        //Clear Notes + Ask user (browser popup)
        clearButton2.addEventListener('click', function() {
            if (confirm("This action will erase your note. Are you sure you want to proceed?")) {
                noteInput2.value = '';
                localStorage.setItem('note2', '');
                document.getElementById('saveButton').click(); 
            }
        });
        
        clearButton.addEventListener('click', function() {
            if (confirm("This action will erase your note. Are you sure you want to proceed?")) {
                noteInput.value = '';
                localStorage.setItem('note', '');
                document.getElementById('saveButton').click(); 
            }
        });
        
//CherryLogo message fullscreen when click
const logoImage = document.getElementById('logo-image');
const noteInput = document.getElementById('noteInput');
const toggleText = " 😡 STOP CLICKING RANDOM THINGS!!! 😡 \n\n";

logoImage.addEventListener('click', function() {
    if (noteInput.value.includes(toggleText.trim())) {
        noteInput.value = noteInput.value.replace(toggleText, '');  // Remove if it's already there
    } else {
        noteInput.value = toggleText + noteInput.value.trim();  // Insert text at the very top (noteinput 1)
    }
});

//keyboard shortcuts fullscreen

//Ctrl+S for SAVE
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 's' || event.key === 'S')) {
        event.preventDefault(); 
        document.getElementById('saveButton').click();
    }
});

//CTRL+E for Emoji Panel
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 'e' || event.key === 'E')) {
        event.preventDefault(); 
        document.getElementById('emojiButton').click(); 
    }
});

//CTRL+D Download 
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 'd' || event.key === 'D')) {
        event.preventDefault(); 
        document.getElementById('saveTxtButton').click(); 
    }
});

/*
  CHERRY.JS
  Manages CherryPad's core features including note saving/loading, autosave, emoji panel, 
  copy/paste functionality, version control easter egg, and keyboard shortcuts (save, emoji, download).
*/