document.addEventListener("DOMContentLoaded", () => {

  // --- 1. TYPING EFFECT (From last time) ---
  const typingElement = document.getElementById("typing-heading");
  const textToType = "Your Trusted Lab Partner";
  let index = 0;

  function type() {
    if (typingElement && index < textToType.length) {
      typingElement.innerHTML += textToType.charAt(index);
      index++;
      setTimeout(type, 100); // Adjust typing speed (in ms)
    }
  }

  if (typingElement) {
    type();
  }

  // --- 2. CANVAS ATOM ANIMATION (From last time) ---
  const canvas = document.getElementById("atomCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
      }
      update() {
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
        this.x += this.speedX;
        this.y += this.speedY;
      }
      draw() {
        ctx.fillStyle = "rgba(0, 123, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      let numberOfParticles = (canvas.width * canvas.height) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    }

    function connectParticles() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          let dx = particles[a].x - particles[b].x;
          let dy = particles[a].y - particles[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            ctx.strokeStyle = `rgba(0, 123, 255, ${1 - distance / 120})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let particle of particles) {
        particle.update();
        particle.draw();
      }
      connectParticles();
      requestAnimationFrame(animate);
    }

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    });

    initParticles();
    animate();
  }

  // --- 3. NEW: FADE-IN ON SCROLL ---
  const sections = document.querySelectorAll(".content-section");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Optional: stop observing after it's visible
        // observer.unobserve(entry.target); 
      }
    });
  }, {
    threshold: 0.1 // Trigger when 10% of the section is visible
  });

  sections.forEach(section => {
    observer.observe(section);
  });

});