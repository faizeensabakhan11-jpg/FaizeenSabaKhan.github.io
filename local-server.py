import http.server
import socketserver
import webbrowser
import threading
import sys
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def open_browser():
    # Delay browser opening slightly to ensure server is active
    import time
    time.sleep(1.0)
    print(f"\nOpening web browser at http://localhost:{PORT} ...")
    webbrowser.open(f"http://localhost:{PORT}")

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"\n=======================================================")
        print(f" Portfolio Local Testing Server Running!")
        print(f" - Local URL: http://localhost:{PORT}")
        print(f" - Serving Directory: {DIRECTORY}")
        print(f" - To shut down the server, press Ctrl+C in this console")
        print(f"=======================================================\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            sys.exit(0)

if __name__ == "__main__":
    # Start browser opener in a separate thread
    threading.Thread(target=open_browser, daemon=True).start()
    # Run the server
    run_server()
