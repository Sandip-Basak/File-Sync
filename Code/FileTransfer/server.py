from flask import Flask, request, send_from_directory, jsonify, render_template
from flask_cors import CORS
import os
import threading
import webbrowser
import time


app = Flask(__name__)
CORS(app)  # Allow cross-origin requests for mobile apps

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_files():
    if 'files' not in request.files:
        return {'status': 'fail', 'message': 'No files part in request'}, 400

    files = request.files.getlist('files')
    saved_files = []

    for file in files:
        if file.filename != '':
            file.save(os.path.join(UPLOAD_FOLDER, file.filename))
            saved_files.append(file.filename)

    return {'status': 'success', 'uploaded_files': saved_files}, 200

@app.route('/files', methods=['GET'])
def list_files():
    files = []
    for filename in os.listdir(UPLOAD_FOLDER):
        path = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.isfile(path):
            files.append({
                "name": filename,
                "size": os.path.getsize(path)
            })
    return jsonify(files)

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True)


@app.route('/delete/<filename>', methods=['DELETE'])
def delete_file(filename):
    try:
        path = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(path):
            os.remove(path)
            return {'status': 'success', 'message': 'File deleted'}, 200
        else:
            return {'status': 'fail', 'message': 'File not found'}, 404
    except Exception as e:
        return {'status': 'error', 'message': str(e)}, 500

def open_browser():
    time.sleep(1)  # Wait a moment for the server to start
    webbrowser.open_new("http://192.168.0.105:5000")  # Or replace with your IP and port

if __name__ == '__main__':
    # You can change port number if needed
    threading.Thread(target=open_browser).start()
    app.run(host='0.0.0.0', port=5000, debug=True)
