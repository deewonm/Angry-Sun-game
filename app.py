from flask import Flask, render_template, request
from database import get_db, close_db

app = Flask(__name__)

app.teardown_appcontext(close_db)

@app.route("/")
def index():
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS high_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            score INTEGER NOT NULL
        )
    """)
    db.commit()
    return render_template("index.html")

@app.route("/game")
def game():
    return render_template("game.html")


@app.route("/store_score", methods=["POST"])
def store_score():
    score_value = request.form.get("score")
    if score_value:
        db = get_db()
        db.execute("""INSERT INTO high_scores (score)
                   VALUES (?)""", (score_value,))
        db.commit()

    return "success"

@app.route("/leaderboard")
def leaderboard():
    db = get_db()
    rows = db.execute("""SELECT score
                      FROM high_scores
                      ORDER BY score DESC LIMIT 10""").fetchall()
    return render_template("leaderboard.html", scores=rows)