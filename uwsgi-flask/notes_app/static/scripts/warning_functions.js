export function showWarningMessage(newElemId, message, field_id) {
    let warningElem = prepareWarningElem(newElemId, message);
    appendAfterElem(field_id, warningElem);
}

export function removeWarningMessage(warningElemId) {
    let warningElem = document.getElementById(warningElemId);

    if (warningElem !== null) {
        warningElem.remove();
    }
}

export function prepareWarningElem(newElemId, message) {
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

export function appendAfterElem(currentElemId, newElem) {
    let currentElem = document.getElementById(currentElemId);
    currentElem.insertAdjacentElement('afterend', newElem);
}