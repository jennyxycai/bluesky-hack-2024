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


    // Function to handle form submissions, triggering the prediction or image processing.
    const handleSubmit = async (e) => {
        e.preventDefault();

    // Prepare the request body based on the current state and user input.
        var body = {};
        var img = null;
    
        // Check if there's an uploaded image and resize it if present
        if (userUploadedImage) {
            img = await resizeImageBlob(userUploadedImage, 512, 512); // Resize the uploaded image for faster processing
            const imageDataUrl = await readAsDataURL(img); // Convert image to data URL for sending
            body = { image: imageDataUrl }; // Assuming the server expects an 'image' key with the data URL
        }
        
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };

        try {
            const response = await fetch("/get_notebook_output", requestOptions);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }    
            // Update the deepFakeScore state with the returned number
            setdeepFakeScore(response[0]);
    
        } catch (error) {
            console.error("Error fetching the prediction:", error);
            // Here you could set an error state to display the error to the user
        }


       {/* // request to an flask server endpoint for predictions
        const response = await fetch("/get_notebook_output")
            .then((response) => response.json())
            .catch((err) => {
                console.log(err)
            });


        const prediction = await response.json();

        // Error handling based on response status
        if (response.status !== 201) {
            setError(prediction.detail);
            return;
        }

        const numberOutput = prediction.number; // Access the number from the server response
        console.log(numberOutput); // For demonstration, log the number to the console

        // Instead of updating the predictions state with new image data,
        // update a state that holds the number prediction.
        // Also, there's no need to change the user uploaded image state.
        setPredictions([...predictions, { number: numberOutput }]); // Add the number prediction to the predictions state
        setdeepFakeScore(numberOutput);

        // Polling loop to check the status of the prediction until it's completed
        while (prediction.status !== "succeeded" && prediction.status !== "failed") {
            await sleep(1000); // Wait before each new status check
            const response = await fetch("/get_notebook_output" + prediction.id);
            prediction = await response.json();
            if (response.status !== 200) {
                setError(prediction.detail);
                return;
            }
            setPredictions(predictions.concat([prediction]));
            console.log(prediction);
            if (prediction.status === "succeeded") {
                var blob = await imageUrlToBlob(prediction.output[prediction.output.length - 1]);
                setUserUploadedImage(blob); // Update the user-uploaded image with the new prediction
            }
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
                            <div style={{ ...scoreFillStyle, height: `${score}%` }}>
                                <span style={scoreTextStyle}>{score}%</span>
                            </div>
                        </div>
                    )}
                    <div>
                    <div style={{ display: 'flex'}}>
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
                            <img src={URL.createObjectURL(userUploadedImage)} alt="Uploaded" className="mx-auto" />
                            <p className="text-center my-3">Deep Fake Score: {deepFakeScore}%</p>
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
