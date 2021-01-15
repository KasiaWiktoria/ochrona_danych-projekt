import {addCorrectMessage, addfailureMessage, submitForm, updateCorrectnessMessage, prepareOtherEventOnChange, prepareEventOnChange, updatePasswdCorrectnessMessage, updateRepeatPasswdCorrectnessMessage, checkPasswdStrength} from './form_functions.js';
import {showWarningMessage, removeWarningMessage, prepareWarningElem, appendAfterElem} from './warning_functions.js';
import {isAnyFieldBlank, isLoginAvailable, isEmailAvailable, validateLogin, validatePasswd, arePasswdsTheSame, validateEmail} from './validation_functions.js';
import {GET, POST, URL, HTTP_STATUS, EMAIL_FIELD_ID, LOGIN_FIELD_ID, PASSWD_FIELD_ID, REPEAT_PASSWD_FIELD_ID} from './const.js'

document.addEventListener('DOMContentLoaded', function (event) {

    prepareOtherEventOnChange(EMAIL_FIELD_ID, updateEmailAvailabilityMessage);
    prepareOtherEventOnChange(LOGIN_FIELD_ID, updateLoginAvailabilityMessage);
    prepareOtherEventOnChange(PASSWD_FIELD_ID, updatePasswdCorrectnessMessage);
    prepareOtherEventOnChange(REPEAT_PASSWD_FIELD_ID, updateRepeatPasswdCorrectnessMessage);

    var AVAILABLE_LOGIN = false;
    let registrationForm = document.getElementById("registration-form");

    registrationForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var canSend = (AVAILABLE_LOGIN && validateLogin() == "" && validatePasswd() == "" && arePasswdsTheSame());

        let email = document.getElementById(EMAIL_FIELD_ID)
        let login = document.getElementById(LOGIN_FIELD_ID)
        let password = document.getElementById(PASSWD_FIELD_ID);
        let repeat_password = document.getElementById(REPEAT_PASSWD_FIELD_ID)

        let fields = [email, login, password, repeat_password];
        if(!isAnyFieldBlank(fields)) {
            if(canSend) {
                submitForm(URL, registrationForm, "registration", " Zarejestrowano pomyślnie.", "Rejestracja nie powiodła się. ");
            } else if(canSend != false){
                console.log('Wrong type of variable.');
            } else {
                console.log('Not correct fields.');
                
                let failureMessage = "Rejestracja nie powiodła się. Sprawdź czy wszystkie pola są wypełnione poprawnie.";
                let id = "button-submit-form";
                addfailureMessage(id,failureMessage);
            }
        } else {
            let id = "button-submit-form";
            addfailureMessage(id,"Żadne pole nie może pozostać puste.")
        }
    });

    let passwdInput = document.getElementById(PASSWD_FIELD_ID);
    passwdInput.addEventListener('keyup', checkPasswdStrength);

    function updateLoginAvailabilityMessage() {
        let warningElemId = "loginWarning";
        removeWarningMessage("uncorrect");
        removeWarningMessage("correct");
    
        let warningMessage = validateLogin();
        removeWarningMessage(warningElemId);
        if (warningMessage == "") {
            console.log("Correct login!");
            warningMessage = "Podany login jest już zajęty.";
    
            isLoginAvailable().then(function (isAvailable) {
                if (isAvailable) {
                    console.log("Available login!");
                    AVAILABLE_LOGIN = true;
                } else {
                    console.log("NOT available login");
                    showWarningMessage(warningElemId, warningMessage, LOGIN_FIELD_ID);
                }
            }).catch(function (error) {
                showWarningMessage(warningElemId, "W tej chwili nie jesteśmy w stanie zweryfikować dostępności loginu.", LOGIN_FIELD_ID);
                console.error("Something went wrong while checking login.");
                console.error(error);
            });
        } else {
            console.log("Unorrect login.");
            showWarningMessage(warningElemId, warningMessage, LOGIN_FIELD_ID);
        }
    }

    function updateEmailAvailabilityMessage() {
        let warningElemId = "emailWarning";
        removeWarningMessage("uncorrect");
        removeWarningMessage("correct");
    
        let warningMessage = validateEmail();
        removeWarningMessage(warningElemId);
        if (warningMessage == "") {
            console.log("Correct email!");
            warningMessage = "Podany email jest już zajęty.";
    
            isEmailAvailable().then(function (isAvailable) {
                if (isAvailable) {
                    console.log("Available email!");
                    AVAILABLE_LOGIN = true;
                } else {
                    console.log("NOT available email");
                    showWarningMessage(warningElemId, warningMessage, EMAIL_FIELD_ID);
                }
            }).catch(function (error) {
                showWarningMessage(warningElemId, "W tej chwili nie jesteśmy w stanie zweryfikować dostępności emailu.", EMAIL_FIELD_ID);
                console.error("Something went wrong while checking email.");
                console.error(error);
            });
        } else {
            console.log("Unorrect email.");
            showWarningMessage(warningElemId, warningMessage, EMAIL_FIELD_ID);
        }
    }

});
