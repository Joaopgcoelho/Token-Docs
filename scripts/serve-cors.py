#!/usr/bin/env python3
"""Simple HTTP server with CORS headers for Figma plugin development."""
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

class CORSHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 3001
directory = sys.argv[2] if len(sys.argv) > 2 else '.'

import os
os.chdir(directory)
print(f"Serving {directory} on port {port} with CORS...")
HTTPServer(('', port), CORSHandler).serve_forever()
