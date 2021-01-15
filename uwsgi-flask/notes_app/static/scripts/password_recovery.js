import {addCorrectMessage, addfailureMessage, submitForm, updateCorrectnessMessage, prepareOtherEventOnChange} from './form_functions.js';
import {isAnyFieldBlank, validateEmail} from './validation_functions.js';
import {GET, POST, URL, HTTP_STATUS, EMAIL_FIELD_ID, PASSWD_FIELD_ID} from './const.js'


const csrfToken = document.getElementById('csrf_token').value
const headers = new Headers({
    "X-CSRF-Token": csrfToken
});

document.addEventListener('DOMContentLoaded', function (event) {

    prepareEventOnChange(EMAIL_FIELD_ID, validateEmail);

    let recoveryForm = document.getElementById("password-recovery-form");

    recoveryForm.addEventListener("submit", function (event) {
        event.preventDefault();

        let email = document.getElementById(EMAIL_FIELD_ID);

        let fields = [email];
        if(!isAnyFieldBlank(fields)) {
            submitRecoveryForm(recoveryForm, "recover_password");
        } else {
            let id = "button-submit-form";
            addfailureMessage(id,"Pole nie może pozostać puste.")
        }
    });
});

function submitRecoveryForm(form, name) {
    let loginUrl = URL + name;
    console.log(loginUrl);

    let registerParams = {
        method: POST,
        mode: 'cors',
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
        console.log("Wysłano.");
        addCorrectMessage(id,response.message)
    } else {
        console.error("Response status code: " + response.status);
        addfailureMessage(id,response.message)
        throw "Unexpected response status: " + response.status;
    }
}

function prepareEventOnChange(FIELD_ID, validationFunction) {
    let input = document.getElementById(FIELD_ID);
    input.addEventListener("change", updateCorrectnessMessage.bind(event, FIELD_ID, validationFunction));
}