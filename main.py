from flask import Flask, render_template, url_for, request
from util import json_response

import data_manager

app = Flask(__name__)


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@app.route("/get-boards")
@json_response
def get_boards():
    """
    All the boards
    """
    return data_manager.get_boards_data()


@app.route("/get-cards/<int:board_id>")
@json_response
def get_cards_for_board(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return data_manager.get_cards_data(board_id)


@app.route("/save-new-board", methods=['POST'])
@json_response
def save_new_board():
    """
    Add new board to database
    """
    board_title = request.json

    new_id = data_manager.add_new_board(board_title)

    return {'status': 200,
            'board_id': new_id['id']}


@app.route("/save-new-card", methods=['POST'])
@json_response
def save_new_card():
    """
    Add new card to database
    """
    new_card_data = request.json

    attributes = data_manager.add_new_card(new_card_data)

    return {'status': 200,
            'card': attributes}


@app.route("/update-cards-position", methods=['POST'])
@json_response
def update_cards_position():
    """
    Update card order_number and/or status_id
    """
    cards_position = request.json
    for card_position in cards_position:
        data_manager.update_card_position(card_position)
    return {'status': 200}


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
