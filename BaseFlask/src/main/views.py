from flask import Blueprint, render_template, request, flash, redirect, url_for
from flask_login import login_required, current_user, login_user
from passlib.hash import pbkdf2_sha256

from ..models import User
from ..forms import RegistrationForm

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template("index.html")

@main.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        form = RegistrationForm(request.form)
        if not form.validate():
            flash("Form validation fails")
            return render_template('register.html', form=form)
        passwordHash = pbkdf2_sha256.hash(form.password.data)
        user = User(form.email.data, passwordHash)
        user.save()
        login_user(user)
        flash('Im a flash: Thanks for registering')
        return redirect(url_for('main.index'))

    return render_template('register.html')
