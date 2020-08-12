import {dataHandler} from "./data_handler.js";
import {dom} from "./dom.js";

export function modalsInit() {
    const allButtonsAddNewCard = document.querySelectorAll('.board-container > .flex-row-start > .title > a');
    for (let newCardButton of allButtonsAddNewCard) {
        newCardButton.onclick = function () {
            newCardModal.style.display = "block";

            const parentLiElement = newCardButton.closest("li");
            localStorage.setItem('activeBoard', parentLiElement.getAttribute('boardid'));
        }
    }
}

// Function create basic template for modal
function createModal(id, headerText) {
    //TODO Try to put variables in for loop or to file
    const modal = createElementWithClasses('div', ['modal']);
    const modalContent = createElementWithClasses('div', ['modal-content']);
    const modalHeader = createElementWithClasses('div', ['modal-header']);
    const modalBody = createElementWithClasses('div', ['modal-body']);
    const modalFooter = createElementWithClasses('div', ['modal-footer']);

    const closeXButton = createCloseXButton(modal);
    const headerDescription = createHeader(headerText);

    appendChildren(modalHeader, [headerDescription, closeXButton]);
    appendChildren(modalContent, [modalHeader, modalBody, modalFooter]);

    modal.appendChild(modalContent);
    modal.setAttribute('id', id);

    return modal;
}

function createHeader(headerText) {
    const header = createElementWithClasses('h2', ['modal-h2']);
    const textToAdd = document.createTextNode(headerText);
    header.appendChild(textToAdd);

    return header;
}

function createCloseXButton(modal) {
    const closeXButton = createElementWithClasses('span', ['close']);
    const textXButton = document.createTextNode('x');
    closeXButton.appendChild(textXButton);

    closeXButton.onclick = function () {
        modal.style.display = "none";
    }

    return closeXButton;
}

function appendChildren(parent, listOfChildren) {
    for (const child of listOfChildren) {
        parent.appendChild(child);
    }
}

export function createElementWithClasses(typeOfElement, listOfClasses) {
    const element = document.createElement(typeOfElement);
    for (let classOnList of listOfClasses) {
        element.classList.add(classOnList);
    }

    return element;
}

// Inject data to basic modal to create modal for adding new boards
function injectDataToModalTemplate(modalId, inputId) {
    const modalContent = document.querySelector(`#${modalId} > .modal-content`);
    const modalBody = document.querySelector(`#${modalId} > .modal-content > .modal-body`);
    const modalFooter = document.querySelector(`#${modalId} > .modal-content > .modal-footer`);

    const boardTitleInput = createNewTextInput(inputId);
    modalBody.appendChild(boardTitleInput);
    if (modalId === 'new-board-modal') {
        const checkboxContainer = createCheckboxContainer();
        modalBody.appendChild(checkboxContainer);
    }

    const saveButton = createSaveButton();
    saveButton.setAttribute('form', 'boardValues');
    modalFooter.appendChild(saveButton);

    const newBoardForm = createNewBoardForm(modalBody, modalFooter, modalId);

    modalContent.appendChild(newBoardForm);
}

function createNewTextInput(id) {
    const newInput = document.createElement('input');
    newInput.setAttribute('type', 'text');
    newInput.setAttribute('name', 'title');
    newInput.setAttribute('id', id);
    newInput.setAttribute('placeholder', 'Insert name');

    return newInput;
}

function createCheckboxContainer() {
    const container = document.createElement('div');
    const boardPrivateCheckbox = createNewCheckbox('private', 'board-private');
    const checkboxLabel = createLabelForCheckbox('private', 'board-private');
    container.classList.add('checkbox-container');
    container.appendChild(boardPrivateCheckbox);
    container.appendChild(checkboxLabel);

    return container;
}

function createNewCheckbox(boardPrivate, id) {
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('id', id);
    checkbox.setAttribute('name', id);
    checkbox.setAttribute('value', boardPrivate);
    return checkbox;
}

function createLabelForCheckbox(boardPrivate, id) {
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.innerText = `Create ${boardPrivate} board`;

    return label;
}

function createSaveButton() {
    const newButton = createElementWithClasses('button', []);
    newButton.setAttribute('type', 'submit');

    const textSaveButton = document.createTextNode('Save');
    newButton.appendChild(textSaveButton);

    return newButton;
}

function createNewBoardForm(modalBody, modalFooter, modalId) {
    const newForm = document.createElement('form');
    newForm.setAttribute('action', '/boards');
    newForm.setAttribute('id', 'boardValues');
    newForm.setAttribute('method', 'POST');
    newForm.appendChild(modalBody);
    newForm.appendChild(modalFooter);
    newForm.addEventListener('submit', function (evant) {
        evant.preventDefault();
        modalId === 'new-board-modal' ? handleNewBoardEvants() : handleNewCardEvants();

    });

    return newForm;
}

function handleNewBoardEvants() {
    hideModal('#new-board-modal');

    const inputValue = document.getElementById('board-title').value;
    const boardPrivateValue = document.getElementById("board-private").checked;
    const boardDetails = {
        title: inputValue,
        board_private: boardPrivateValue,
    }
    dataHandler.createNewBoard(boardDetails, function (response) {
        console.log(response)
        dom.displayNewBoard(boardDetails, response.board_id);
        addFunctionToNewCardButtton(response.board_id);
    });
}

function addFunctionToNewCardButtton(boardId) {
    const newCardButton = document.querySelector(`li[boardid="${boardId}"] > div >a`);
    newCardButton.onclick = function () {
        newCardModal.style.display = "block";
        localStorage.setItem('activeBoard', boardId);
    }
}

function handleNewCardEvants() {
    hideModal('#new-card-modal');

    const newCardTitle = document.getElementById('card-title').value;
    const newCardBoardId = Number(localStorage.getItem('activeBoard'));

    const data = {
        title: newCardTitle,
        boardId: newCardBoardId,
        statusId: 0
    };

    dataHandler.createNewCard(data, function (response) {
        const column = document.querySelector(`div[cardid="${newCardBoardId}"]`);
        dom.displayNewCard(column, newCardTitle, response.card.id, response.card.order_number);
    });
}

function hideModal(modalId) {
    const modal = document.querySelector(modalId);
    modal.style.display = "none";
}

// -------------------------------------------------------------------------------------

const body = document.querySelector('body');

// Add new basic modal to page for new board creation and fill with content
const newBoardModal = createModal('new-board-modal', 'Create new board');
body.appendChild(newBoardModal);
injectDataToModalTemplate('new-board-modal', 'board-title');

// Add new basic modal to page for new card creation and fill with content
const newCardModal = createModal('new-card-modal', 'Create new task');
body.appendChild(newCardModal);
injectDataToModalTemplate('new-card-modal', 'card-title');

// Call modal on click New Board button
const newBoardButton = document.getElementById('new-board-button');
newBoardButton.onclick = function () {
    newBoardModal.style.display = "block";
}
