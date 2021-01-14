import {addCorrectMessage, addfailureMessage} from './form_functions.js';
import {GET, POST, URL, HTTP_STATUS} from './const.js'

const csrfToken = document.getElementById('csrf_token').value
const headers = new Headers({
    "X-CSRF-Token": csrfToken
});

let page_url = URL + 'get_notes_list'
document.addEventListener('DOMContentLoaded', function (event) {
    loadNotes(page_url);

})

function loadNotes(page_url){
    console.log('funkcja loadNotes')
    clearTable()

    fetchPacks(page_url).then(response => {
            if (response.status != HTTP_STATUS.OK){
                let id = "title";
                addfailureMessage(id,'Serwer zwrócił błąd')
            } else {
                return response.json()
            }
        }).then(response => {
            console.log('response: ', response)
            console.log('załadowanie listy notatek')
            let h1 = document.getElementById('title')

            let n_of_notes = response.notes.length
            if (n_of_notes > 0){
                console.log('lista nie jest pusta')
                let notes = response.notes
    
                let notes_list = document.createElement('div')
                notes_list.id = 'notes-list'
    
                notes.forEach(note =>
                    addNoteToList(notes_list, note)
                )
                h1.insertAdjacentElement('afterend', notes_list)
            } else {
                console.log('brak notatek')
                let empty_warning = document.createElement('div')
                empty_warning.className = "max-width-elem empty"
                empty_warning.id = 'empty-list-warning'
                empty_warning.textContent = 'Nie masz żadnych notatek'
                h1.insertAdjacentElement('afterend', empty_warning)
            }
        }).catch(err => {
            console.log("Caught error: " + err);
            let id = "title";
            let h1 = document.getElementById('title')
            addfailureMessage(id,"Pobieranie notatek nie powiodło się. ")
            let empty_warning = document.createElement('div')
            empty_warning.className = "max-width-elem empty"
            empty_warning.id = 'empty-list-warning'
            empty_warning.textContent = 'Pobieranie notatek nie powiodło się.'
            h1.insertAdjacentElement('afterend', empty_warning)
        });
}

function addNoteToList(notes_list, note){
    let note_field = document.createElement('div')
    note_field.className = 'note-field'

    let title = document.createElement('div')
    title.className = 'title'
    title.textContent = note.title
    note_field.appendChild(title)

    let author = document.createElement('div')
    author.className = 'author'
    author.textContent = note.author
    note_field.appendChild(author)

    let date = document.createElement('div')
    date.className = 'date'
    date.textContent = note.date
    note_field.appendChild(date)

    let text = document.createElement('p')
    text.className = 'text'
    text.textContent = note.text
    note_field.appendChild(text)

    notes_list.appendChild(note_field)
}

function updateNavButtons(prev,next){
    let prev_nav_btn = document.getElementById('prev_nav_btn')
    let next_nav_btn = document.getElementById('next_nav_btn')
    let a = document.createElement('a')
    a.className = 'btn'
    let text = document.createTextNode('')

    let prev_btn = document.getElementById('prev_btn')
    if (prev_btn != null){
        if (prev != null) {
            prev_btn.setAttribute('page_url', prev);
        } else {
            prev_btn.remove()
        }
    } else {
        if(prev != null){
            text.nodeValue = '<<'
        a.appendChild(text)
        a.id = 'prev_btn'
        a.setAttribute('page_url', prev);
            prev_nav_btn.appendChild(a)
        }
    }

    let next_btn = document.getElementById('next_btn')
    if (next_btn != null){
        if (next != null) {
            next_btn.setAttribute('page_url', next);
        } else {
            next_btn.remove()
        }
    } else {
        if(next != null){
            text.nodeValue = '>>'
            a.appendChild(text)
            a.id = 'next_btn'
            a.setAttribute('page_url', next);
            next_nav_btn.appendChild(a)
        }
    }
}

function fetchPacks(page_url){
    let url = page_url;

    let sendParams = {
        credentials: 'include',
        method: GET,
        mode: 'cors',
        headers
    };
    return fetch(url, sendParams)
}

function clearTable(){
    let table = document.getElementById('notes-table')
    if (table != null){
        table.parentNode.removeChild(table);
    }
}