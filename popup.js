document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('saveButton');
    const saveTxtButton = document.getElementById('saveTxtButton');
    const clearButton = document.getElementById('clearButton');
    const noteInput = document.getElementById('noteInput');
    const cherryIcon = document.querySelector('.cherry-icon');
    const fullscreenLink = document.getElementById('Fullscreen');
  
    // cherry icon blink
    function blinkCherryIcon() {
        cherryIcon.style.filter = 'brightness(1.5)';
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
  
    // Save content Save button
    saveButton.addEventListener('click', function() {
        localStorage.setItem('note', noteInput.value);
        blinkCherryIcon();
        spinCherryIconOnce(); // spinning effect
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
  
    // Clear 
    clearButton.addEventListener('click', function() {
        noteInput.value = '';
        localStorage.setItem('note', ''); // save the cleared state to local storage
        blinkCherryIcon();
        spinCherryIconOnce(); // spinning effect
    });
  
    // Load saved note from local storage when the popup is opened
    const savedNote = localStorage.getItem('note');
    if (savedNote) {
        noteInput.value = savedNote;
    }

    // Add click event to cherry icon only if it's on popup.html
    if (window.location.pathname.includes("popup.html")) {
        cherryIcon.addEventListener("click", function() {
            noteInput.value += "Hello there! You've discovered an Easter egg!";
        });

        // Add click event to Fullscreen.png to save content and redirect
        fullscreenLink.addEventListener('click', function(event) {
            event.preventDefault(); // prevent default behavior of the link
            saveButton.click(); // save the content using the save button
            setTimeout(function() {
                window.open("CherryPad.html", '_blank'); // open in a new tab after 1000ms
            }, 1000);
        });
    }
});

