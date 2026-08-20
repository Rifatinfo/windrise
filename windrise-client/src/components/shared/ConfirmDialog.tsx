import React, { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  trigger: ReactNode; // button or icon that opens the dialog
  title: string;
  description: string;
  onConfirm: () => void;
};

const ConfirmDialog = ({ trigger, title, description, onConfirm }: Props) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="max-w-sm bg-white rounded-xl shadow-xl ">
        <AlertDialogHeader className="p-5 text-center">
          <AlertDialogTitle className="text-lg font-bold text-black">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-gray-600 text-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex justify-center gap-4 p-5 bg-white">
          <AlertDialogCancel className="px-4 py-2 rounded-lg border hover:bg-white text-gray-700  transition cursor-pointer">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-700 text-white font-semibold   cursor-pointer"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
