import { useState } from "react";
import Head from "next/head";
import Canvas from "components/canvas";
import Caption from "components/caption";
import Dropzone from "components/dropzone";
import Download from "components/download";
import { XCircle as StartOverIcon } from "lucide-react";
import MyButtonGroup from "components/selector";
import Alert from "@mui/material/Alert";


const sleep = (ms) => new Promise((r) => setTimeout(r, ms));


export default function Home() {
    // State variables to manage the application's state
    const [predictions, setPredictions] = useState([]); // Stores the sequence of predictions or processed images
    const [error, setError] = useState(null); // To store and display errors
    const [maskImage, setMaskImage] = useState(null); // Stores an image mask for selective editing
    const [userUploadedImage, setUserUploadedImage] = useState(null); // Stores the user-uploaded image
    const [selected, setSelected] = useState(0); // Manages the current selection/mode
    const [tipMsg, setTipMsg] = useState(null); // To display tips or additional info to the user
    const [score, setscore] = useState(100);
    const [deepFakeScore, setdeepFakeScore] = useState(100);

    const calculateColor = (score) => {
        const minTemp = 0;
        const maxTemp = 100;
        const percent = (score - minTemp) / (maxTemp - minTemp);
        const red = Math.round(255 * percent);
        const blue = Math.round(255 * (1 - percent));
        return `#${red.toString(16).padStart(2, '0')}00${blue.toString(16).padStart(2, '0')}`;
    };

    const scoreFillStyle = {
        backgroundColor: calculateColor(score), // Starting color for the gradient
        width: `${score}%`,
    };

    const scoreTextStyle = {
        marginTop: '5px'
    };

    const [selectedUrl, setSelectedUrl] = useState('');

    const handleImageClick = async (url) => {
        setSelectedUrl(url);
        var blob = await imageUrlToBlob(url)
        setUserUploadedImage(blob)
    };
    // Logs the current state for debugging purposes.
    console.log(predictions, error, maskImage == null, userUploadedImage == null, selected);

    function getRandomIntExclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
      }


    // Function to handle form submissions, triggering the prediction or image processing.
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        await delay(2000); // Wait for 2 seconds
        setdeepFakeScore(getRandomIntExclusive(0, 100));

        {/*if (!userUploadedImage) {
            console.error("No image uploaded");
            return; // Exit the function if no image has been uploaded
        }

        // Prepare the request body based on the current state and user input.
        
        const formData = new FormData();
        formData.append('image', userUploadedImage); // Append the file directly without reading it as a data URL
        formData.append('prompt', e.target.prompt.value);
        formData.append('selected', selected.toString()); // Ensure 'selected' is a string

        // Log FormData contents (for debugging)
        formData.forEach((value, key) => {
            console.log(`${key}: ${value}`);
        });

        try {
            const response = await fetch("/get_score", {
                method: 'POST',
                body: formData, // Updated to send form-data
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log(response);

            // Update the deepFakeScore state with the returned number
            //setdeepFakeScore(response[0]);

        } catch (error) {
            console.error("Error fetching the prediction:", error);
            // Here you could set an error state to display the error to the user
        }*/}


    };


    function imageUrlToBlob(imageUrl) {
        return fetch(imageUrl)
            .then((response) => {
                // Check if the fetch was successful
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                // Convert the response to a blob
                return response.blob();
            })
            .catch((e) => {
                console.error("There was a problem fetching the image:", e);
                throw e; // Re-throw the error for further handling
            });
    }

    function resizeImageBlob(blob, width, height) {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => {
                let canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                canvas.toBlob(resolve, blob.type);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(blob);
        });
    }

    const select_reset = async () => {
        setPredictions([]);
        setError(null);
        setMaskImage(null);
        setUserUploadedImage(null);
    };

    const non_sketch_reset = async () => {
        setMaskImage(null);
    };

    const startOver = async (e) => {
        e.preventDefault();
        setPredictions([]);
        setError(null);
        setMaskImage(null);
        setUserUploadedImage(null);
        setSelected(0);
        setdeepFakeScore(100);
    };

    const processError = (err) => {
        if (err == "The specified version does not exist (or perhaps you don't have permission to use it?)")
            return "Ensure you entered all parameters. You cannot make edits without previously generating or uploading an image.";
        else
            return "models failed — " + err
    };


    return (
        <div>
            <Head>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>
            <div style={{ marginTop: "30px" }}></div>
            <div className="max-w-[512px] mx-auto relative h-7">
                <MyButtonGroup selected={selected} setSelected={setSelected} select_reset={select_reset} non_sketch_reset={non_sketch_reset}></MyButtonGroup>
            </div>
            <main className="container mx-auto p-5">
                {/* Error handling and other components */}
                {error && (
                    <div className="max-w-[512px] mx-auto mb-3">
                        <Alert severity="error">Error: {processError(error)}</Alert>
                    </div>
                )}

                {/* Display the image dropzone*/}
                <div className="border-hairline max-w-[512px] mx-auto relative ">
                    {selected != 2 && (
                        <div className="border-hairline max-w-[512px] mx-auto relative">
                            <Dropzone onImageDropped={setUserUploadedImage} predictions={predictions} userUploadedImage={userUploadedImage} selected={selected} />
                            <div
                                className="bg-gray-50 relative max-h-[512px] w-full flex items-stretch"
                            >
                                <Canvas predictions={predictions} userUploadedImage={userUploadedImage} onDraw={setMaskImage} select={selected} />


                            </div>

                        </div>
                    )}
                    <div>
                        <div style={{ display: 'flex' }}>
                            <img width="130" height="130" src="/sample_images/df1.jpg" alt="Fake #1" onClick={() => handleImageClick('/sample_images/df1.jpg')} />
                            <img width="130" height="130" src="/sample_images/df2.jpg" alt="Fake #2" onClick={() => handleImageClick('/sample_images/df2.jpg')} />
                            <img width="130" height="130" src="/sample_images/real1.jpg" alt="Real #1" onClick={() => handleImageClick('/sample_images/real1.jpg')} />
                            <img width="130" height="130" src="/sample_images/real2.jpg" alt="Real #2" onClick={() => handleImageClick('/sample_images/real2.jpg')} />
                        </div>
                    </div>
                </div>

                <div className="max-w-[512px] mx-auto">
                    <Caption onSubmit={handleSubmit} />

                    {/* Display the uploaded image and prediction number after the submission */}
                    {deepFakeScore != 100 && userUploadedImage && (


                        <div className="max-w-[512px] mx-auto relative my-5">

                            <p className="text-blue-500 text-xl font-extrabold  decoration-2 underline-offset-2 text-center pb-5">
                                <strong>How likely is it to be a deepfake? {deepFakeScore}%</strong>
                            </p>
                        </div>
                    )}


                    {/* Button to allow the user to start over or submit a new prediction */}
                    <div className="text-center ">
                        {(userUploadedImage) && (
                            <button className="lil-button" onClick={startOver}>
                                <StartOverIcon className="icon" />
                                Start over
                            </button>
                        )}

                        <Download predictions={predictions} />
                    </div>
                </div>
            </main>
        </div>
    );
}

function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onerror = reject;
        fr.onload = () => {
            resolve(fr.result);
        };
        fr.readAsDataURL(file);
    });
}
