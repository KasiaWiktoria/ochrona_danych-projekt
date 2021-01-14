const POST = "POST";
const URL = "https://localhost/";
var HTTP_STATUS = {OK: 200, CREATED: 201, BAD_REQUEST: 400, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404, INTERNAL_SERVER_ERROR: 500};
const DECRYPT_PASSWD_FIELD_ID = "decrypt_passwd"


document.addEventListener('DOMContentLoaded', function (event) {
    let encrypted_notes_ids_list = getNotesIdsList()
    if (encrypted_notes_ids_list != []){
        encrypted_notes_ids_list.forEach(note_id => {
            addEventListenersForEncryptedNotes(note_id)
        })
    }
})

function getNotesIdsList(){
    let str = document.getElementById('encrypted_notes_ids_list').textContent
    let encrypted_notes_ids_list = []
    if (str != '[]'){
        let list_str = str.substring(
            str.lastIndexOf("[") + 1, 
            str.lastIndexOf("]")
        );
        list_str = list_str.split(',')
        
        list_str.forEach(element => {
            encrypted_notes_ids_list.push(element.trim())
        });
        console.log(encrypted_notes_ids_list)
    }
    return encrypted_notes_ids_list
}

function getCSRFheaders(note_id){
    const csrfToken = document.getElementById(note_id+'-csrf_token').value
    const headers = new Headers({
        "X-CSRF-Token": csrfToken
    })
    return headers
}

function isBlank(field) {
    if (field.value == "") {
        let message = "aby odszyfrować, wpisz jakąś wartość.";
        let warningElemId = "blankWarning"
        let warningElem = prepareWarningElem(warningElemId, message);
        appendAfterElem(DECRYPT_PASSWD_FIELD_ID, warningElem);
        return true;
    }
    return false
}

function addEventListenersForEncryptedNotes(note_id){
    let decryptNoteForm = document.getElementById(note_id +'-decrypt-note-form')

    decryptNoteForm.addEventListener('submit', function (event) {
        event.preventDefault()
    
        let decryptPasswdField = document.getElementById(note_id + '-' + DECRYPT_PASSWD_FIELD_ID)
    
        if(!isBlank(decryptPasswdField)) {
            submitForm(decryptNoteForm, "decrypt_note");
        } else {
            let id = note_id + "-button-submit-form";
            addfailureMessage(id,"Pole nie może pozostać puste.")
        }
    })
}

function submitForm(form, name) {
    let loginUrl = URL + name;
    console.log(loginUrl);
    let note_id = form['note_id'].value
    let headers = getCSRFheaders(note_id)

    let registerParams = {
        method: POST,
        body: new FormData(form),
        redirect: "follow",
        headers
    };

    fetch(loginUrl, registerParams)
            .then(response => getResponseData(response))
            .then(response =>showMessages(response, note_id))
            .catch(err => {
                console.log("Caught error: " + err);
                let id = note_id + "-button-submit-form";
                addfailureMessage(id,'Nie udało się wysłać zapytania');
            });
}

function getResponseData(response) {
    return response.json()
}

function showMessages(response, note_id) {
    let status = response.status;
    let id = note_id + "-button-submit-form";

    if (status === HTTP_STATUS.OK) {
        console.log(response.message);
        showNote(response.decrypted_note_content, note_id)
    } else if (status == HTTP_STATUS.BAD_REQUEST) {
        console.log("Podano niepoprawne hasło.")
        addfailureMessage(id,response.message)
    } else {
        console.error("Response status code: " + response.status);
        addfailureMessage(id,"Wysyłanie zapytania powiodło się. Nie jesteśmy w stanie zweryfikować poprawności wprowadzonych danych.")
        throw "Unexpected response status: " + response.status;
    }
}

function showNote(note, note_id){
    let note_field = document.getElementById(note_id+'_note_field')
    let text = document.createElement('p')
    text.className = 'text'
    text.textContent = note //jsEscape(note)
    removeDecryptPasswdInput(note_field, note_id)
    note_field.appendChild(text)
}
function removeDecryptPasswdInput(note_field, note_id){
    let decrypt_passwd_input = document.getElementById(note_id + '-decrypt-note-form')
    if (decrypt_passwd_input != null){
        note_field.removeChild(decrypt_passwd_input);
    }
}



function addfailureMessage(id,failureMessage) {
    removeWarningMessage("correct");
    removeWarningMessage("uncorrect");
    let uncorrectElem = prepareWarningElem("uncorrect", failureMessage);
    uncorrectElem.className = "uncorrect-field"
    appendAfterElem(id, uncorrectElem);
}

function removeWarningMessage(warningElemId) {
    let warningElem = document.getElementById(warningElemId);

    if (warningElem !== null) {
        warningElem.remove();
    }
}

function prepareWarningElem(newElemId, message) {
    let warningField = document.getElementById(newElemId);

    if (warningField === null) {
        let textMessage = document.createTextNode(message);
        warningField = document.createElement('span');

        warningField.setAttribute("id", newElemId);
        warningField.className = "warning-field";
        warningField.appendChild(textMessage);
    }
    return warningField;
}

function appendAfterElem(currentElemId, newElem) {
    let currentElem = document.getElementById(currentElemId);
    currentElem.insertAdjacentElement('afterend', newElem);
}
