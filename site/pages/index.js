import Link from "next/link";

export default function About() {
  return (
    <div className="max-w-[512px] mx-auto p-10 bg-white rounded-lg">

      <div className="text-left mb-5">
        <h1 className="text-5xl font-bold text-blue-500 text-center">Real or Not?</h1>
      </div>


      <div className="flex justify-center items-center h-[desired-height]">
  <p className="text-blue-500 text-xl font-extrabold  decoration-2 underline-offset-2 text-center pb-5">
    <strong>Deepfake detection on Bluesky.</strong>
  </p>
</div>

      <p className="pb-5 text-lg text-center">
        Real-time deeepfake detection using MesoNet trained on custom Bluesky image datasets. 
      </p>

      <p className="pb-5 text-lg text-center">
        [DEMO VIDEO]
      </p>

      <p className="pb-5 text-lg text-center">
        How to use this site:
      </p>
      

      <ol className="list-decimal pl-5">
        <li className="mb-2">
          Upload your own image or select from our sample library containing a variety of Bluesky image thumbnails. A detailed analysis of the image's deepfake content should be displayed within [X time].
        </li>
        <li className="mb-2">
          Upload a link to your BlueSky social media feed, and run our model on all images present within the web feed.
        </li>

      </ol>

      <Link href="/paint">
        <a className="py-3 block text-center bg-black text-white rounded-md mt-10">
          Detect now!
        </a>
      </Link>
    </div>
  );
}
