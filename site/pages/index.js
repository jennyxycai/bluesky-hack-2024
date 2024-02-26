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
      
      <video autoPlay loop muted playsInline className="w-full cursor-pointer">
          <source src="/demo.mov" />
        </video>

      <ol className="list-decimal pl-5">
        <li className="mb-2">
          Upload your own image or select from our sample library containing a variety of Bluesky image thumbnails. An analysis of the image's deepfake content should be displayed within 5 seconds.
        </li>
        <li className="mb-2">
          Upload another image for more deepfake detection!
        </li>

      </ol>

      <Link href="/detect">
        <a className="py-3 block text-center bg-black text-white rounded-md mt-10">
          Detect now!
        </a>
      </Link>
    </div>
  );
}
