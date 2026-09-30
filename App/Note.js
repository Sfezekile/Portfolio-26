/*
    Need to wok on the menu function
    needs to be able to:
    * Save a .txt in fine finder 
    * Open a .txt file
    * Edit a .txt file
*/
function openMenu(btn) {
  btn.nextElementSibling.classList.toggle('active');
}

window.Notes = { openMenu };
// kept as globals too since the HTML uses inline onclick=""
window.openMenu = openMenu;
