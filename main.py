from flask import Flask, render_template, url_for, request, redirect, session, flash
from util import json_response
from forms import LoginForm, RegistrationForm
import data_manager
import registration


app = Flask(__name__)
app.config['SECRET_KEY'] = '3cCF66xASeTv8feXuYZNtQ'


@app.route("/", methods=['GET', 'POST'])
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@app.route("/boards", methods=['GET', 'POST', 'PUT', 'DELETE'])
@json_response
def boards():
    """
    All the boards
    """
    method = request.method

    if method == 'GET':
        user_id = session.get('user_id')
        if user_id:
            return data_manager.get_boards_data(user_id)
        return data_manager.get_boards_data(user_id)

    if method == 'POST':
        board_details = request.json
        user_id = session['user_id']
        new_board = data_manager.add_new_board(board_details['title'], board_details['board_private'], user_id)
        return {'status': 200,
                'board_id': new_board['id'],
                'board_private': new_board['board_private'],
                'user_id': user_id}

    if method == 'PUT':
        board_data = request.json
        data_manager.update_title('boards', board_data['boardId'], board_data['title'])
        return {'status': 200}

    board_id = request.json
    data_manager.delete_record('boards', board_id)
    return {'status': 200}


@app.route("/cards", methods=['GET', 'POST', 'PUT', 'DELETE'])
@json_response
def cards():
    """
    All cards that belongs to a board
    param board_id: id of the parent board
    """
    method = request.method

    if method == 'GET':
        board_id = request.args.get('boardId')
        return data_manager.get_cards_data(board_id)

    if method == 'POST':
        new_card_data = request.json
        attributes = data_manager.add_new_card(new_card_data)
        return {'status': 200,
                'id': attributes["id"]}

    if method == 'PUT':
        card_data = request.json
        data_manager.update_title('cards', card_data['cardId'], card_data['title'])
        return {'status': 200}

    card_id = request.json
    data_manager.delete_record('cards', card_id)
    return {'status': 200}


@app.route("/login", methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = data_manager.is_user_exist(form.username.data)

        if user is not None and form.username.data == user['username'] and registration.\
                verify_password(form.password.data, user['password']):
            session['username'] = form.username.data
            session['user_id'] = user['id']
            flash(f'{form.username.data} logged in')
            return redirect(url_for('index'))

        flash('Login Unsuccessful. Please check username and password')

    return render_template('login.html', title='Login', form=form)


@app.route("/register", methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        user_data = {
            'username': form.username.data,
            'email': form.email.data,
            'password': registration.hash_password(form.password.data),
        }

        data_manager.add_new_user(user_data)
        flash(f'Account for {form.username.data} created! You are now able to log in')
        return redirect(url_for('login'))

    return render_template('register.html', title='Register', form=form)


@app.route("/logout")
def logout():
    session.pop('username', None)
    session.clear()
    flash('You are successfully log out')
    return redirect(url_for('index'))


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


@app.route("/statuses", methods=['GET', 'POST'])
@json_response
def statuses():
    """
    Create new column
    """
    method = request.method

    if method == 'POST':
        column_data = request.json
        column_id = data_manager.add_new_column(column_data)
        return {'status': 200,
                'id': column_id['id']}

    board_id = request.args.get('boardId')
    columns_data = data_manager.get_columns_by_board_id(board_id)
    return {'status': 200,
            'columns': columns_data}


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
