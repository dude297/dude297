// Search is optional. Project links and the native disclosure work without JavaScript.
const archive = document.querySelector('#project-archive');
const search = document.querySelector('#project-search');
const rows = [...document.querySelectorAll('.project-row')];
const filters = [...document.querySelectorAll('[data-filter]')];
let category = 'all';
function filterProjects() {
  const query = search.value.trim().toLowerCase();
  let count = 0;
  rows.forEach(row => {
    const match = (category === 'all' || row.dataset.category === category) &&
      (row.textContent + ' ' + row.dataset.search).toLowerCase().includes(query);
    row.hidden = !match;
    if (match) count++;
  });
  document.querySelector('#project-count').textContent = `${count} of ${rows.length} projects`;
  document.querySelector('.project-empty').hidden = count !== 0;
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
}
function revealLinkedProject() {
  const target = document.getElementById(location.hash.slice(1));
  if (!target) return;
  if (target === document.querySelector('#projects') || archive.contains(target)) {
    archive.open = true;
    if (rows.includes(target) && target.hidden) {
      category = 'all'; search.value = ''; filterProjects();
    }
    target.scrollIntoView();
  }
}
filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; filterProjects(); }));
search.addEventListener('input', filterProjects);
window.addEventListener('hashchange', revealLinkedProject);
document.querySelector('.work-controls').hidden = false;
filterProjects(); revealLinkedProject();
