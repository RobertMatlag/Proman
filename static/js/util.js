export let util = {

    addButton: function (iconClasses, descriptionText) {
        const button = addButtonElement();
        const icon = this.createElementWithClasses('i', iconClasses);
        button.appendChild(icon);
        button.appendChild(addDescription(descriptionText));

        return button;
    },

    createElementWithClasses: function (typeOfElement, listOfClasses) {
        const element = document.createElement(typeOfElement);
        for (let classOnList of listOfClasses) {
            element.classList.add(classOnList);
        }

        return element;
    },
}

function addButtonElement() {
    const button = document.createElement('a');
    button.type = 'button';

    return button;
}

function addDescription(text) {
    const buttonDescription = document.createElement('span');
    buttonDescription.innerText = text;

    return buttonDescription;
}
