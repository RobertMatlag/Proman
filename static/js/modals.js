import {dataHandler} from "./data_handler.js";
import {dom} from "./dom.js";
import {util} from "./util.js";

function createModal(id, headerText) {
    const modal = util.createElementWithClasses('div', ['modal']);
    const modalContent = util.createElementWithClasses('div', ['modal-content']);
    const modalHeader = util.createElementWithClasses('div', ['modal-header']);
    const modalBody = util.createElementWithClasses('div', ['modal-body']);
    const modalFooter = util.createElementWithClasses('div', ['modal-footer']);

    const closeXButton = createCloseXButton(modal);
    const headerDescription = createHeader(headerText);

    appendChildren(modalHeader, [headerDescription, closeXButton]);
    appendChildren(modalContent, [modalHeader, modalBody, modalFooter]);

    modal.appendChild(modalContent);
    modal.setAttribute('id', id);

    return modal;
}

function createHeader(headerText) {
    const header = util.createElementWithClasses('h2', ['modal-h2']);
    const textToAdd = document.createTextNode(headerText);
    header.appendChild(textToAdd);

    return header;
}

function createCloseXButton(modal) {
    const closeXButton = util.createElementWithClasses('span', ['close']);
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

// Inject data to basic modal
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
    modalFooter.appendChild(saveButton);

    const newBoardForm = createNewBoardForm(modalBody, modalFooter, modalId);

    modalContent.appendChild(newBoardForm);
}

function createNewTextInput(id) {
    const newInput = document.createElement('input');
    newInput.setAttribute('type', 'text');
    newInput.setAttribute('maxlength', '15');
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
    const newButton = util.createElementWithClasses('button');
    newButton.setAttribute('type', 'submit');

    const textSaveButton = document.createTextNode('Save');
    newButton.appendChild(textSaveButton);

    return newButton;
}

function createNewBoardForm(modalBody, modalFooter, modalId) {
    const newForm = document.createElement('form');
    newForm.appendChild(modalBody);
    newForm.appendChild(modalFooter);
    newForm.addEventListener('submit', function (event) {
        event.preventDefault();
        choseEvent(modalId);
    });

    return newForm;
}

function choseEvent(modalId) {
    switch (modalId) {
        case 'new-board-modal':
            handleNewBoardEvents();
            break;
        case 'new-card-modal':
            handleNewCardEvents();
            break;
        case 'edit-board-modal':
            handleEditBoardEvents();
            break;
        case 'edit-card-modal':
            handleEditCardEvents();
            break;
        case 'new-column-modal':
            handleNewColumnEvents();
            break;
    }
}

function handleNewBoardEvents() {
    hideModal('#new-board-modal');

    const inputValue = document.getElementById('board-title').value;
    const boardPrivateValue = document.getElementById("board-private").checked;
    const boardDetails = {
        title: inputValue,
        board_private: boardPrivateValue,
    }
    dataHandler.createNewBoard(boardDetails, function (response) {
        dom.displayNewBoard(boardDetails, response.board_id);
    });
}

function handleNewCardEvents() {
    hideModal('#new-card-modal');

    const newCardTitle = document.getElementById('card-title').value;
    const newCardBoardId = Number(localStorage.getItem('activeBoard'));
    const column = document.querySelector(`div[cardid="${newCardBoardId}"]`);
    const statusId = parseInt(column.parentElement.getAttribute("status-id"));
    const data = {
        title: newCardTitle,
        boardId: newCardBoardId,
        statusId: statusId
    };

    dataHandler.createNewCard(data, function (response) {
        dom.displayNewCard(column, newCardTitle, response.card.id, response.card.order_number);
    });
}

function handleEditBoardEvents() {
    hideModal('#edit-board-modal');

    const newBoardTitle = document.getElementById('edited-board-title').value;
    const boardId = Number(localStorage.getItem('activeBoard'));

    const data = {
        title: newBoardTitle,
        boardId: boardId
    };

    dataHandler.updateBoard(data, function () {
        const boardTitle = document.querySelector(`li[boardid="${boardId}"] .col-title h3`);
        boardTitle.innerText = newBoardTitle;
    });
}

function handleEditCardEvents() {
    hideModal('#edit-card-modal');

    const newCardTitle = document.getElementById('edited-card-title').value;
    const cardId = Number(localStorage.getItem('activeCard'));

    const data = {
        title: newCardTitle,
        cardId: cardId
    };

    dataHandler.updateCard(data, function () {
        const cardTitle = document.querySelector(`.task[task-id="${cardId}"] > .task-title`);
        cardTitle.innerText = newCardTitle;
    });

}

function handleNewColumnEvents() {
    hideModal('#new-column-modal');

    const newColumnTitle = document.getElementById('column-title').value;
    const newColumnBoardId = Number(localStorage.getItem('activeBoard'));
    const columnContainerChildren = document.querySelector(`div[containerboardid="${newColumnBoardId}"]`).children;
    const newColumnOrderNumber = parseInt(columnContainerChildren[columnContainerChildren.length - 1].getAttribute("status-order-number")) + 1;

    const data = {
        title: newColumnTitle,
        board_id: newColumnBoardId,
        order_number: newColumnOrderNumber
    }

    dataHandler.createColumn(data, response => {
            data.status_id = response.id;
            dom.displayNewColumn(data);
    });

}

function hideModal(modalId) {
    const modal = document.querySelector(modalId);
    modal.style.display = "none";
}

if (document.title === 'ProMan') {
    const body = document.querySelector('body');

    const modals = {
        newBoard: {id: 'new-board-modal', headerText: 'Create new board', inputId: 'board-title'},
        newCard: {id: 'new-card-modal', headerText: 'Create new task', inputId: 'card-title'},
        editBoard: {id: 'edit-board-modal', headerText: 'Edit board title', inputId: 'edited-board-title'},
        editCard: {id: 'edit-card-modal', headerText: 'Edit card title', inputId: 'edited-card-title'},
        newColumn: {id: 'new-column-modal', headerText: 'Create new column', inputId: 'column-title'},
    }

    Object.keys(modals).forEach(function (key) {
        const newModal = createModal(modals[key]['id'], modals[key]['headerText']);
        body.appendChild(newModal);
        injectDataToModalTemplate(modals[key]['id'], modals[key]['inputId'])
    });

    const newBoardButton = document.getElementById('new-board-button');
    newBoardButton.onclick = function () {
        document.getElementById('new-board-modal').style.display = "block";
    }
}
