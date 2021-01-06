import {GET, POST, URL, HTTP_STATUS} from './const.js'
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';



export function submitForm(url, form, name, successMessage, failureMessage) {
    let registerUrl = url + name;
    console.log(registerUrl);

    let registerParams = {
        method: POST,
        mode: 'cors',
        body: new FormData(form),
        redirect: "follow"
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
        addCorrectMessage(id,successMessage);

    } else {
        console.log("Errors: " + correctResponse.registration_status);
        let id = "button-submit-form";
        addfailureMessage(id, failureMessage + correctResponse)
    }
}

function getResponseData(response) {
    let status = response.status;

    if (status === HTTP_STATUS.OK) {
        console.log("Status =" + status);
        return response.json()
    } else {
        console.error("Response status code: " + response.status);
        throw "Unexpected response status: " + response.status;
    }
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