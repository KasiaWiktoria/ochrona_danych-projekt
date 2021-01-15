import {addCorrectMessage, addfailureMessage, updatePasswdCorrectnessMessage, updateRepeatPasswdCorrectnessMessage, prepareOtherEventOnChange, checkPasswdStrength} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isAnyFieldBlank, validatePasswd, arePasswdsTheSame} from './validation_functions.js';
import {GET, POST, URL, HTTP_STATUS, PASSWD_FIELD_ID, REPEAT_PASSWD_FIELD_ID} from './const.js'


const csrfToken = document.getElementById('csrf_token').value
const headers = new Headers({
    "X-CSRF-Token": csrfToken
});

document.addEventListener('DOMContentLoaded', function (event) {

    prepareOtherEventOnChange(PASSWD_FIELD_ID, updatePasswdCorrectnessMessage);
    prepareOtherEventOnChange(REPEAT_PASSWD_FIELD_ID, updateRepeatPasswdCorrectnessMessage);

    let changePasswdForm = document.getElementById("password-change-form");

    changePasswdForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let passwd = document.getElementById(PASSWD_FIELD_ID);
        let repeated_passwd = document.getElementById(REPEAT_PASSWD_FIELD_ID);

        let fields = [passwd, repeated_passwd];
        if(!isAnyFieldBlank(fields)) {
            submitChangePasswdForm(changePasswdForm, "reset_password");
        } else {
            let id = "button-submit-form";
            addfailureMessage(id,"Pole nie może pozostać puste.")
        }
    });

    
    let passwdInput = document.getElementById(PASSWD_FIELD_ID);
    passwdInput.addEventListener('keyup', checkPasswdStrength);
});

function submitChangePasswdForm(form, name) {
    let url = URL + name;
    console.log(url);

    let registerParams = {
        method: POST,
        mode: 'cors',
        body: new FormData(form),
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
    console.log('response: ', response)
    console.log('status: ', response.status)
    return response.json()
}

function showMessages(response) {
    console.log('response: ', response)
    console.log('status: ', response.status)
    let status = response.status;
    let id = "button-submit-form";

    if (status === HTTP_STATUS.OK) {
        console.log("Zmieniono.");
        addCorrectMessage(id,response.message)
    } else {
        console.error("Response status code: " + response.status);
        addfailureMessage(id,response.message)
        throw "Unexpected response status: " + response.status;
    }
}