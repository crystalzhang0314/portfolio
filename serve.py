from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent


class PortfolioHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        if path.startswith("/project/"):
            return str(ROOT / "index.html")
        return super().translate_path(path)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8081), PortfolioHandler)
    print("Portfolio preview: http://127.0.0.1:8081/")
    server.serve_forever()
