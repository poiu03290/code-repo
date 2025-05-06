import { createContext, ReactNode, useState } from "react";

type BottomSheetContents = ReactNode;
type BottomSheetHeight = "none" | "small" | "basic" | "large";

interface BottomSheetContextType {
  isOpen: boolean;
  contents: BottomSheetContents | null;
  height: BottomSheetHeight;
  openSheet: (contents: BottomSheetContents, height: BottomSheetHeight) => void;
  closeSheet: () => void;
  updateHeight: (height: BottomSheetHeight) => void;
}

export const BottomSheetContext = createContext<BottomSheetContextType | null>(
  null
);

export default function BottomSheetProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [contents, setContents] = useState<BottomSheetContents | null>(null);
  const [height, setHeight] = useState<BottomSheetHeight>("none");

  const openSheet = (
    contents: BottomSheetContents,
    height: BottomSheetHeight
  ) => {
    setContents(contents);
    setIsOpen(true);
    setHeight(height);
  };

  const closeSheet = () => {
    setIsOpen(false);
    setContents(null);
    setHeight("none");
  };

  const updateHeight = (newHeight: BottomSheetHeight) => {
    setHeight(newHeight);
  };

  return (
    <BottomSheetContext.Provider
      value={{ isOpen, contents, height, openSheet, closeSheet, updateHeight }}
    >
      {children}
    </BottomSheetContext.Provider>
  );
}
