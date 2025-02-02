document.addEventListener('DOMContentLoaded', function() {
  const emojiRain = () => {
    const emojis = ['🥚', '🐣', '🐰', '🍒', '📝', '🐇', '🦉', '⭐', '💖', '🍪', '🔥'];
    const container = document.body;
    let emojiClickCount = 0; // counter

    setInterval(() => {
      const emoji = document.createElement('span');
      emoji.classList.add('emoji');
      emoji.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
      emoji.style.left = Math.random() * window.innerWidth + 'px'; 
      emoji.style.fontSize = Math.random() * 40 + 30 + 'px';
      
      // emoji hover 
      emoji.addEventListener('mouseover', function() {
        emoji.remove(); // remove emoji on hover
        emojiClickCount++; // counter on hover
        document.getElementById('counter').innerHTML = 'SCORE: ' + emojiClickCount;
      });

      container.appendChild(emoji);

      // Check if emoji has reached the bottom
      const checkEmojiPosition = setInterval(() => {
        const emojiRect = emoji.getBoundingClientRect();
        if (emojiRect.bottom >= window.innerHeight) {
          window.location.href = 'cherrypad.html'; // end game when emoji reaches bottom
          clearInterval(checkEmojiPosition); // stop checking 
        }
      }, 100);

      // remove emoji after it falls
      setTimeout(() => {
        emoji.remove();
        clearInterval(checkEmojiPosition); // stop checking if the emoji is removed
      }, 10000); // fall animation duration
    }, 300); // frequency of emoji generation
  };

  emojiRain();
});
