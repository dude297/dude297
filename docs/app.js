// Progressive enhancement: without JS or IntersectionObserver, page content is visible.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reducedMotion && "IntersectionObserver" in window) {
  document.documentElement.classList.add("js-motion");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

const controls = document.querySelector('.work-controls');
if (controls) {
  const search = document.querySelector('#project-search');
  const cards = [...document.querySelectorAll('.project-grid > article')];
  const buttons = [...document.querySelectorAll('[data-filter]')];
  let category = 'all';
  function filterProjects() {
    const query = search.value.trim().toLowerCase();
    let count = 0;
    cards.forEach(card => {
      const match = (category === 'all' || card.dataset.category === category) && card.textContent.toLowerCase().includes(query);
      card.hidden = !match;
      if (match) { count++; card.classList.add('visible'); }
    });
    document.querySelector('#project-count').textContent = `${count} of ${cards.length} projects`;
    document.querySelector('.project-empty').hidden = count !== 0;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  }
  function revealLinkedProject() {
    const target = document.getElementById(location.hash.slice(1));
    if (target && cards.includes(target) && target.hidden) {
      category = 'all'; search.value = ''; filterProjects(); target.scrollIntoView();
    }
  }
  buttons.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; filterProjects(); }));
  search.addEventListener('input', filterProjects);
  window.addEventListener('hashchange', revealLinkedProject);
  controls.hidden = false;
  filterProjects();
  revealLinkedProject();
}
