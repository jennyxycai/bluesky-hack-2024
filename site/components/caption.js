import { useState } from "react";

const samplePrompts = ["A portrait of a jazz musician lost in the music, playing a saxophone in a smoky, dimly lit club.",
"A dynamic portrait of a warrior from the distant future, wearing sleek, high-tech armor that glows with neon lights.",
"An elegant portrait of a Renaissance artist, brush in hand, as they gaze intently at the canvas before them.",
]

import sample from "lodash/sample";

export default function Caption(props) {
  const [prompt] = useState(sample(samplePrompts));
  const [image, setImage] = useState(null);

  return (
    <form
      onSubmit={props.onSubmit}
      className="py-5 animate-in fade-in duration-700"
    >
      <div className="flex max-w-[512px]">
        <input
          type="text"
          defaultValue={prompt}
          name="prompt"
          placeholder="Enter a tweet or describe the image..."
          className="block w-full flex-grow rounded-l-md"
        />

        <button
          className="bg-black text-white rounded-r-md text-small inline-block px-3 flex-none"
          type="submit"
        >
          Detect now
        </button>
      </div>
    </form>
  );
}
