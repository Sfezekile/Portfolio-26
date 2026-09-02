const widget = document.getElementById('widget');
const openWidget = document.getElementById('widgetBtn');
// const closeWidget = document.getElementById('menuClose');

openWidget.addEventListener('click', (e) => {
    e.stopPropagation();
    widget.classList.toggle('open');
});

// close on outside click, like a real start menu
document.addEventListener('click', (e) => {
    if (widget.classList.contains('open') && !widget.contains(e.target) && e.target !== openWidget) {
        widget.classList.remove('open');
    }
});
