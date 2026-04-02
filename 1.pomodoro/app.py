from flask import Flask, render_template


def create_app() -> Flask:
	app = Flask(__name__)

	@app.get("/")
	def index() -> str:
		return render_template("index.html")

	@app.get("/health")
	def health() -> dict[str, str]:
		return {"status": "ok"}

	return app


app = create_app()


if __name__ == "__main__":
	app.run()
