from flask import Flask, jsonify
import nbformat
from nbconvert.preprocessors import ExecutePreprocessor

app = Flask(__name__)

@app.route('/get_notebook_output')
def get_notebook_output():
    # Load the notebook
    with open('master_notebook.ipynb') as f:
        nb = nbformat.read(f, as_version=4)

    # Execute the notebook and capture the output
    ep = ExecutePreprocessor(timeout=2000, kernel_name='python3')
    ep.preprocess(nb)

    # Extract the output from the last cell
    output = nb.cells[-1].outputs[0].data['text/plain']

    # Return the output as a JSON response
    return jsonify(output=output)

if __name__ == '__main__':
    app.run(debug=True)