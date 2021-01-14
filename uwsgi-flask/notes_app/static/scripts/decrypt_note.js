import {addCorrectMessage, addfailureMessage, updateCorrectnessMessage, prepareOtherEventOnChange} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isAnyFieldBlank, isLoginAvailable, validateLogin, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, URL, HTTP_STATUS, NOTE_CONTENT_FIELD_ID, DECRYPT_PASSWD_FIELD_ID} from './const.js'
import {htmlEncode, jsEscape} from './additional_functions.js'

let note_id = 0

const csrfToken = document.getElementById('csrf_token').value
const headers = new Headers({
    "X-CSRF-Token": csrfToken
});

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

document.addEventListener('DOMContentLoaded', function (event) {

    let decryptNoteForm = document.getElementById("decrypt-note-form");

    decryptNoteForm.addEventListener("submit", function (event) {
        event.preventDefault();

        console.log(decryptNoteForm['note_id'].value)
        note_id = decryptNoteForm['note_id'].value

        let decryptPasswdField = document.getElementById(DECRYPT_PASSWD_FIELD_ID)

        if(!isBlank(decryptPasswdField)) {
            submitForm(decryptNoteForm, "decrypt_note");
        } else {
            let id = "button-submit-form";
            addfailureMessage(id,"Pole nie może pozostać puste.")
        }
    });
});

function submitForm(form, name) {
    let loginUrl = URL + name;
    console.log(loginUrl);
    console.log(form)

    let registerParams = {
        method: POST,
        body: new FormData(form),
        redirect: "follow",
        headers
    };

    fetch(loginUrl, registerParams)
            .then(response => getResponseData(response))
            .then(response =>showMessages(response))
            .catch(err => {
                console.log("Caught error: " + err);
                let id = "button-submit-form";
                addfailureMessage(id,'Nie udało się wysłać zapytania');
            });
}

function getResponseData(response) {
    return response.json()
}

function showMessages(response) {
    let status = response.status;
    let id = "button-submit-form";

    if (status === HTTP_STATUS.OK) {
        console.log("Udało się odszyfrować. ", response.message);
        showNote(response.decrypted_note_content, note_id)
    } else if (status == HTTP_STATUS.BAD_REQUEST) {
        console.log("Niepoprawne żądanie.")
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
    removeDecryptPasswdInput(note_field)
    note_field.appendChild(text)
}
function removeDecryptPasswdInput(note_field){
    let decrypt_passwd_input = document.getElementById('decrypt-note-form')
    if (decrypt_passwd_input != null){
        note_field.removeChild(decrypt_passwd_input);
    }
}
