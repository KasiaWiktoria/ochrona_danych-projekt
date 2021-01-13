import {GET, POST, URL, HTTP_STATUS, EMAIL_FIELD_ID, LOGIN_FIELD_ID, PASSWD_FIELD_ID, REPEAT_PASSWD_FIELD_ID} from './const.js'
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';

const csrfToken = document.getElementById('csrf_token').value
const headers = new Headers({
    "X-CSRF-Token": csrfToken
});

export function submitForm(url, form, name, successMessage, failureMessage) {
    let registerUrl = url + name;
    console.log(form);
    console.log(new FormData(form));
    console.log(registerUrl);

    let registerParams = {
        method: POST,
        mode: 'cors',
        body: new FormData(form),
        redirect: "follow",
        headers
    };

    fetch(registerUrl, registerParams)
            .then(response => getResponseData(response))
            .then(response => displayInConsoleCorrectResponse(response, successMessage, failureMessage))
            .catch(err => {
                console.log("Caught error: " + err);
                removeWarningMessage("correct");
                let id = "button-submit-form";

                let uncorrectElem = prepareWarningElem("uncorrect", failureMessage);
                uncorrectElem.className = "uncorrect-field"
                appendAfterElem(id, uncorrectElem);
            });
}


function displayInConsoleCorrectResponse(correctResponse, successMessage, failureMessage) {

    console.log("Status: " + correctResponse.registration_status);

    if (correctResponse.registration_status == "OK") {
        let id = "button-submit-form";
        addCorrectMessage(id,correctResponse.message);
        clearFields()
    } else {
        console.log("Errors: " + correctResponse.registration_status);
        let id = "button-submit-form";
        addfailureMessage(id, correctResponse.message)
    }
}

function clearFields(){
    let email = document.getElementById(EMAIL_FIELD_ID)
    let login = document.getElementById(LOGIN_FIELD_ID)
    let password = document.getElementById(PASSWD_FIELD_ID);
    let repeat_password = document.getElementById(REPEAT_PASSWD_FIELD_ID)

    console.log('usunięcie zawartości pól.')
    email.value = ""
    login.value = ""
    password.value = ""
    repeat_password.value = ""
}

function getResponseData(response) {
    return response.json()
}
    
export function prepareOtherEventOnChange(FIELD_ID, updateMessageFunction) {
    let loginInput = document.getElementById(FIELD_ID);
    loginInput.addEventListener("change", updateMessageFunction);
}

export function prepareEventOnChange(FIELD_ID, validationFunction) {
    let loginInput = document.getElementById(FIELD_ID);
    loginInput.addEventListener("change", updateCorrectnessMessage.bind(event, FIELD_ID, validationFunction));
}

export function updateCorrectnessMessage(FIELD_ID, validationFunction) {
    let warningElemId = FIELD_ID + "Warning";
    removeWarningMessage("uncorrect");
    removeWarningMessage("correct");

    if(document.getElementById(FIELD_ID).value == ""){
        removeWarningMessage(warningElemId);
    } else if (validationFunction(FIELD_ID) == "") {
        console.log(FIELD_ID + " is filled.");
        removeWarningMessage(warningElemId);
    } else {
        console.log("Uncorrect filled" + FIELD_ID + ".");
        showWarningMessage(warningElemId, validationFunction(FIELD_ID), FIELD_ID);
    }
}

export function addCorrectMessage(id,successMessage) {
    removeWarningMessage("uncorrect");
    removeWarningMessage("correct");
    let correctElem = prepareWarningElem("correct", successMessage);
    correctElem.className = "correct-field"
    appendAfterElem(id, correctElem);
}

export function addfailureMessage(id,failureMessage) {
    removeWarningMessage("correct");
    removeWarningMessage("uncorrect");
    let uncorrectElem = prepareWarningElem("uncorrect", failureMessage);
    uncorrectElem.className = "uncorrect-field"
    appendAfterElem(id, uncorrectElem);
}