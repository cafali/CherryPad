document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('saveButton');
    const saveTxtButton = document.getElementById('saveTxtButton');
    const clearButton = document.getElementById('clearButton');
    const noteInput = document.getElementById('noteInput');
    const cherryIcon = document.querySelector('.cherry-icon');
    const fullscreenLink = document.getElementById('Fullscreen');
  
    // cherry icon blink
    function blinkCherryIcon() {
        cherryIcon.style.filter = 'brightness(1.6)';
        setTimeout(function() {
            cherryIcon.style.filter = 'brightness(1)';
        }, 500);
    }
  
    // spinning animation cherry
    function spinCherryIconOnce() {
        cherryIcon.classList.add('spin-once');
        setTimeout(function() {
            cherryIcon.classList.remove('spin-once');
        }, 1000); // duration
    }
  
    // save content Save button
    saveButton.addEventListener('click', function() {
        localStorage.setItem('note', noteInput.value);
        blinkCherryIcon();
        spinCherryIconOnce(); // spinning effect
    });
  
    // download .txt file button
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
  
    // clear 
    clearButton.addEventListener('click', function() {
        noteInput.value = '';
        localStorage.setItem('note', ''); // save the cleared state to local storage
        blinkCherryIcon();
        spinCherryIconOnce(); // spinning effect
    });
    
    // load saved note from local storage when the popup is opened
    const savedNote = localStorage.getItem('note');
    if (savedNote) {
        noteInput.value = savedNote;
    }

    // add click event to cherry icon only if on popup.html
    if (window.location.pathname.includes("popup.html")) {
        cherryIcon.addEventListener("click", function() {
            noteInput.value += "🍒 Click! 🍒";
        });

        // add click event to Fullscreen.png to save content and redirect to fullscreen
        fullscreenLink.addEventListener('click', function(event) {
            event.preventDefault(); 
            saveButton.click();
            setTimeout(function() {
                window.open("CherryPad.html", '_blank'); // open in a new tab after "X" ms
            }, 150); //1.5.2
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // load from local storage
    if (localStorage.getItem('noteInput')) {
        document.getElementById('noteInput').value = localStorage.getItem('noteInput');
    }

    // save button click
    document.getElementById('saveButton').addEventListener('click', function() {
        // get current date and time
        var now = new Date();
        var formattedTime = now.toLocaleString();

        // get values from noteInput and noteInput2
        var noteInputValue = document.getElementById('noteInput').value;

        // save notes (storage)
        localStorage.setItem('noteInput', noteInputValue);
    });
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

// AutoSave
document.addEventListener('DOMContentLoaded', function() {
    const noteInput = document.getElementById('noteInput');

    if (localStorage.getItem('noteInput')) {
        noteInput.value = localStorage.getItem('noteInput');
    }

    noteInput.addEventListener('input', function() {
        localStorage.setItem('noteInput', noteInput.value);
    });
});

//Shortcuts Popup

//Save Ctrl+S
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 's' || event.key === 'S')) {
        event.preventDefault(); 
        document.getElementById('saveButton').click(); 
    }
});

//Download Ctrl+D
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 'd' || event.key === 'D')) {
        event.preventDefault(); 
        document.getElementById('saveTxtButton').click(); 
    }
});

/*
  POPUP.JS
  Manages functionality for CherryPad popup, including note saving/loading, clear note,
  fullscreen mode redirection, and keyboard shortcuts (save, download).
*/
