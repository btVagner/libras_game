import os
import sys
import threading
import time
import webbrowser

from app import app


def resource_path(relative_path):
    """
    Ajusta caminhos quando o app estiver rodando empacotado pelo PyInstaller.
    """
    try:
        base_path = sys._MEIPASS
    except AttributeError:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)


def abrir_navegador():
    time.sleep(1)
    webbrowser.open("http://127.0.0.1:5000")


if __name__ == "__main__":
    app.template_folder = resource_path("templates")
    app.static_folder = resource_path("static")

    threading.Thread(target=abrir_navegador, daemon=True).start()

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
        use_reloader=False
    )