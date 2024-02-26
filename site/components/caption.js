import { useState } from "react";

const samplePrompts = ["A portrait of a politican shouting angrily at CNN ambassadors.",
"A man who resembles Superman.",
"A non-elegant portrait of Gal Gadot.",
]

import sample from "lodash/sample";

export default function Caption(props) {
  const [prompt] = useState(sample(samplePrompts));

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
