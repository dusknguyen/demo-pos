import { useEffect } from "react";

interface UsePosKeyboardParams {
  onChangeUnit: () => void;
  onF3: () => void;
  onF4: () => void;
  onNextUnit: () => void;
  onPreviousUnit: () => void;
}

export function usePosKeyboard({
  onChangeUnit,
  onF3,
  onF4,
  onNextUnit,
  onPreviousUnit,
}: UsePosKeyboardParams): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const key = event.key.toLowerCase();

      if (event.altKey && key === "u") {
        event.preventDefault();
        onChangeUnit();
        return;
      }

      if (event.key === "F3") {
        event.preventDefault();
        onF3();
        return;
      }

      if (event.key === "F4") {
        event.preventDefault();
        onF4();
        return;
      }

      if (event.ctrlKey && event.altKey && event.key === "ArrowRight") {
        event.preventDefault();
        onNextUnit();
        return;
      }

      if (event.ctrlKey && event.altKey && event.key === "ArrowLeft") {
        event.preventDefault();
        onPreviousUnit();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onChangeUnit, onF3, onF4, onNextUnit, onPreviousUnit]);
}