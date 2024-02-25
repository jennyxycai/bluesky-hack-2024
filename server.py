from flask import Flask, jsonify, request
import nbformat
from nbconvert.preprocessors import ExecutePreprocessor
 
import numpy as np
import tensorflow
import matplotlib.pyplot as plt
from tensorflow.keras.layers import Input, Dense, Flatten, Conv2D, MaxPooling2D, BatchNormalization, Dropout, Reshape, Concatenate, LeakyReLU
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.models import Model

from PIL import Image
from io import BytesIO

app = Flask(__name__)

image_dimensions = {'height':256, 'width':256, 'channels':3}



class Classifier:
    def __init__(self):
        self.model = 0
    
    def predict(self, x):
        return self.model.predict(x)
    
    def fit(self, x, y):
        return self.model.train_on_batch(x, y)
    
    def get_accuracy(self, x, y):
        return self.model.test_on_batch(x, y)
    
    def load(self, path):
        self.model.load_weights(path)

class Meso4(Classifier):
    def __init__(self, learning_rate = 0.001):
        self.model = self.init_model()
        optimizer = Adam(lr = learning_rate)
        self.model.compile(optimizer = optimizer,
                           loss = 'mean_squared_error',
                           metrics = ['accuracy'])
    
    def init_model(self): 
        x = Input(shape = (image_dimensions['height'],
                           image_dimensions['width'],
                           image_dimensions['channels']))
        
        x1 = Conv2D(8, (3, 3), padding='same', activation = 'relu')(x)
        x1 = BatchNormalization()(x1)
        x1 = MaxPooling2D(pool_size=(2, 2), padding='same')(x1)
        
        x2 = Conv2D(8, (5, 5), padding='same', activation = 'relu')(x1)
        x2 = BatchNormalization()(x2)
        x2 = MaxPooling2D(pool_size=(2, 2), padding='same')(x2)
        
        x3 = Conv2D(16, (5, 5), padding='same', activation = 'relu')(x2)
        x3 = BatchNormalization()(x3)
        x3 = MaxPooling2D(pool_size=(2, 2), padding='same')(x3)
        
        x4 = Conv2D(16, (5, 5), padding='same', activation = 'relu')(x3)
        x4 = BatchNormalization()(x4)
        x4 = MaxPooling2D(pool_size=(4, 4), padding='same')(x4)
        
        y = Flatten()(x4)
        y = Dropout(0.5)(y)
        y = Dense(16)(y)
        y = LeakyReLU(alpha=0.1)(y)
        y = Dropout(0.5)(y)
        y = Dense(1, activation = 'sigmoid')(y)

        return Model(inputs = x, outputs = y)

meso = Meso4()
meso.load('Deepfake-detection/weights/Meso4_DF')

def load_and_preprocess_image(image_path, target_size=(256, 256)):
    # Load the image from the local filesystem
    img = Image.open(image_path)
    
    # Resize the image to the target size (e.g., 256x256 pixels for Meso4)
    img = img.resize(target_size)
    
    # Convert the image to a numpy array and normalize it
    img_array = np.array(img) / 255.0
    
    # MesoNet expects a batch dimension, so add an extra dimension to the array
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def predict_deepfake(image_url):
    img_array = load_and_preprocess_image(image_url)
    # Predict
    prediction = meso.predict(img_array)
    # Output the confidence score
    # The exact way to extract the confidence score depends on how `meso.predict` returns its prediction
    # This is a generic placeholder assuming it returns a single value or a value in a list/array
    confidence_score = prediction[0]
    return confidence_score

@app.route('/get_score',methods=['POST'])
async def get_score():
    body = await request.json()
    print("body",body)

    res = predict_deepfake(body['image'])
    print("RES",res)

    return res

if __name__ == '__main__':
    #score = predict_deepfake('datasets/coco128/images/train2017/000000000025.jpg')
    #print(score) # OUTPUT: [0.9942149]
    app.run(debug=True)