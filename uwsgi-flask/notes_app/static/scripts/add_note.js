import {addCorrectMessage, addfailureMessage} from './form_functions.js';
import {isAnyFieldBlank} from './validation_functions.js';
import {GET, POST, URL, HTTP_STATUS, NOTE_CONTENT_FIELD_ID, ENCRYPT_FIELD_ID, PUBLIC_FIELD_ID, ENCRYPT_PASSWD_FIELD_ID, WHO_CAN_READ_FIELD_ID} from './const.js'

let users_who_can_read = []

const csrfToken = document.getElementById('csrf_token').value
const headers = new Headers({
    "X-CSRF-Token": csrfToken
});

let chbox = document.getElementById('public')

let note_content = document.getElementById(NOTE_CONTENT_FIELD_ID);

chbox.addEventListener('change', function (event){
    event.preventDefault()

    let input = document.getElementById(WHO_CAN_READ_FIELD_ID);
    let chbox = document.getElementById('public')
    let add_btn = document.getElementById('add_btn')
    let chbox_disable = document.getElementsByClassName('chbox_disable')

    if(chbox.checked){ 
        console.log("disabled")
        input.disabled=true;
        add_btn.disabled = true
        add_btn.style.backgroundColor = '#0000003e'
        for(let i=0; i < chbox_disable.length;i++){
            chbox_disable[i].style.color = '#0000003e'            
        }
    }else{
        console.log("enabled")
        input.disabled = false; 
        add_btn.disabled = false
        add_btn.style.backgroundColor = 'var(--main-color)'
        input.focus();
        for(let i=0; i < chbox_disable.length;i++){
            chbox_disable[i].style.color = '#000'            
        }
    }
}) 

let add_btn = document.getElementById('add_btn')
console.log(add_btn)

add_btn.addEventListener('click', function (){

    rwm("blankWarning")
    let input = document.getElementById('who_can_read');
    if(!isBlank(input)){
        let warning = validateEmail(input.value)
        if(warning != ""){
            let message = warning;
            let warningElemId = "blankWarning"
            let warningElem = pwe(warningElemId, message);
            aae("add-form-row", warningElem);
        } else {
            add_email_to_list()
        }
    }else{
        console.log('blank')
    }
    return false;

})

function add_email_to_list(){
    let email = document.getElementById('who_can_read').value

    console.log('email: ' + email)
    if (!users_who_can_read.includes(email)){
        users_who_can_read.push(email)
        show_email_on_list(email)
    }else{
        let message = "ten użytkownik został już dodany na listę.";
        let warningElemId = "blankWarning"
        let warningElem = pwe(warningElemId, message);
        aae("add-form-row", warningElem);
    }
    console.log('lista: ' + users_who_can_read)
}

function show_email_on_list(email){
    let wcr_list = document.getElementById('wcr_list')
    wcr_list.textContent = wcr_list.textContent + '    ' + email
}


function isBlank(field) {
    if (field.value == "") {
        let message = "aby dodać, wpisz jakąś wartość.";
        let warningElemId = "blankWarning"
        let warningElem = pwe(warningElemId, message);
        aae("add-form-row", warningElem);
        return true;
    }
    return false
}

function pwe(newElemId, message) {
    let warningField = document.getElementById(newElemId);

    if (warningField === null) {
        let textMessage = document.createTextNode(message);
        warningField = document.createElement('span');

        warningField.setAttribute("id", newElemId);
        warningField.className = "warning-field";
        warningField.style.textAlign = "center"
        warningField.appendChild(textMessage);
    }
    return warningField;
}

function aae(currentElemId, newElem) {
    let currentElem = document.getElementById(currentElemId);
    currentElem.insertAdjacentElement('afterend', newElem);
}

function rwm(warningElemId) {
    let warningElem = document.getElementById(warningElemId);

    if (warningElem !== null) {
        warningElem.remove();
    }
}


function validateEmail(emailInput){
    if(RegExp("^\s$").test(emailInput)){
        return "Email nie może zawierać spacji.";
    } else if ((RegExp("^[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$").test(emailInput))){
        return "Email nie może zawierać polskich znaków.";
    } else if (!(RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$").test(emailInput))){
        return "Niepoprawna forma adresu email.";
    } else if(emailInput.length < 4 ){
        return "Login musi mieć powyżej 4 znaków."
    }else{
        return "";
    }
}


document.addEventListener('DOMContentLoaded', function (event) {

    let newNoteForm = document.getElementById("add-note-form");

    newNoteForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let note_content = document.getElementById(NOTE_CONTENT_FIELD_ID);

        console.log(note_content.textContent)

        let fields = [note_content];

        let encryptField = document.getElementById(ENCRYPT_FIELD_ID)
        let encryptPasswdField = document.getElementById(ENCRYPT_PASSWD_FIELD_ID)


        if (encryptField.checked){
            fields = [note_content, encryptPasswdField]
        }
        if(!isAnyFieldBlank(fields)) {
            submitNoteForm(newNoteForm, "add_note");
        } else {
            let id = "button-submit-form";
            addfailureMessage(id,"Żadne pole nie może pozostać puste.")
        }
    });
});

function submitNoteForm(form, name) {
    let url = URL + name;
    console.log(url);
    let encryptField = document.getElementById(ENCRYPT_FIELD_ID)
    let publicField = document.getElementById(PUBLIC_FIELD_ID)

    form = new FormData(form)
    form.append(WHO_CAN_READ_FIELD_ID, users_who_can_read)
    form.append(ENCRYPT_FIELD_ID, encryptField.checked)
    form.append(PUBLIC_FIELD_ID, publicField.checked)

    let registerParams = {
        method: POST,
        body: form,
        redirect: "follow",
        headers
    };

    fetch(url, registerParams)
            .then(response => getResponseData(response))
            .then(response =>showMessages(response))
            .catch(err => {
                console.log("Caught error: " + err);
                let id = "button-submit-form";
                addfailureMessage(id,'Nie udało się wysłać zapytania');
            });
}

function getResponseData(response) {
    console.log(response)
    return response.json()
}

function showMessages(response) {
    let status = response.status;
    let id = "button-submit-form";

    if (status === HTTP_STATUS.OK) {
        console.log("Dodano pomyślnie.");
        addCorrectMessage(id,response.msg)
    } else if (status == HTTP_STATUS.BAD_REQUEST) {
        console.log("Niepoprawne żądanie.")
        addfailureMessage(id,response.msg)
    } else {
        console.error("Response status code: " + response.status);
        addfailureMessage(id,"Wysyłanie zapytania powiodło się. Nie jesteśmy w stanie zweryfikować poprawności wprowadzonych danych.")
        throw "Unexpected response status: " + response.status;
    }
}