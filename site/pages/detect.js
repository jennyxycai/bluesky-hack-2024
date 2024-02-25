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
        var body;
        var img = userUploadedImage ? await resizeImageBlob(userUploadedImage, 512, 512) : null; // Resize the uploaded image for faster processing
        if (img) {
            // Input an image and and a caption
            body = {
                prompt: e.target.prompt.value,
                image: await readAsDataURL(img),
                selected: 0,
            };
        }

        // console.log(body);

        // HTTP POST request to an API endpoint for predictions
        const response = await fetch("/get_notebook_output", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        const prediction = await response.json();

        // Error handling based on response status
        if (response.status !== 201) {
            setError(prediction.detail);
            return;
        }

        // Assume the server response includes a number in a field named 'number'
        // TODO: replace the hardcoded predictions
        // You can adjust this based on your actual server response structure.
        const numberOutput = 50; //prediction.number; // Access the number from the server response
        setscore(numberOutput)
        // Instead of setting predictions with image data, you could store the number or handle it as needed
        console.log(numberOutput); // For demonstration, log the number to the console
        // Update the application state or UI based on the number here as needed
        // For example, you might want to display this number in the UI or use it in calculations

        // Instead of updating the predictions state with new image data,
        // update a state that holds the number prediction.
        // Also, there's no need to change the user uploaded image state.
        setPredictions([...predictions, { number: numberOutput }]); // Add the number prediction to the predictions state

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
        }
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
        return "Diffusion models failed — " + err
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

                <div className="border-hairline max-w-[512px] mx-auto relative ">
                    {selected != 2 && (
                        <div className="border-hairline max-w-[512px] mx-auto relative">
                            <Dropzone onImageDropped={setUserUploadedImage} predictions={predictions} userUploadedImage={userUploadedImage} selected = {selected}/>
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
      {/* <p>Selected URL: {selectedUrl}</p> */}
    </div>
                    </div>

                
                <div className="max-w-[512px] mx-auto">
                    <Caption onSubmit={handleSubmit} />

                    {/* Button to allow the user to start over or submit a new prediction */}
                    <div className="text-center ">
                        {((predictions.length > 0 && predictions[predictions.length - 1].output) || maskImage || userUploadedImage) && (
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
