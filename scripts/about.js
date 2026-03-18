  
// STARS REVIEW FUNCTIONALITY
const stars = document.querySelectorAll('.review-stars .fa-star');
const reviewUrl = "https://chromewebstore.google.com/detail/cherrypad/fhneekooapbagkckacdlemielahijgfd/reviews";

  stars.forEach((star, index) => {
    star.addEventListener('mouseenter', () => {
      stars.forEach((s, i) => s.classList.toggle('hovered', i <= index));
    });
    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hovered'));
    });

    star.addEventListener('click', () => {
      stars.forEach((s, i) => s.classList.toggle('selected', i <= index));
      window.open(reviewUrl, "_blank");
    });
});

 
// BACK BUTTON FUNCTIONALITY
const backButton = document.getElementById('back-button');
  backButton.addEventListener('click', () => {
    // go back cherrypad.html
    window.location.href = "cherrypad.html";
});


// FLOATING CHERRY
  const bg = document.getElementById('floating-bg');
  const numCherries = 15; // number of floating images
  const imgSrc = "icon/CherryPad.png";

  for (let i = 0; i < numCherries; i++) {
    const cherry = document.createElement('img');
    cherry.src = imgSrc;
    cherry.className = 'floating-cherry';

    // Randomize size between 20px and 60px
    const size = Math.random() * 40 + 20;
    cherry.style.width = size + 'px';

    // Random horizontal start
    cherry.style.left = Math.random() * 100 + 'vw';

    // Random animation duration between 15s and 35s
    const duration = Math.random() * 20 + 15;
    cherry.style.animationDuration = duration + 's';

    // Random delay
    cherry.style.animationDelay = Math.random() * 0 + 's';

    bg.appendChild(cherry);
  }