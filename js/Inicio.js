document.addEventListener('DOMContentLoaded', () => {
  // Placeholder rotatorio
  const searchBox = document.querySelector('.search-box');
  const texts = [
    'Busca tu próxima gran lectura...',
    'Encuentra bestsellers y clásicos...',
    'Descubre nuevos autores...',
    'Explora géneros literarios...'
  ];
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % texts.length;
    searchBox.placeholder = texts[idx];
  }, 3000);

  // Animar tarjetas con IntersectionObserver
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'slideInUp 0.6s ease-out forwards';
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.card').forEach((el, i) => {
    el.style.opacity = 0;
    el.style.animationDelay = `${i * 0.2}s`;
    observer.observe(el);
  });

  // Scroll parallax suave en hero
  window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero-section');
    const y = window.pageYOffset;
    if (hero) hero.style.transform = `translateY(${y * 0.3}px)`;
  });
});
