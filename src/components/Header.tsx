import React from "react";

const Header = () => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
        Clipboard to Image
      </h1>
      <p className="mt-2 text-muted-foreground">
        Paste Image to Download
      </p>
    </div>
  );
};

export default Header;
