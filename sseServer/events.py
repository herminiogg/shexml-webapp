from flask import Flask, Response
import time
import json
import random

app = Flask(__name__)

@app.route('/sse', defaults={'number_of_events': "10"})
@app.route('/sse/<number_of_events>')
def sse_handler(number_of_events):
  def event_stream():
    for i in range(1, int(number_of_events) + 1):
      print(f"Sending event {i}")
      event = f"""event: create
id: {i}
data: This is event {i}\n\n"""
      yield event
      time.sleep(2)
  return Response(event_stream(), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)