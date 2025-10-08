from flask import Flask, render_template, request, redirect, url_for, session
import sqlite3

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Needed for session management

DB_NAME = 'scientific_instrument.db'


# ---------------- Initialize Database ----------------
def init_db():
    """Create the register table if it doesn't exist"""
    try:
        conn = sqlite3.connect(DB_NAME, timeout=10, check_same_thread=False)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS register (
                Username TEXT NOT NULL PRIMARY KEY,
                Fullname TEXT NOT NULL,
                Email TEXT NOT NULL UNIQUE,
                Phone TEXT NOT NULL,
                Organization TEXT NOT NULL,
                Password TEXT NOT NULL
            )
        ''')
    
    
        conn = sqlite3.connect('DB_NAME', timeout=10, check_same_thread=False)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE contact_messages (
                Usename TEXT NOT NULL,
                Email TEXT NOT NULL,
                message TEXT NOT NULL
            )
        """)

        conn.commit()
        conn.close()
        print("✅ Database initialized successfully.")
    except sqlite3.OperationalError as e:
        print(f"⚠ Database initialization error: {e}")


# Initialize the database when app starts
init_db()


# ---------------- Home Page ----------------
@app.route('/')
def home():
    # Pass the session username (if it exists) to the template for conditional display
    return render_template("index.html", username=session.get('username'))


# ---------------- Register Page ----------------
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        Username = request.form.get('Username')
        Fullname = request.form.get('Fullname')
        Email = request.form.get('Email')
        Phone = request.form.get('Phone')
        Organization = request.form.get('Organization')
        Password = request.form.get('Password')

        if not Username or not Password:
            return "<h3>❌ Username and Password are required. <a href='/register'>Go Back</a></h3>"

        try:
            conn = sqlite3.connect(DB_NAME, timeout=10, check_same_thread=False)
            conn.execute("PRAGMA journal_mode=WAL;")
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO register (Username, Fullname, Email, Phone, Organization, Password)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (Username, Fullname, Email, Phone, Organization, Password))
            conn.commit()
            conn.close()
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            return "<h3>❌ Username or Email already exists. <a href='/register'>Try Again</a></h3>"

    return render_template("register.html")


# ---------------- Login Page ----------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        Username = request.form['Username']
        Password = request.form['Password']

        conn = sqlite3.connect(DB_NAME)   # use the variable, not string "DB_NAME"
        cursor = conn.cursor()
        cursor.execute("SELECT Email FROM register WHERE Username=? AND Password=?", (Username, Password))
        row = cursor.fetchone()
        conn.close()

        if row:
            session['username'] = Username       # consistent session key
            session['user_email'] = row[0]      # store email
            return redirect(url_for("home"))
        else:
            return "❌ Invalid username or password"

    return render_template("login.html")

# ---------------- Profile Page ----------------
@app.route('/profile')
def profile():
    # Check if user is logged in
    if "username" not in session:
        return redirect(url_for("login"))

    user_email = session.get('user_email')
    if not user_email:
        # If email missing in session, log out
        session.pop('username', None)
        return redirect(url_for("login"))

    conn = sqlite3.connect(DB_NAME, check_same_thread=False)
    cursor = conn.cursor()

    # Fetch user details from register table
    cursor.execute("""
        SELECT Fullname, Email, Phone, Organization
        FROM register
        WHERE Email=?
    """, (user_email,))
    user_data = cursor.fetchone()
    
    if not user_data:
        # If user not found, clear session and redirect
        session.pop('username', None)
        session.pop('user_email', None)
        conn.close()
        return redirect(url_for("login"))
    
    fullname, email, phone, organization = user_data

    # Fetch orders/bookings for this user (lab instruments orders)
    cursor.execute("""
        SELECT order_id, Instrument_Name, Order_Date, Quantity, Status
        FROM orders
        WHERE Email=?
    """, (user_email,))
    orders = cursor.fetchall()
    
    conn.close()

    # Render the profile page
    return render_template("profile.html",
                           orders=orders,
                           Fullname=fullname,
                           email=email,
                           phone=phone,
                           organization=organization)



# ---------------- Logout ----------------
@app.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('email', None)
    return redirect(url_for('home'))


# ---------------- Order Page  ----------------

@app.route('/orders')
def orders():
    orders = [
        {'id': 101, 'product_name': 'Beaker Set', 'quantity': 2, 'price': 499, 'date': '2025-10-08', 'status': 'Pending'},
        {'id': 102, 'product_name': 'Microscope', 'quantity': 1, 'price': 2500, 'date': '2025-10-05', 'status': 'Shipped'},
        {'id': 103, 'product_name': 'Test Tubes', 'quantity': 12, 'price': 299, 'date': '2025-10-02', 'status': 'Delivered'},
    ]
    return render_template('order.html', orders=orders, username=session.get('username'))

# ---------------- Contact Pages ----------------
@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        Username = request.form.get('Username')
        Email = request.form.get('Email')
        Your_message = request.form.get('Your_message')

        conn = sqlite3.connect('DB_NAME')
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO contact_messages (Username, Email,Your_message)
            VALUES (?, ?, ?)
        """, (Username, Email,Your_message))
        conn.commit()
        conn.close()

        return redirect(url_for('contact'))  # You can show a success message here

    return render_template('contact.html')



# ---------------- Other Pages ----------------
@app.route('/main')
def main_page():
    return redirect(url_for('register'))

@app.route('/chemicals')
def chemicals():
    return render_template("chemicals.html", username=session.get('username'))

@app.route('/contacts')
def contacts():
    return render_template("contact.html", username=session.get('username'))

@app.route('/products')
def products():
    return render_template("products.html", username=session.get('username'))

@app.route('/services')
def services():
    return render_template("services.html", username=session.get('username'))

@app.route('/cart')
def cart():
    return render_template("cart.html", username=session.get('username'))



# ---------------- Run App ----------------
if __name__ == "__main__":
    app.run(debug=True)
