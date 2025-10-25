from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
import pg8000
from pg8000 import dbapi
import os
from dotenv import load_dotenv
import traceback

# ---------------- Load Environment Variables ----------------
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "default_secret_key")
DB_URL = os.getenv("DATABASE_URL")

# ---------------- PostgreSQL Connection (pg8000) ----------------
def get_db_connection():
    """
    Parse DB_URL and return a pg8000 connection.
    Expected DB_URL format: postgresql://user:pass@host:port/dbname
    """
    import urllib.parse as up
    # allow both 'postgres' and 'postgresql' schemes
    up.uses_netloc.append("postgres")
    up.uses_netloc.append("postgresql")
    url = up.urlparse(DB_URL)

    user = url.username
    password = url.password
    host = url.hostname
    port = url.port or 5432
    database = url.path.lstrip("/")

    # pg8000.connect accepts these keywords
    conn = pg8000.connect(user=user, password=password, host=host, port=port, database=database)
    return conn


# ---------------- Initialize Database ----------------
def init_db():
    """Create all required tables if not already existing"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS register (
                Username TEXT PRIMARY KEY,
                Fullname TEXT NOT NULL,
                Email TEXT UNIQUE NOT NULL,
                Phone TEXT NOT NULL,
                Organization TEXT NOT NULL,
                Password TEXT NOT NULL
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contact_messages (
                id SERIAL PRIMARY KEY,
                Username TEXT NOT NULL,
                Email TEXT NOT NULL,
                message TEXT NOT NULL
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                order_id SERIAL PRIMARY KEY,
                Email TEXT NOT NULL,
                Instrument_Name TEXT NOT NULL,
                Quantity INTEGER NOT NULL,
                Price REAL NOT NULL,
                Order_Date DATE NOT NULL DEFAULT CURRENT_DATE,
                Status TEXT NOT NULL
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cancelled_orders (
                order_id INTEGER PRIMARY KEY,
                Email TEXT NOT NULL,
                Instrument_Name TEXT NOT NULL,
                Quantity INTEGER NOT NULL,
                Price REAL NOT NULL,
                Order_Date DATE NOT NULL,
                Status TEXT,
                Cancellation_Reason TEXT,
                Cancellation_Date DATE NOT NULL DEFAULT CURRENT_DATE
            )
        ''')

        conn.commit()
        cursor.close()
        conn.close()
        print("✅ PostgreSQL (pg8000) database initialized successfully.")
    except Exception as e:
        print("⚠ Database initialization error:", e)
        traceback.print_exc()


# Initialize database when app starts
init_db()


# ---------------- Home Page ----------------
@app.route('/')
def home():
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

        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO register (Username, Fullname, Email, Phone, Organization, Password)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (Username, Fullname, Email, Phone, Organization, Password))
            conn.commit()
            cursor.close()
            conn.close()
            return redirect(url_for('login'))
        except dbapi.IntegrityError:
            # duplicate username/email or constraint violation
            if conn:
                try:
                    conn.rollback()
                except:
                    pass
            return "<h3>❌ Username or Email already exists. <a href='/register'>Try Again</a></h3>"
        except Exception as e:
            if conn:
                try:
                    conn.rollback()
                    conn.close()
                except:
                    pass
            return f"<h3>❌ Error: {e}</h3>"

    return render_template("register.html")


# ---------------- Login Page ----------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        Username = request.form['Username']
        Password = request.form['Password']

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT Email FROM register WHERE Username=%s AND Password=%s", (Username, Password))
        row = cursor.fetchone()
        cursor.close()
        conn.close()

        if row:
            session['username'] = Username
            # row[0] is Email (as fetched)
            session['user_email'] = row[0]
            return redirect(url_for("home"))
        else:
            return "❌ Invalid username or password"

    return render_template("login.html")


# ---------------- Profile Page ----------------
@app.route('/profile')
def profile():
    if "username" not in session:
        return redirect(url_for("login"))

    user_email = session.get('user_email')
    if not user_email:
        session.clear()
        return redirect(url_for("login"))

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT Fullname, Email, Phone, Organization
        FROM register
        WHERE Email=%s
    """, (user_email,))
    user_data = cursor.fetchone()

    if not user_data:
        session.clear()
        cursor.close()
        conn.close()
        return redirect(url_for("login"))

    fullname, email, phone, organization = user_data

    cursor.execute("""
        SELECT order_id, Instrument_Name, Order_Date, Quantity, Status
        FROM orders
        WHERE Email=%s
    """, (user_email,))
    orders = cursor.fetchall()
    cursor.close()
    conn.close()

    return render_template("profile.html",
                           orders=orders,
                           Fullname=fullname,
                           email=email,
                           phone=phone,
                           organization=organization)


# ---------------- Logout ----------------
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))


# ---------------- Order Placement ----------------
@app.route('/place_order', methods=['POST'])
def place_order():
    if "username" not in session:
        return jsonify({"success": False, "message": "Not logged in"})

    user_email = session.get("user_email")
    data = request.get_json()
    cart_items = data.get("cart", [])

    if not cart_items:
        return jsonify({"success": False, "message": "Cart is empty"})

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        for item in cart_items:
            cursor.execute("""
                INSERT INTO orders (Email, Instrument_Name, Quantity, Price, Order_Date, Status)
                VALUES (%s, %s, %s, %s, CURRENT_DATE, %s)
            """, (
                user_email,
                item.get("name"),
                item.get("quantity"),
                item.get("price"),
                "Pending"
            ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": "Order placed successfully."})
    except Exception as e:
        if conn:
            try:
                conn.rollback()
                conn.close()
            except:
                pass
        print("Error placing order:", e)
        return jsonify({"success": False, "error": str(e)})


@app.route('/orders')
def orders():
    # Check login
    username = session.get('username')
    if not username:
        return redirect(url_for('login'))

    conn = get_db_connection()
    cursor = conn.cursor()

    # Get user's email
    cursor.execute("SELECT Email FROM register WHERE Username=%s", (username,))
    row = cursor.fetchone()
    if not row:
        cursor.close()
        conn.close()
        return redirect(url_for('login'))

    user_email = row[0]

    # 🧩 Fetch all user orders
    # NOTE: If you later have a products table, you can join it here to get image paths.
    cursor.execute("""
        SELECT order_id, Instrument_Name, Quantity, Order_Date, Status
        FROM orders
        WHERE Email=%s
        ORDER BY Order_Date DESC
    """, (user_email,))
    raw_orders = cursor.fetchall()
    cursor.close()
    conn.close()

    # 🧩 Convert rows into dictionaries for easy Jinja access
    orders = []
    for o in raw_orders:
        orders.append({
            "id": o[0],
            "product_name": o[1],
            "quantity": o[2],
            "date": o[3],
            "status": o[4],
            # Placeholder image if you don’t yet store product images
            "image": "default_product.jpg"
        })

    # 🧩 Render updated order.html
    return render_template("orders.html", orders=orders, username=username)


# ---------------- Contact Page ----------------
@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        username = request.form.get('Username')
        email = request.form.get('Email')
        message_text = request.form.get('message')

        if not all([username, email, message_text]):
            flash("All fields are required.", "error")
            return redirect(url_for('contact'))

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO contact_messages (Username, Email, message)
            VALUES (%s, %s, %s)
        """, (username, email, message_text))
        conn.commit()
        cursor.close()
        conn.close()

        flash("Your message has been sent successfully!", "success")
        return redirect(url_for('contact'))

    return render_template('contact.html', username=session.get('username'))


# ---------------- Cancel Order ----------------
@app.route('/cancel_order/<int:order_id>', methods=['POST'])
def cancel_order(order_id):
    if "username" not in session:
        return jsonify({"success": False, "message": "You must be logged in."}), 401

    conn = None
    try:
        data = request.get_json()
        reason = data.get('reason', 'No reason provided.')
        if not reason:
            return jsonify({"success": False, "message": "Cancellation reason required"}), 400

        user_email = session.get('user_email')
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT order_id, Email, Instrument_Name, Quantity, Price, Order_Date, Status
            FROM orders
            WHERE order_id=%s AND Email=%s AND Order_Date >= CURRENT_DATE - INTERVAL '10 days'
        """, (order_id, user_email))
        order_to_cancel = cursor.fetchone()

        if order_to_cancel:
            cursor.execute("""
                INSERT INTO cancelled_orders (
                    order_id, Email, Instrument_Name, Quantity, Price,
                    Order_Date, Status, Cancellation_Reason, Cancellation_Date
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, CURRENT_DATE)
            """, (
                order_to_cancel[0], order_to_cancel[1], order_to_cancel[2],
                order_to_cancel[3], order_to_cancel[4], order_to_cancel[5], 'Cancelled', reason
            ))

            cursor.execute("DELETE FROM orders WHERE order_id=%s", (order_id,))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"success": True, "message": f"Order #{order_id} cancelled."})
        else:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "message": "Order not found or too old to cancel."}), 404

    except Exception:
        traceback.print_exc()
        if conn:
            try:
                conn.rollback()
                conn.close()
            except:
                pass
        return jsonify({"success": False, "message": "An unexpected error occurred."}), 500


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
    app.run(debug=True, port=8080)
